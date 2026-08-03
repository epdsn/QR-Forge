function escapeVCardValue(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function toIcsDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part) => String(part).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function truncatePreview(text, max = 320) {
  const value = String(text || '');
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function createSimpleForge(config) {
  const {
    setStatus,
    cacheKey,
    previewEl,
    generateBtn,
    outputEl,
    qrResultEl,
    qrImageEl,
    qrCaptionEl,
    savePngBtn,
    build,
    sync,
    collectCache,
    applyCache,
    focusEl,
    inputEls = [],
    emptyMessage = 'Fill in the fields to begin',
    successMessage = (caption) => `QR code ready${caption ? ` for ${caption}` : ''}.`,
  } = config;

  let lastDataUrl = null;
  let previewToken = 0;
  let cacheTimer = null;

  function showQr(dataUrl, caption = '') {
    lastDataUrl = dataUrl || null;

    if (dataUrl) {
      qrImageEl.src = dataUrl;
      qrCaptionEl.textContent = caption;
      qrResultEl.hidden = false;
      outputEl.dataset.state = 'ready';
    } else {
      qrImageEl.removeAttribute('src');
      qrCaptionEl.textContent = '';
      qrResultEl.hidden = true;
      outputEl.dataset.state = 'empty';
    }
  }

  function scheduleCache() {
    if (!cacheKey || !collectCache) return;
    clearTimeout(cacheTimer);
    cacheTimer = setTimeout(() => {
      try {
        const data = collectCache();
        data.qrDataUrl = lastDataUrl;
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        console.error(err);
      }
    }, 300);
  }

  async function updatePreview() {
    const token = ++previewToken;
    sync?.();

    const result = build();
    if (token !== previewToken) return;

    if (result.empty) {
      previewEl.textContent = result.emptyMessage || emptyMessage;
      generateBtn.disabled = true;
      return;
    }

    if (result.error) {
      previewEl.textContent = result.error;
      generateBtn.disabled = true;
      return;
    }

    previewEl.textContent = truncatePreview(result.preview || result.payload);
    generateBtn.disabled = false;
  }

  async function generate() {
    const result = build();
    if (!result.payload) {
      setStatus(result.error || 'Enter valid details.', 'error');
      return;
    }

    setStatus('Generating…');
    generateBtn.disabled = true;

    try {
      const dataUrl = await window.qrForge.generateQr(result.payload);
      showQr(dataUrl, result.caption || '');
      scheduleCache();
      setStatus(successMessage(result.caption || ''), 'ok');
    } catch (err) {
      console.error(err);
      setStatus(String(err?.message || 'Could not generate QR code.'), 'error');
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

  function restoreCache() {
    if (!cacheKey) return;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      applyCache?.(JSON.parse(raw));
      updatePreview();
    } catch (err) {
      console.error(err);
    }
  }

  function onChange() {
    sync?.();
    updatePreview();
    scheduleCache();
  }

  function onShow() {
    sync?.();
    updatePreview();
    focusEl?.focus?.();
  }

  generateBtn.addEventListener('click', generate);
  savePngBtn.addEventListener('click', savePng);

  for (const el of inputEls) {
    el.addEventListener('input', onChange);
    el.addEventListener('change', onChange);
  }

  return {
    onShow,
    restoreCache,
    updatePreview,
    showQr,
  };
}
