const appEl = document.querySelector('.app');
const brandSub = document.getElementById('brandSub');
const homeView = document.getElementById('homeView');
const urlView = document.getElementById('urlView');
const wifiView = document.getElementById('wifiView');
const contactView = document.getElementById('contactView');
const messageView = document.getElementById('messageView');
const textView = document.getElementById('textView');
const locationView = document.getElementById('locationView');
const eventView = document.getElementById('eventView');
const openUrlForge = document.getElementById('openUrlForge');
const openWifiForge = document.getElementById('openWifiForge');
const openContactForge = document.getElementById('openContactForge');
const openMessageForge = document.getElementById('openMessageForge');
const openTextForge = document.getElementById('openTextForge');
const openLocationForge = document.getElementById('openLocationForge');
const openEventForge = document.getElementById('openEventForge');

const baseUrlInput = document.getElementById('baseUrl');
const paramList = document.getElementById('paramList');
const addParamBtn = document.getElementById('addParam');
const paramsToggle = document.getElementById('paramsToggle');
const paramsFields = document.getElementById('paramsFields');
const encryptToggle = document.getElementById('encryptToggle');
const secretField = document.getElementById('secretField');
const encryptSecret = document.getElementById('encryptSecret');
const shortenToggle = document.getElementById('shortenToggle');
const shortenerFields = document.getElementById('shortenerFields');
const shortenerEndpoint = document.getElementById('shortenerEndpoint');
const shortenerApiKey = document.getElementById('shortenerApiKey');
const urlPreview = document.getElementById('urlPreview');
const generateBtn = document.getElementById('generate');
const saveWorkspaceBtn = document.getElementById('saveWorkspace');
const openWorkspaceBtn = document.getElementById('openWorkspace');
const output = document.getElementById('output');
const qrResult = document.getElementById('qrResult');
const qrImage = document.getElementById('qrImage');
const qrCaption = document.getElementById('qrCaption');
const savePngBtn = document.getElementById('savePng');

const wifiSsid = document.getElementById('wifiSsid');
const wifiSecurity = document.getElementById('wifiSecurity');
const wifiPasswordField = document.getElementById('wifiPasswordField');
const wifiPassword = document.getElementById('wifiPassword');
const wifiHidden = document.getElementById('wifiHidden');
const wifiPreview = document.getElementById('wifiPreview');
const wifiGenerateBtn = document.getElementById('wifiGenerate');
const wifiOutput = document.getElementById('wifiOutput');
const wifiQrResult = document.getElementById('wifiQrResult');
const wifiQrImage = document.getElementById('wifiQrImage');
const wifiQrCaption = document.getElementById('wifiQrCaption');
const wifiSavePngBtn = document.getElementById('wifiSavePng');

const contactFirst = document.getElementById('contactFirst');
const contactLast = document.getElementById('contactLast');
const contactPhone = document.getElementById('contactPhone');
const contactEmail = document.getElementById('contactEmail');
const contactOrg = document.getElementById('contactOrg');
const contactTitle = document.getElementById('contactTitle');
const contactWebsite = document.getElementById('contactWebsite');
const contactPreview = document.getElementById('contactPreview');
const contactGenerateBtn = document.getElementById('contactGenerate');
const contactOutput = document.getElementById('contactOutput');
const contactQrResult = document.getElementById('contactQrResult');
const contactQrImage = document.getElementById('contactQrImage');
const contactQrCaption = document.getElementById('contactQrCaption');
const contactSavePngBtn = document.getElementById('contactSavePng');

const messageType = document.getElementById('messageType');
const messageEmailFields = document.getElementById('messageEmailFields');
const messageSmsFields = document.getElementById('messageSmsFields');
const messageTelFields = document.getElementById('messageTelFields');
const messageEmail = document.getElementById('messageEmail');
const messageSubject = document.getElementById('messageSubject');
const messageBody = document.getElementById('messageBody');
const messageSmsPhone = document.getElementById('messageSmsPhone');
const messageSmsBody = document.getElementById('messageSmsBody');
const messageTelPhone = document.getElementById('messageTelPhone');
const messagePreview = document.getElementById('messagePreview');
const messageGenerateBtn = document.getElementById('messageGenerate');
const messageOutput = document.getElementById('messageOutput');
const messageQrResult = document.getElementById('messageQrResult');
const messageQrImage = document.getElementById('messageQrImage');
const messageQrCaption = document.getElementById('messageQrCaption');
const messageSavePngBtn = document.getElementById('messageSavePng');

const textContent = document.getElementById('textContent');
const textPreview = document.getElementById('textPreview');
const textGenerateBtn = document.getElementById('textGenerate');
const textOutput = document.getElementById('textOutput');
const textQrResult = document.getElementById('textQrResult');
const textQrImage = document.getElementById('textQrImage');
const textQrCaption = document.getElementById('textQrCaption');
const textSavePngBtn = document.getElementById('textSavePng');

const locationLat = document.getElementById('locationLat');
const locationLng = document.getElementById('locationLng');
const locationLabel = document.getElementById('locationLabel');
const locationPreview = document.getElementById('locationPreview');
const locationGenerateBtn = document.getElementById('locationGenerate');
const locationOutput = document.getElementById('locationOutput');
const locationQrResult = document.getElementById('locationQrResult');
const locationQrImage = document.getElementById('locationQrImage');
const locationQrCaption = document.getElementById('locationQrCaption');
const locationSavePngBtn = document.getElementById('locationSavePng');

const eventTitle = document.getElementById('eventTitle');
const eventStart = document.getElementById('eventStart');
const eventEnd = document.getElementById('eventEnd');
const eventLocation = document.getElementById('eventLocation');
const eventDescription = document.getElementById('eventDescription');
const eventPreview = document.getElementById('eventPreview');
const eventGenerateBtn = document.getElementById('eventGenerate');
const eventOutput = document.getElementById('eventOutput');
const eventQrResult = document.getElementById('eventQrResult');
const eventQrImage = document.getElementById('eventQrImage');
const eventQrCaption = document.getElementById('eventQrCaption');
const eventSavePngBtn = document.getElementById('eventSavePng');

const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const themeToggleLabel = document.getElementById('themeToggleLabel');

let lastDataUrl = null;
let lastResultUrl = null;
let lastLongUrl = null;
let lastShortUrl = null;
let shortForLongUrl = null;
let lastWifiDataUrl = null;
let previewToken = 0;
let wifiPreviewToken = 0;
let cacheTimer = null;
let wifiCacheTimer = null;
let prefsTimer = null;
let applyingWorkspace = false;

const THEME_KEY = 'qr-forge-theme';
const WIFI_CACHE_KEY = 'qr-forge-wifi-cache';
const THEME_BG = {
  light: '#ecebf8',
  dark: '#1a1c31',
};
const VIEW_SUBTITLES = {
  home: 'Choose a forge to begin.',
  url: 'Build a URL. Stamp a code.',
  wifi: 'Share a network. Scan to connect.',
  contact: 'Share a contact. Scan to save.',
  message: 'Open email, SMS, or a phone call.',
  text: 'Encode any plain text.',
  location: 'Drop a pin. Scan to navigate.',
  event: 'Add an event to the calendar.',
};

const VIEWS = {
  home: homeView,
  url: urlView,
  wifi: wifiView,
  contact: contactView,
  message: messageView,
  text: textView,
  location: locationView,
  event: eventView,
};

const forgeHandlers = {};

const DEFAULT_PARAMS = [{ key: '', value: '' }];

function setStatus(message, kind = '') {
  statusEl.textContent = message;
  statusEl.className = `status${kind ? ` ${kind}` : ''}`;
}

function showView(view) {
  for (const [name, el] of Object.entries(VIEWS)) {
    el.hidden = name !== view;
  }
  appEl.dataset.view = view;
  brandSub.textContent = VIEW_SUBTITLES[view] || VIEW_SUBTITLES.home;
  forgeHandlers[view]?.onShow?.();
}

function createParamRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'param-row';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Parameter name';
  keyInput.setAttribute('aria-label', 'Parameter name');
  keyInput.value = key;
  keyInput.autocomplete = 'off';
  keyInput.spellcheck = false;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Value';
  valueInput.setAttribute('aria-label', 'Parameter value');
  valueInput.value = value;
  valueInput.autocomplete = 'off';
  valueInput.spellcheck = false;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove';
  removeBtn.title = 'Remove field';
  removeBtn.setAttribute('aria-label', 'Remove field');
  removeBtn.textContent = '×';

  keyInput.addEventListener('input', onWorkspaceChange);
  valueInput.addEventListener('input', onWorkspaceChange);
  removeBtn.addEventListener('click', () => {
    row.remove();
    onWorkspaceChange();
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

function setParams(params) {
  paramList.replaceChildren();
  const rows = Array.isArray(params) ? params : DEFAULT_PARAMS;
  for (const param of rows) {
    paramList.appendChild(
      createParamRow(param?.key || '', param?.value || '')
    );
  }
}

function paramsObject() {
  if (!paramsToggle.checked) return {};

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

function syncOptionFields() {
  paramsFields.hidden = !paramsToggle.checked;
  secretField.hidden = !encryptToggle.checked;
  shortenerFields.hidden = !shortenToggle.checked;

  if (paramsToggle.checked && !paramList.children.length) {
    paramList.appendChild(createParamRow());
  }
}

function collectWorkspace() {
  return {
    version: 1,
    baseUrl: baseUrlInput.value.trim(),
    paramsEnabled: paramsToggle.checked,
    params: getParams(),
    encrypt: encryptToggle.checked,
    shorten: shortenToggle.checked,
    shortenerEndpoint: shortenerEndpoint.value.trim(),
    longUrl: lastLongUrl,
    resultUrl: lastResultUrl,
    qrDataUrl: lastDataUrl,
  };
}

function showQr(dataUrl, resultUrl, longUrl = null, shortUrl = null) {
  lastDataUrl = dataUrl || null;
  lastResultUrl = resultUrl || null;
  lastLongUrl = longUrl || resultUrl || null;
  lastShortUrl = shortUrl || null;
  shortForLongUrl = shortUrl ? lastLongUrl : null;

  if (dataUrl) {
    qrImage.src = dataUrl;
    qrCaption.textContent = resultUrl || '';
    qrResult.hidden = false;
    output.dataset.state = 'ready';
  } else {
    qrImage.removeAttribute('src');
    qrCaption.textContent = '';
    qrResult.hidden = true;
    output.dataset.state = 'empty';
    lastShortUrl = null;
    shortForLongUrl = null;
  }
}

function showWifiQr(dataUrl, caption = '') {
  lastWifiDataUrl = dataUrl || null;

  if (dataUrl) {
    wifiQrImage.src = dataUrl;
    wifiQrCaption.textContent = caption;
    wifiQrResult.hidden = false;
    wifiOutput.dataset.state = 'ready';
  } else {
    wifiQrImage.removeAttribute('src');
    wifiQrCaption.textContent = '';
    wifiQrResult.hidden = true;
    wifiOutput.dataset.state = 'empty';
  }
}

function escapeWifiField(value) {
  return String(value).replace(/([\\;,"])/g, '\\$1');
}

function buildWifiPayload() {
  const ssid = wifiSsid.value.trim();
  if (!ssid) {
    return { error: 'Enter a network name (SSID).' };
  }

  const security = wifiSecurity.value;
  const hidden = wifiHidden.checked;
  const password = wifiPassword.value;

  if (security !== 'nopass' && !password) {
    return { error: 'Enter the network password.' };
  }

  let payload = `WIFI:T:${security};S:${escapeWifiField(ssid)};`;
  if (security !== 'nopass') {
    payload += `P:${escapeWifiField(password)};`;
  }
  payload += `H:${hidden ? 'true' : 'false'};;`;

  return { payload, caption: ssid };
}

function maskWifiPreview(payload, security, password) {
  if (security === 'nopass' || !password) return payload;

  return payload.replace(
    `P:${escapeWifiField(password)};`,
    `P:${'*'.repeat(Math.min(password.length, 12))};`
  );
}

function syncWifiFields() {
  const openNetwork = wifiSecurity.value === 'nopass';
  wifiPasswordField.hidden = openNetwork;
  if (openNetwork) {
    wifiPassword.value = '';
  }
}

function collectWifiCache() {
  return {
    ssid: wifiSsid.value,
    security: wifiSecurity.value,
    password: wifiPassword.value,
    hidden: wifiHidden.checked,
    qrDataUrl: lastWifiDataUrl,
  };
}

function applyWifiCache(cache) {
  if (!cache || typeof cache !== 'object') return;

  wifiSsid.value = cache.ssid || '';
  wifiSecurity.value = cache.security || 'WPA';
  wifiPassword.value = cache.password || '';
  wifiHidden.checked = Boolean(cache.hidden);
  syncWifiFields();
  showWifiQr(cache.qrDataUrl || null, cache.ssid || '');
}

function scheduleWifiCache() {
  clearTimeout(wifiCacheTimer);
  wifiCacheTimer = setTimeout(() => {
    try {
      localStorage.setItem(WIFI_CACHE_KEY, JSON.stringify(collectWifiCache()));
    } catch (err) {
      console.error(err);
    }
  }, 300);
}

function onWifiChange() {
  syncWifiFields();
  updateWifiPreview();
  scheduleWifiCache();
}

async function updateWifiPreview() {
  const token = ++wifiPreviewToken;
  syncWifiFields();

  if (!wifiSsid.value.trim()) {
    wifiPreview.textContent = 'Enter a network name to begin';
    wifiGenerateBtn.disabled = true;
    return;
  }

  const result = buildWifiPayload();
  if (token !== wifiPreviewToken) return;

  if (result.error) {
    wifiPreview.textContent = result.error;
    wifiGenerateBtn.disabled = true;
    return;
  }

  wifiPreview.textContent = maskWifiPreview(
    result.payload,
    wifiSecurity.value,
    wifiPassword.value
  );
  wifiGenerateBtn.disabled = false;
}

async function generateWifiQr() {
  const result = buildWifiPayload();
  if (!result.payload) {
    setStatus(result.error || 'Enter valid WiFi details.', 'error');
    return;
  }

  setStatus('Generating…');
  wifiGenerateBtn.disabled = true;

  try {
    const dataUrl = await window.qrForge.generateQr(result.payload);
    showWifiQr(dataUrl, result.caption);
    scheduleWifiCache();
    setStatus(`WiFi QR ready for ${result.caption}.`, 'ok');
  } catch (err) {
    console.error(err);
    setStatus(String(err?.message || 'Could not generate QR code.'), 'error');
  } finally {
    updateWifiPreview();
  }
}

async function saveWifiPng() {
  if (!lastWifiDataUrl) {
    setStatus('Generate a QR code first.', 'error');
    return;
  }

  try {
    const result = await window.qrForge.savePng(lastWifiDataUrl);
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

function applyWorkspace(workspace) {
  if (!workspace || typeof workspace !== 'object') return;

  applyingWorkspace = true;
  try {
    baseUrlInput.value = workspace.baseUrl || '';
    setParams(workspace.params);
    paramsToggle.checked =
      typeof workspace.paramsEnabled === 'boolean'
        ? workspace.paramsEnabled
        : Boolean(workspace.params?.some((p) => p?.key || p?.value));
    encryptToggle.checked = Boolean(workspace.encrypt);
    shortenToggle.checked = Boolean(workspace.shorten);
    if (typeof workspace.shortenerEndpoint === 'string') {
      shortenerEndpoint.value = workspace.shortenerEndpoint;
    }
    encryptSecret.value = '';
    syncOptionFields();
    const restoredShort =
      workspace.longUrl &&
      workspace.resultUrl &&
      workspace.resultUrl !== workspace.longUrl
        ? workspace.resultUrl
        : null;
    showQr(
      workspace.qrDataUrl || null,
      workspace.resultUrl || null,
      workspace.longUrl || null,
      restoredShort
    );
  } finally {
    applyingWorkspace = false;
  }
}

function scheduleWorkspaceCache() {
  if (applyingWorkspace) return;
  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => {
    window.qrForge.setWorkspaceCache(collectWorkspace()).catch((err) => {
      console.error(err);
    });
  }, 300);
}

function scheduleShortenerPrefs() {
  if (applyingWorkspace) return;
  clearTimeout(prefsTimer);
  prefsTimer = setTimeout(() => {
    window.qrForge
      .setPreferences({
        shortenerEndpoint: shortenerEndpoint.value.trim(),
        shortenerApiKey: shortenerApiKey.value,
      })
      .catch((err) => {
        console.error(err);
      });
  }, 300);
}

function onWorkspaceChange() {
  syncOptionFields();
  updatePreview();
  scheduleWorkspaceCache();
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
    const code = await window.qrForge.encryptParams(payload, secret);
    url.search = '';
    url.searchParams.set('code', code);
    return { url: url.toString() };
  }

  for (const { key, value } of paramsToggle.checked ? getParams() : []) {
    if (!key) continue;
    url.searchParams.set(key, value);
  }

  return { url: url.toString() };
}

async function updatePreview() {
  const token = ++previewToken;
  syncOptionFields();

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

  if (shortenToggle.checked && !shortenerEndpoint.value.trim()) {
    urlPreview.textContent =
      'Shorten URL is on — enter your shortener API endpoint, then click Generate.';
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

    if (shortenToggle.checked) {
      if (lastShortUrl && shortForLongUrl === result.url) {
        urlPreview.textContent = `Full URL:\n${result.url}\n\nShort URL (in QR):\n${lastShortUrl}`;
      } else {
        urlPreview.textContent = `Full URL:\n${result.url}\n\nClick Generate to shorten this via your API.`;
      }
    } else {
      urlPreview.textContent = result.url;
    }
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

  if (shortenToggle.checked && !shortenerEndpoint.value.trim()) {
    setStatus('Enter a shortener endpoint first.', 'error');
    return;
  }

  setStatus(shortenToggle.checked ? 'Shortening URL…' : 'Generating…');
  generateBtn.disabled = true;

  try {
    const longUrl = result.url;
    let finalUrl = longUrl;
    let shortUrl = null;

    if (shortenToggle.checked) {
      shortUrl = await window.qrForge.shortenUrl(
        longUrl,
        shortenerEndpoint.value.trim(),
        shortenerApiKey.value
      );
      finalUrl = shortUrl;
    }

    const dataUrl = await window.qrForge.generateQr(finalUrl);
    showQr(dataUrl, finalUrl, longUrl, shortUrl);
    scheduleWorkspaceCache();
    setStatus(
      shortUrl
        ? `Short QR ready: ${shortUrl}`
        : encryptToggle.checked
          ? 'Encrypted QR code ready.'
          : 'QR code ready.',
      'ok'
    );
  } catch (err) {
    console.error(err);
    const message = String(err?.message || 'Could not generate QR code.');
    setStatus(
      shortenToggle.checked
        ? `Shorten failed — ${message}`
        : message,
      'error'
    );
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

async function saveWorkspace() {
  try {
    const result = await window.qrForge.saveWorkspace(collectWorkspace());
    if (result.ok) {
      setStatus(`Workspace saved to ${result.filePath}`, 'ok');
    } else {
      setStatus('Workspace save cancelled.');
    }
  } catch (err) {
    console.error(err);
    setStatus('Could not save workspace.', 'error');
  }
}

async function openWorkspace() {
  try {
    const result = await window.qrForge.openWorkspace();
    if (!result.ok) {
      if (result.error) {
        setStatus(result.error, 'error');
      } else {
        setStatus('Open cancelled.');
      }
      return;
    }

    applyWorkspace(result.workspace);
    await updatePreview();
    const needsSecret = result.workspace?.encrypt
      ? ' Re-enter the encryption secret if you need a new code= URL.'
      : '';
    setStatus(`Workspace opened from ${result.filePath}.${needsSecret}`, 'ok');
  } catch (err) {
    console.error(err);
    setStatus('Could not open workspace.', 'error');
  }
}

function getTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

function syncThemeUi(theme) {
  const nextLabel = theme === 'dark' ? 'Light' : 'Dark';
  themeToggleLabel.textContent = nextLabel;
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  );
  if (window.qrForge?.setWindowBg) {
    window.qrForge.setWindowBg(THEME_BG[theme]);
  }
}

function setTheme(theme, { persist = true } = {}) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // ignore storage failures
  }
  if (persist) {
    window.qrForge.setPreferences({ theme: next }).catch((err) => {
      console.error(err);
    });
  }
  syncThemeUi(next);
}

function initTheme() {
  syncThemeUi(getTheme());
  themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

function restoreWifiCache() {
  try {
    const raw = localStorage.getItem(WIFI_CACHE_KEY);
    if (!raw) return;
    applyWifiCache(JSON.parse(raw));
  } catch (err) {
    console.error(err);
  }
}

async function restoreSession() {
  try {
    const [prefs, cached] = await Promise.all([
      window.qrForge.getPreferences(),
      window.qrForge.getWorkspaceCache(),
    ]);

    if (prefs?.theme === 'dark' || prefs?.theme === 'light') {
      setTheme(prefs.theme, { persist: false });
    }

    if (typeof prefs?.shortenerEndpoint === 'string') {
      shortenerEndpoint.value = prefs.shortenerEndpoint;
    }
    if (typeof prefs?.shortenerApiKey === 'string') {
      shortenerApiKey.value = prefs.shortenerApiKey;
    }

    if (cached?.version) {
      applyWorkspace(cached);
    } else {
      setParams([]);
    }
  } catch (err) {
    console.error(err);
    setParams([]);
  }

  restoreWifiCache();
  restoreSimpleForgeCaches();
}

function initNavigation() {
  openUrlForge.addEventListener('click', () => showView('url'));
  openWifiForge.addEventListener('click', () => showView('wifi'));
  openContactForge.addEventListener('click', () => showView('contact'));
  openMessageForge.addEventListener('click', () => showView('message'));
  openTextForge.addEventListener('click', () => showView('text'));
  openLocationForge.addEventListener('click', () => showView('location'));
  openEventForge.addEventListener('click', () => showView('event'));

  for (const btn of document.querySelectorAll('[data-view-back]')) {
    btn.addEventListener('click', () => showView('home'));
  }
}

function syncMessageFields() {
  const type = messageType.value;
  messageEmailFields.hidden = type !== 'email';
  messageSmsFields.hidden = type !== 'sms';
  messageTelFields.hidden = type !== 'tel';
}

function buildContactPayload() {
  const first = contactFirst.value.trim();
  const last = contactLast.value.trim();
  const phone = contactPhone.value.trim();
  const email = contactEmail.value.trim();
  const org = contactOrg.value.trim();
  const title = contactTitle.value.trim();
  const website = contactWebsite.value.trim();

  if (!first && !last && !phone && !email) {
    return { empty: true, emptyMessage: 'Enter contact details to begin' };
  }

  const fn = [first, last].filter(Boolean).join(' ') || email || phone;
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCardValue(fn)}`];
  if (first || last) {
    lines.push(`N:${escapeVCardValue(last)};${escapeVCardValue(first)};;;`);
  }
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(phone)}`);
  if (email) lines.push(`EMAIL:${escapeVCardValue(email)}`);
  if (org) lines.push(`ORG:${escapeVCardValue(org)}`);
  if (title) lines.push(`TITLE:${escapeVCardValue(title)}`);
  if (website) lines.push(`URL:${escapeVCardValue(website)}`);
  lines.push('END:VCARD');

  return { payload: lines.join('\n'), caption: fn };
}

function buildMessagePayload() {
  const type = messageType.value;

  if (type === 'email') {
    const email = messageEmail.value.trim();
    if (!email) {
      return { empty: true, emptyMessage: 'Choose a message type to begin' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Enter a valid email address.' };
    }

    const subject = messageSubject.value.trim();
    const body = messageBody.value.trim();
    let payload = `mailto:${email}`;
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (body) params.set('body', body);
    const qs = params.toString();
    if (qs) payload += `?${qs}`;
    return { payload, caption: email };
  }

  if (type === 'sms') {
    const phone = messageSmsPhone.value.trim();
    if (!phone) {
      return { empty: true, emptyMessage: 'Choose a message type to begin' };
    }

    const body = messageSmsBody.value.trim();
    let payload = `sms:${phone}`;
    if (body) payload += `?body=${encodeURIComponent(body)}`;
    return { payload, caption: phone };
  }

  const phone = messageTelPhone.value.trim();
  if (!phone) {
    return { empty: true, emptyMessage: 'Choose a message type to begin' };
  }

  return { payload: `tel:${phone}`, caption: phone };
}

function buildTextPayload() {
  const text = textContent.value;
  if (!text.trim()) {
    return { empty: true, emptyMessage: 'Enter text to begin' };
  }

  return {
    payload: text,
    caption: truncatePreview(text.replace(/\s+/g, ' ').trim(), 48),
  };
}

function buildLocationPayload() {
  const latStr = locationLat.value.trim();
  const lngStr = locationLng.value.trim();

  if (!latStr && !lngStr) {
    return { empty: true, emptyMessage: 'Enter coordinates to begin' };
  }

  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: 'Enter a valid latitude (-90 to 90).' };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: 'Enter a valid longitude (-180 to 180).' };
  }

  const label = locationLabel.value.trim();
  let payload = `geo:${lat},${lng}`;
  if (label) payload += `?q=${encodeURIComponent(label)}`;

  return { payload, caption: label || `${lat}, ${lng}` };
}

function buildEventPayload() {
  const title = eventTitle.value.trim();
  const start = eventStart.value;
  const end = eventEnd.value;
  const location = eventLocation.value.trim();
  const description = eventDescription.value.trim();

  if (!title && !start) {
    return { empty: true, emptyMessage: 'Enter event details to begin' };
  }
  if (!title) return { error: 'Enter an event title.' };
  if (!start) return { error: 'Enter a start date and time.' };
  if (!end) return { error: 'Enter an end date and time.' };

  const startIcs = toIcsDateTime(start);
  const endIcs = toIcsDateTime(end);
  if (!startIcs || !endIcs) {
    return { error: 'Enter valid start and end times.' };
  }
  if (new Date(end) <= new Date(start)) {
    return { error: 'End time must be after start time.' };
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeVCardValue(title)}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
  ];
  if (location) lines.push(`LOCATION:${escapeVCardValue(location)}`);
  if (description) lines.push(`DESCRIPTION:${escapeVCardValue(description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return { payload: lines.join('\n'), caption: title };
}

function initSimpleForges() {
  forgeHandlers.url = {
    onShow() {
      syncOptionFields();
      updatePreview();
      if (!baseUrlInput.value) baseUrlInput.focus();
    },
  };

  forgeHandlers.wifi = {
    onShow() {
      syncWifiFields();
      updateWifiPreview();
      if (!wifiSsid.value) wifiSsid.focus();
    },
  };

  forgeHandlers.contact = createSimpleForge({
    setStatus,
    cacheKey: 'qr-forge-contact-cache',
    previewEl: contactPreview,
    generateBtn: contactGenerateBtn,
    outputEl: contactOutput,
    qrResultEl: contactQrResult,
    qrImageEl: contactQrImage,
    qrCaptionEl: contactQrCaption,
    savePngBtn: contactSavePngBtn,
    build: buildContactPayload,
    focusEl: contactFirst,
    inputEls: [
      contactFirst,
      contactLast,
      contactPhone,
      contactEmail,
      contactOrg,
      contactTitle,
      contactWebsite,
    ],
    collectCache: () => ({
      first: contactFirst.value,
      last: contactLast.value,
      phone: contactPhone.value,
      email: contactEmail.value,
      org: contactOrg.value,
      title: contactTitle.value,
      website: contactWebsite.value,
    }),
    applyCache: (cache) => {
      contactFirst.value = cache.first || '';
      contactLast.value = cache.last || '';
      contactPhone.value = cache.phone || '';
      contactEmail.value = cache.email || '';
      contactOrg.value = cache.org || '';
      contactTitle.value = cache.title || '';
      contactWebsite.value = cache.website || '';
      const built = buildContactPayload();
      forgeHandlers.contact.showQr(cache.qrDataUrl || null, built.caption || '');
    },
    successMessage: (caption) => `Contact QR ready for ${caption}.`,
  });

  forgeHandlers.message = createSimpleForge({
    setStatus,
    cacheKey: 'qr-forge-message-cache',
    previewEl: messagePreview,
    generateBtn: messageGenerateBtn,
    outputEl: messageOutput,
    qrResultEl: messageQrResult,
    qrImageEl: messageQrImage,
    qrCaptionEl: messageQrCaption,
    savePngBtn: messageSavePngBtn,
    build: buildMessagePayload,
    sync: syncMessageFields,
    inputEls: [
      messageType,
      messageEmail,
      messageSubject,
      messageBody,
      messageSmsPhone,
      messageSmsBody,
      messageTelPhone,
    ],
    collectCache: () => ({
      type: messageType.value,
      email: messageEmail.value,
      subject: messageSubject.value,
      body: messageBody.value,
      smsPhone: messageSmsPhone.value,
      smsBody: messageSmsBody.value,
      telPhone: messageTelPhone.value,
    }),
    applyCache: (cache) => {
      messageType.value = cache.type || 'email';
      messageEmail.value = cache.email || '';
      messageSubject.value = cache.subject || '';
      messageBody.value = cache.body || '';
      messageSmsPhone.value = cache.smsPhone || '';
      messageSmsBody.value = cache.smsBody || '';
      messageTelPhone.value = cache.telPhone || '';
      syncMessageFields();
      const built = buildMessagePayload();
      forgeHandlers.message.showQr(
        cache.qrDataUrl || null,
        built.caption || ''
      );
    },
    emptyMessage: 'Choose a message type to begin',
    successMessage: (caption) => `Message QR ready for ${caption}.`,
  });

  const messageOnShow = forgeHandlers.message.onShow;
  forgeHandlers.message.onShow = () => {
    messageOnShow();
    const focusMap = {
      email: messageEmail,
      sms: messageSmsPhone,
      tel: messageTelPhone,
    };
    focusMap[messageType.value]?.focus?.();
  };

  forgeHandlers.text = createSimpleForge({
    setStatus,
    cacheKey: 'qr-forge-text-cache',
    previewEl: textPreview,
    generateBtn: textGenerateBtn,
    outputEl: textOutput,
    qrResultEl: textQrResult,
    qrImageEl: textQrImage,
    qrCaptionEl: textQrCaption,
    savePngBtn: textSavePngBtn,
    build: buildTextPayload,
    focusEl: textContent,
    inputEls: [textContent],
    collectCache: () => ({ text: textContent.value }),
    applyCache: (cache) => {
      textContent.value = cache.text || '';
      const built = buildTextPayload();
      forgeHandlers.text.showQr(cache.qrDataUrl || null, built.caption || '');
    },
    emptyMessage: 'Enter text to begin',
    successMessage: () => 'Text QR ready.',
  });

  forgeHandlers.location = createSimpleForge({
    setStatus,
    cacheKey: 'qr-forge-location-cache',
    previewEl: locationPreview,
    generateBtn: locationGenerateBtn,
    outputEl: locationOutput,
    qrResultEl: locationQrResult,
    qrImageEl: locationQrImage,
    qrCaptionEl: locationQrCaption,
    savePngBtn: locationSavePngBtn,
    build: buildLocationPayload,
    focusEl: locationLat,
    inputEls: [locationLat, locationLng, locationLabel],
    collectCache: () => ({
      lat: locationLat.value,
      lng: locationLng.value,
      label: locationLabel.value,
    }),
    applyCache: (cache) => {
      locationLat.value = cache.lat || '';
      locationLng.value = cache.lng || '';
      locationLabel.value = cache.label || '';
      const built = buildLocationPayload();
      forgeHandlers.location.showQr(cache.qrDataUrl || null, built.caption || '');
    },
    emptyMessage: 'Enter coordinates to begin',
    successMessage: (caption) => `Location QR ready for ${caption}.`,
  });

  forgeHandlers.event = createSimpleForge({
    setStatus,
    cacheKey: 'qr-forge-event-cache',
    previewEl: eventPreview,
    generateBtn: eventGenerateBtn,
    outputEl: eventOutput,
    qrResultEl: eventQrResult,
    qrImageEl: eventQrImage,
    qrCaptionEl: eventQrCaption,
    savePngBtn: eventSavePngBtn,
    build: buildEventPayload,
    focusEl: eventTitle,
    inputEls: [
      eventTitle,
      eventStart,
      eventEnd,
      eventLocation,
      eventDescription,
    ],
    collectCache: () => ({
      title: eventTitle.value,
      start: eventStart.value,
      end: eventEnd.value,
      location: eventLocation.value,
      description: eventDescription.value,
    }),
    applyCache: (cache) => {
      eventTitle.value = cache.title || '';
      eventStart.value = cache.start || '';
      eventEnd.value = cache.end || '';
      eventLocation.value = cache.location || '';
      eventDescription.value = cache.description || '';
      const built = buildEventPayload();
      forgeHandlers.event.showQr(cache.qrDataUrl || null, built.caption || '');
    },
    emptyMessage: 'Enter event details to begin',
    successMessage: (caption) => `Event QR ready for ${caption}.`,
  });
}

function restoreSimpleForgeCaches() {
  for (const key of ['contact', 'message', 'text', 'location', 'event']) {
    forgeHandlers[key]?.restoreCache?.();
  }
}

async function init() {
  initTheme();
  initSimpleForges();
  initNavigation();
  showView('home');

  await restoreSession();
  syncOptionFields();
  syncWifiFields();

  addParamBtn.addEventListener('click', () => {
    paramList.appendChild(createParamRow());
    onWorkspaceChange();
  });

  baseUrlInput.addEventListener('input', onWorkspaceChange);
  paramsToggle.addEventListener('change', onWorkspaceChange);
  encryptToggle.addEventListener('change', onWorkspaceChange);
  encryptSecret.addEventListener('input', updatePreview);
  shortenToggle.addEventListener('change', onWorkspaceChange);
  shortenerEndpoint.addEventListener('input', () => {
    onWorkspaceChange();
    scheduleShortenerPrefs();
  });
  shortenerApiKey.addEventListener('input', scheduleShortenerPrefs);
  generateBtn.addEventListener('click', generateQr);
  savePngBtn.addEventListener('click', savePng);
  saveWorkspaceBtn.addEventListener('click', saveWorkspace);
  openWorkspaceBtn.addEventListener('click', openWorkspace);

  wifiSsid.addEventListener('input', onWifiChange);
  wifiSecurity.addEventListener('change', onWifiChange);
  wifiPassword.addEventListener('input', onWifiChange);
  wifiHidden.addEventListener('change', onWifiChange);
  wifiGenerateBtn.addEventListener('click', generateWifiQr);
  wifiSavePngBtn.addEventListener('click', saveWifiPng);

  baseUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });
  encryptSecret.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });
  shortenerEndpoint.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });
  shortenerApiKey.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });
  wifiPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateWifiQr();
  });
  wifiSsid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateWifiQr();
  });

  await updatePreview();
  await updateWifiPreview();
  await Promise.all([
    forgeHandlers.contact?.updatePreview?.(),
    forgeHandlers.message?.updatePreview?.(),
    forgeHandlers.text?.updatePreview?.(),
    forgeHandlers.location?.updatePreview?.(),
    forgeHandlers.event?.updatePreview?.(),
  ]);
}

init();
