const baseUrlInput = document.getElementById('baseUrl');
const paramList = document.getElementById('paramList');
const addParamBtn = document.getElementById('addParam');
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
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const themeToggleLabel = document.getElementById('themeToggleLabel');

let lastDataUrl = null;
let lastResultUrl = null;
let lastLongUrl = null;
let lastShortUrl = null;
let shortForLongUrl = null;
let previewToken = 0;
let cacheTimer = null;
let prefsTimer = null;
let applyingWorkspace = false;

const THEME_KEY = 'qr-forge-theme';
const THEME_BG = {
  light: '#ecebf8',
  dark: '#1a1c31',
};

const DEFAULT_PARAMS = [{ key: '', value: '' }];

function setStatus(message, kind = '') {
  statusEl.textContent = message;
  statusEl.className = `status${kind ? ` ${kind}` : ''}`;
}

function createParamRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'param-row';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Key';
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
  const rows = Array.isArray(params) && params.length ? params : DEFAULT_PARAMS;
  for (const param of rows) {
    paramList.appendChild(
      createParamRow(param?.key || '', param?.value || '')
    );
  }
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

function syncOptionFields() {
  secretField.hidden = !encryptToggle.checked;
  shortenerFields.hidden = !shortenToggle.checked;
}

function collectWorkspace() {
  return {
    version: 1,
    baseUrl: baseUrlInput.value.trim(),
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

function applyWorkspace(workspace) {
  if (!workspace || typeof workspace !== 'object') return;

  applyingWorkspace = true;
  try {
    baseUrlInput.value = workspace.baseUrl || '';
    setParams(workspace.params);
    encryptToggle.checked = Boolean(workspace.encrypt);
    shortenToggle.checked = Boolean(workspace.shorten);
    if (typeof workspace.shortenerEndpoint === 'string') {
      shortenerEndpoint.value = workspace.shortenerEndpoint;
    }
    // Secrets are never restored from workspace files.
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

  for (const { key, value } of getParams()) {
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
      setParams(DEFAULT_PARAMS);
    }
  } catch (err) {
    console.error(err);
    setParams(DEFAULT_PARAMS);
  }
}

async function init() {
  initTheme();

  await restoreSession();
  syncOptionFields();

  addParamBtn.addEventListener('click', () => {
    paramList.appendChild(createParamRow());
    onWorkspaceChange();
  });

  baseUrlInput.addEventListener('input', onWorkspaceChange);
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

  await updatePreview();
  if (!baseUrlInput.value) baseUrlInput.focus();
}

init();
