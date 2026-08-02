const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;
const SHORT_BASE_URL = (process.env.SHORT_BASE_URL || '').replace(/\/$/, '');
const API_KEY = process.env.API_KEY || '';

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type,authorization,x-api-key',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function redirect(location) {
  return {
    statusCode: 302,
    headers: {
      location,
      'cache-control': 'no-store',
    },
    body: '',
  };
}

function makeId() {
  return crypto.randomBytes(6).toString('base64url');
}

function authorized(event) {
  if (!API_KEY) return true;

  const headers = event.headers || {};
  const apiKeyHeader =
    headers['x-api-key'] || headers['X-Api-Key'] || headers['X-API-KEY'];
  if (apiKeyHeader && apiKeyHeader === API_KEY) return true;

  const auth = headers.authorization || headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return Boolean(match && match[1] === API_KEY);
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  return JSON.parse(raw);
}

function routePath(event) {
  const raw =
    event.rawPath ||
    event.path ||
    event.requestContext?.http?.path ||
    '/';
  return raw.split('?')[0];
}

async function createShortLink(longUrl) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = makeId();
    try {
      await doc.send(
        new PutCommand({
          TableName: TABLE,
          Item: {
            id,
            url: longUrl,
            createdAt: new Date().toISOString(),
          },
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );
      return id;
    } catch (err) {
      if (err?.name !== 'ConditionalCheckFailedException') throw err;
    }
  }
  throw new Error('Could not allocate short id');
}

async function resolveId(id) {
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE,
      Key: { id },
    })
  );
  return result.Item?.url || null;
}

exports.handler = async (event) => {
  const method = (
    event.requestContext?.http?.method ||
    event.httpMethod ||
    'GET'
  ).toUpperCase();
  const path = routePath(event);

  if (method === 'OPTIONS') {
    return json(204, {});
  }

  // POST /shorten  (also accepts POST /)
  if (method === 'POST' && (path === '/shorten' || path === '/')) {
    if (!authorized(event)) {
      return json(401, { error: 'Unauthorized' });
    }

    let body;
    try {
      body = parseBody(event);
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }

    const longUrl = typeof body.url === 'string' ? body.url.trim() : '';
    if (!longUrl) {
      return json(400, { error: 'Missing url' });
    }

    try {
      new URL(longUrl);
    } catch {
      return json(400, { error: 'url must be an absolute URL' });
    }

    if (!SHORT_BASE_URL) {
      return json(500, { error: 'SHORT_BASE_URL is not configured' });
    }

    try {
      const id = await createShortLink(longUrl);
      return json(201, { shortUrl: `${SHORT_BASE_URL}/${id}` });
    } catch (err) {
      console.error(err);
      return json(500, { error: 'Failed to create short URL' });
    }
  }

  // GET /{id}
  if (method === 'GET') {
    const id = path.replace(/^\/+/, '').split('/')[0];
    if (!id || id === 'shorten') {
      return json(404, { error: 'Not found' });
    }

    try {
      const target = await resolveId(id);
      if (!target) return json(404, { error: 'Not found' });
      return redirect(target);
    } catch (err) {
      console.error(err);
      return json(500, { error: 'Lookup failed' });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
