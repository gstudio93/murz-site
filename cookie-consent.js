(() => {
  // Add data-metrika-id to <html> only when a real Yandex Metrica counter is configured.
  // Without it, the site shows no consent UI and loads no tracking code or cookies.
  const counterId = document.documentElement.dataset.metrikaId;
  if (!counterId) return;

  const storageKey = 'murz-metrika-consent';
  const loadMetrika = () => {
    if (window.ym) return;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = Date.now();
      for (const node of document.scripts) {
        if (node.src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = true;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    });
  };

  const choice = window.localStorage.getItem(storageKey);
  if (choice === 'accepted') {
    loadMetrika();
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .cookie-consent { position: fixed; z-index: 1000; right: 20px; bottom: 20px; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 18px; width: min(760px, calc(100vw - 40px)); padding: 18px 20px; background: #25352d; color: #f6f4ef; box-shadow: 0 12px 38px #17231b40; font: 13px/1.55 'DM Sans', Arial, sans-serif; }
    .cookie-consent p { margin: 0; }
    .cookie-consent button { min-height: 42px; padding: 0 14px; border: 1px solid #a8b59e; background: transparent; color: inherit; font: inherit; cursor: pointer; }
    .cookie-consent button[data-consent="accept"] { border-color: #c8eb81; background: #c8eb81; color: #202b26; }
    .cookie-consent button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
    @media (max-width: 640px) { .cookie-consent { right: 12px; bottom: 12px; grid-template-columns: 1fr 1fr; gap: 10px; width: calc(100vw - 24px); padding: 16px; } .cookie-consent p { grid-column: 1 / -1; } .cookie-consent button { padding: 0 8px; font-size: 12px; } }
  `;
  document.head.append(style);

  const banner = document.createElement('section');
  banner.className = 'cookie-consent';
  banner.setAttribute('aria-label', 'Настройки cookie');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = '<p>Яндекс Метрика использует cookie для статистики посещений. Разрешите её работу или продолжите без аналитики.</p><button type="button" data-consent="reject">Только необходимые</button><button type="button" data-consent="accept">Разрешить Метрику</button>';
  banner.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-consent]');
    if (!button) return;
    const accepted = button.dataset.consent === 'accept';
    window.localStorage.setItem(storageKey, accepted ? 'accepted' : 'rejected');
    banner.remove();
    style.remove();
    if (accepted) loadMetrika();
  });
  document.body.append(banner);
})();
