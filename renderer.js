const baseUrlInput = document.getElementById('baseUrl');
const paramList = document.getElementById('paramList');
const addParamBtn = document.getElementById('addParam');
const encryptToggle = document.getElementById('encryptToggle');
const secretField = document.getElementById('secretField');
const encryptSecret = document.getElementById('encryptSecret');
const urlPreview = document.getElementById('urlPreview');
const generateBtn = document.getElementById('generate');
const output = document.getElementById('output');
const qrImage = document.getElementById('qrImage');
const qrCaption = document.getElementById('qrCaption');
const savePngBtn = document.getElementById('savePng');
const statusEl = document.getElementById('status');

let lastDataUrl = null;
let previewToken = 0;

const DEFAULT_PARAMS = [
  { key: 'deviceId', value: '' },
  { key: 'customerId', value: '' },
];

function setStatus(message, kind = '') {
  statusEl.textContent = message;
  statusEl.className = `status${kind ? ` ${kind}` : ''}`;
}

function createParamRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'param-row';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Key (e.g. deviceId)';
  keyInput.value = key;
  keyInput.autocomplete = 'off';
  keyInput.spellcheck = false;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Value';
  valueInput.value = value;
  valueInput.autocomplete = 'off';
  valueInput.spellcheck = false;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove';
  removeBtn.title = 'Remove field';
  removeBtn.setAttribute('aria-label', 'Remove field');
  removeBtn.textContent = '×';

  keyInput.addEventListener('input', updatePreview);
  valueInput.addEventListener('input', updatePreview);
  removeBtn.addEventListener('click', () => {
    row.remove();
    updatePreview();
  });

  row.append(keyInput, valueInput, removeBtn);
  return row;
}

function getParams() {
  return [...paramList.querySelectorAll('.param-row')].map((row) => {
    const [keyInput, valueInput] = row.querySelectorAll('input');
    return {
      key: keyInput.value.trim(),
      value: valueInput.value.trim(),
    };
  });
}

function paramsObject() {
  const obj = {};
  for (const { key, value } of getParams()) {
    if (!key) continue;
    obj[key] = value;
  }
  return obj;
}

function parseBaseUrl() {
  const base = baseUrlInput.value.trim();
  if (!base) return null;

  try {
    return new URL(base);
  } catch {
    try {
      return new URL(`https://${base}`);
    } catch {
      return null;
    }
  }
}

async function buildUrl() {
  const url = parseBaseUrl();
  if (!url) return null;

  if (encryptToggle.checked) {
    const secret = encryptSecret.value;
    if (!secret) {
      return { error: 'Enter an encryption secret to build code=' };
    }

    const payload = paramsObject();
    if (Object.keys(payload).length === 0) {
      return { error: 'Add at least one parameter to encrypt' };
    }

    const code = await window.qrForge.encryptParams(payload, secret);
    url.search = '';
    url.searchParams.set('code', code);
    return { url: url.toString() };
  }

  for (const { key, value } of getParams()) {
    if (!key) continue;
    url.searchParams.set(key, value);
  }

  return { url: url.toString() };
}

async function updatePreview() {
  const token = ++previewToken;
  secretField.hidden = !encryptToggle.checked;

  if (!baseUrlInput.value.trim()) {
    urlPreview.textContent = 'Enter a base URL to begin';
    generateBtn.disabled = true;
    return;
  }

  if (!parseBaseUrl()) {
    urlPreview.textContent = 'Invalid base URL';
    generateBtn.disabled = true;
    return;
  }

  try {
    const result = await buildUrl();
    if (token !== previewToken) return;

    if (!result) {
      urlPreview.textContent = 'Invalid base URL';
      generateBtn.disabled = true;
      return;
    }

    if (result.error) {
      urlPreview.textContent = result.error;
      generateBtn.disabled = true;
      return;
    }

    urlPreview.textContent = result.url;
    generateBtn.disabled = false;
  } catch (err) {
    if (token !== previewToken) return;
    console.error(err);
    urlPreview.textContent = 'Could not encrypt parameters';
    generateBtn.disabled = true;
  }
}

async function generateQr() {
  const result = await buildUrl();
  if (!result?.url) {
    setStatus(result?.error || 'Enter a valid base URL first.', 'error');
    return;
  }

  setStatus('Generating…');
  generateBtn.disabled = true;

  try {
    const dataUrl = await window.qrForge.generateQr(result.url);
    lastDataUrl = dataUrl;
    qrImage.src = dataUrl;
    qrCaption.textContent = result.url;
    output.hidden = false;
    setStatus(
      encryptToggle.checked ? 'Encrypted QR code ready.' : 'QR code ready.',
      'ok'
    );
  } catch (err) {
    console.error(err);
    setStatus('Could not generate QR code.', 'error');
  } finally {
    updatePreview();
  }
}

async function savePng() {
  if (!lastDataUrl) {
    setStatus('Generate a QR code first.', 'error');
    return;
  }

  try {
    const result = await window.qrForge.savePng(lastDataUrl);
    if (result.ok) {
      setStatus(`Saved to ${result.filePath}`, 'ok');
    } else {
      setStatus('Save cancelled.');
    }
  } catch (err) {
    console.error(err);
    setStatus('Could not save PNG.', 'error');
  }
}

function init() {
  for (const param of DEFAULT_PARAMS) {
    paramList.appendChild(createParamRow(param.key, param.value));
  }

  addParamBtn.addEventListener('click', () => {
    paramList.appendChild(createParamRow());
    updatePreview();
  });

  baseUrlInput.addEventListener('input', updatePreview);
  encryptToggle.addEventListener('change', updatePreview);
  encryptSecret.addEventListener('input', updatePreview);
  generateBtn.addEventListener('click', generateQr);
  savePngBtn.addEventListener('click', savePng);

  baseUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });
  encryptSecret.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });

  updatePreview();
  baseUrlInput.focus();
}

init();
