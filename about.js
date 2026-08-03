(function () {
  let theme = 'light';
  try {
    theme = localStorage.getItem('qr-forge-theme') || 'light';
  } catch {
    // ignore storage failures
  }
  if (theme !== 'dark' && theme !== 'light') theme = 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const params = new URLSearchParams(window.location.search);
  const version = params.get('v');
  if (version) {
    document.getElementById('aboutVersion').textContent = `Version ${version}`;
  }

  function closeAbout() {
    if (window.qrForge?.closeWindow) {
      window.qrForge.closeWindow();
    }
  }

  document.getElementById('aboutClose').addEventListener('click', closeAbout);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAbout();
  });
})();
