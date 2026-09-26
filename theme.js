(() => {
  const button = document.getElementById('themeToggle');
  const applyTheme = (mode, automatic = false) => {
    document.body.classList.toggle('dark', mode === 'dark');
    button.innerHTML = mode === 'dark' ? '☀ <span>Light mode</span>' : '☾ <span>Dark mode</span>';
    button.title = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (!automatic) localStorage.setItem('orion-theme', mode);
  };
  const saved = localStorage.getItem('orion-theme');
  applyTheme(saved || (new Date().getHours() >= 18 || new Date().getHours() < 6 ? 'dark' : 'light'), !saved);
  button.addEventListener('click', () => applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

  // When the requested place loads, its live day/night flag becomes the default.
  const originalRender = window.render;
  const observer = new MutationObserver(() => {
    const label = document.getElementById('day')?.textContent || '';
    if (!localStorage.getItem('orion-theme') && label) applyTheme(label.includes('Night') ? 'dark' : 'light', true);
  });
  observer.observe(document.getElementById('day'), { childList: true, characterData: true, subtree: true });

  // Use the familiar Google Maps viewer, centered on the coordinates already supplied by the weather service.
  const map = document.getElementById('map');
  const mapObserver = new MutationObserver(() => {
    const coords = document.getElementById('coords')?.textContent;
    if (!coords || !/^[-\d.]+,\s*[-\d.]+$/.test(coords)) return;
    map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(coords) + '&z=11&output=embed';
  });
  mapObserver.observe(document.getElementById('coords'), { childList: true, characterData: true, subtree: true });
})();
