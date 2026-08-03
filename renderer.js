const appEl = document.querySelector('.app');
const brandSub = document.getElementById('brandSub');
const homeView = document.getElementById('homeView');
const urlView = document.getElementById('urlView');
const wifiView = document.getElementById('wifiView');
const openUrlForge = document.getElementById('openUrlForge');
const openWifiForge = document.getElementById('openWifiForge');
const urlBack = document.getElementById('urlBack');
const wifiBack = document.getElementById('wifiBack');

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
};

const DEFAULT_PARAMS = [{ key: '', value: '' }];

function setStatus(message, kind = '') {
  statusEl.textContent = message;
  statusEl.className = `status${kind ? ` ${kind}` : ''}`;
}

function showView(view) {
  appEl.dataset.view = view;
  homeView.hidden = view !== 'home';
  urlView.hidden = view !== 'url';
  wifiView.hidden = view !== 'wifi';
  brandSub.textContent = VIEW_SUBTITLES[view];

  if (view === 'url') {
    syncOptionFields();
    updatePreview();
    if (!baseUrlInput.value) baseUrlInput.focus();
  } else if (view === 'wifi') {
    syncWifiFields();
    updateWifiPreview();
    if (!wifiSsid.value) wifiSsid.focus();
  }
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
}

function initNavigation() {
  openUrlForge.addEventListener('click', () => showView('url'));
  openWifiForge.addEventListener('click', () => showView('wifi'));
  urlBack.addEventListener('click', () => showView('home'));
  wifiBack.addEventListener('click', () => showView('home'));
}

async function init() {
  initTheme();
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
}

init();
