const baseUrlInput = document.getElementById('baseUrl');
const paramList = document.getElementById('paramList');
const addParamBtn = document.getElementById('addParam');
const urlPreview = document.getElementById('urlPreview');
const generateBtn = document.getElementById('generate');
const output = document.getElementById('output');
const qrImage = document.getElementById('qrImage');
const qrCaption = document.getElementById('qrCaption');
const savePngBtn = document.getElementById('savePng');
const statusEl = document.getElementById('status');

let lastDataUrl = null;

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

function buildUrl() {
  const base = baseUrlInput.value.trim();
  if (!base) return null;

  let url;
  try {
    url = new URL(base);
  } catch {
    try {
      url = new URL(`https://${base}`);
    } catch {
      return null;
    }
  }

  for (const { key, value } of getParams()) {
    if (!key) continue;
    url.searchParams.set(key, value);
  }

  return url.toString();
}

function updatePreview() {
  const url = buildUrl();
  if (!baseUrlInput.value.trim()) {
    urlPreview.textContent = 'Enter a base URL to begin';
    generateBtn.disabled = true;
    return;
  }

  if (!url) {
    urlPreview.textContent = 'Invalid base URL';
    generateBtn.disabled = true;
    return;
  }

  urlPreview.textContent = url;
  generateBtn.disabled = false;
}

async function generateQr() {
  const url = buildUrl();
  if (!url) {
    setStatus('Enter a valid base URL first.', 'error');
    return;
  }

  setStatus('Generating…');
  generateBtn.disabled = true;

  try {
    const dataUrl = await window.qrForge.generateQr(url);
    lastDataUrl = dataUrl;
    qrImage.src = dataUrl;
    qrCaption.textContent = url;
    output.hidden = false;
    setStatus('QR code ready.', 'ok');
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
  generateBtn.addEventListener('click', generateQr);
  savePngBtn.addEventListener('click', savePng);

  baseUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQr();
  });

  updatePreview();
  baseUrlInput.focus();
}

init();
