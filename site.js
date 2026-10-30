const body = document.body;
const menuButton = document.querySelector('.menu-trigger');
const menuPanel = document.querySelector('#menu-panel');

const closeMenu = () => {
  body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Открыть меню');
  menuButton?.blur();
  if (menuPanel) menuPanel.inert = true;
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  body.classList.toggle('menu-open', open);
  if (menuPanel) menuPanel.inert = !open;
  if (!open) menuButton.blur();
});

menuPanel?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('[data-reel]').forEach((button) => {
  button.addEventListener('click', () => {
    const reel = document.getElementById(button.dataset.reel);
    if (!reel) return;
    const firstCard = reel.querySelector('.portfolio-card, .team-card');
    const reelGap = Number.parseFloat(getComputedStyle(reel).columnGap) || 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + reelGap : reel.clientWidth;
    reel.scrollBy({ left: distance * Number(button.dataset.step), behavior: 'smooth' });
  });
});

const areaSlider = document.querySelector('#area');
const areaOutput = document.querySelector('#area-output');
const estimateOutput = document.querySelector('#estimate-total');
const rubles = new Intl.NumberFormat('ru-RU');

const updateEstimate = () => {
  if (!areaSlider || !areaOutput || !estimateOutput) return;
  const area = Number(areaSlider.value);
  areaOutput.value = String(area);
  areaOutput.textContent = String(area);
  estimateOutput.textContent = `${rubles.format(area * 15000)} ₽`;
};

areaSlider?.addEventListener('input', updateEstimate);
updateEstimate();

