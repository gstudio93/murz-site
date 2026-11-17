const body = document.body;
const projectRoot = document.querySelector('#projects');
const projectGallery = document.querySelector('#project-gallery');
const projectLightbox = document.querySelector('#project-lightbox');
if (projectRoot && projectGallery && projectLightbox) {
  const projectNumbers = {
    '83': ['2264','2265','2266','2269','2271','2273','2274','2276','2277','2278','2279','2283','2284','2285','2286','2293','2294','2343','2344','2345','2346','2347','2348','2350','2352'],
    '73': ['2297','2300','2301','2303','2305','2306','2308','2309','2311','2313','2315','2353','2354','2356','2357','2358','2364','2365','2366','2428','2429','2430','2431','2432'],
    '48': ['2120','2121','2122','2123','2124','2125','2126','2129','2130','2136','2137'],
    '44': ['2176','2177','2178','2179','2180','2181','2182','2183','2184','2185','2186','2187','2188','2189','2190','2191','2192','2193','2194','2195','2196','2197','2198'],
    '72': ['2120','2201','2204','2205','2206','2208','2209','2211','2212','2215','2216','2217','2218','2220','2221','2222','2223','2224','2225'],
    '40.9': ['2139','2140','2141','2142','2143','2144','2145','2146','2148','2149','2150','2151']
  };
  let files = [];
  let projectArea = '83';
  const grid = projectGallery.querySelector('.project-grid');
  const image = projectLightbox.querySelector('img');
  const counter = projectLightbox.querySelector('.lightbox-counter');
  let current = 0;
  const show = index => { current = (index + files.length) % files.length; image.src = files[current]; image.alt = 'Квартира ' + projectArea.replace('.', ',') + ' м² — фотография ' + (current + 1); counter.textContent = (current + 1) + ' / ' + files.length; };
  const openProject = area => {
    projectArea = area;
    files = projectNumbers[area].map(n => projectRoot.dataset.projectBase.replace('project-83/', 'project-' + area + '/') + 'IMG_' + n + '.JPG');
    projectGallery.querySelector('#project-title').textContent = 'Квартира · ' + area.replace('.', ',') + ' м²';
    grid.replaceChildren();
    files.forEach((src, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.setAttribute('aria-label', 'Открыть фото ' + (index + 1));
    const img = document.createElement('img'); img.src = src; img.alt = ''; img.loading = 'lazy';
    button.append(img); button.addEventListener('click', () => { show(index); projectLightbox.showModal(); }); grid.append(button);
    });
    projectGallery.scrollTop = 0;
    projectGallery.showModal();
  };
  projectRoot.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => openProject(card.dataset.project)));
  projectGallery.querySelector('.project-close').addEventListener('click', () => projectGallery.close());
  projectLightbox.querySelector('.lightbox-close').addEventListener('click', () => projectLightbox.close());
  projectLightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  projectLightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  image.addEventListener('click', () => projectLightbox.close());
  let touchStart = null;
  projectLightbox.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  projectLightbox.addEventListener('touchend', event => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      event.preventDefault();
      show(current + (dx < 0 ? 1 : -1));
    }
  }, { passive: false });
  projectLightbox.addEventListener('touchcancel', () => { touchStart = null; });
  projectLightbox.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') show(current - 1); if (event.key === 'ArrowRight') show(current + 1); });
}
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

const updateReelPosition = (reel) => {
  const cards = [...reel.querySelectorAll('.portfolio-card')];
  const output = document.querySelector(`[data-reel-current="${reel.id}"]`);
  if (!cards.length || !output) return;
  const reelGap = Number.parseFloat(getComputedStyle(reel).columnGap) || 0;
  const cardWidth = cards[0].getBoundingClientRect().width + reelGap;
  const current = Math.min(cards.length, Math.max(1, Math.round(reel.scrollLeft / cardWidth) + 1));
  output.textContent = String(current).padStart(2, '0');
};

document.querySelectorAll('.portfolio-reel').forEach((reel) => {
  let scheduled = false;
  updateReelPosition(reel);
  reel.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      updateReelPosition(reel);
      scheduled = false;
    });
  }, { passive: true });
});

document.querySelectorAll('[data-reel]').forEach((button) => {
  button.addEventListener('click', () => {
    const reel = document.getElementById(button.dataset.reel);
    if (!reel) return;
    const firstCard = reel.querySelector('.portfolio-card');
    const reelGap = Number.parseFloat(getComputedStyle(reel).columnGap) || 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + reelGap : reel.clientWidth;
    reel.scrollBy({ left: distance * Number(button.dataset.step), behavior: 'smooth' });
  });
});

const calcRoot = document.querySelector('#estimate');
const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

if (calcRoot) {
  const fields = {
    area: document.querySelector('#calc-area'),
    areaOutput: document.querySelector('#calc-area-output'),
    rooms: document.querySelector('#calc-rooms'),
    bathrooms: document.querySelector('#calc-bathrooms'),
    height: document.querySelector('#calc-height'),
    design: document.querySelector('#calc-design'),
    ceiling: document.querySelector('#calc-ceiling'),
    wallLevel: document.querySelector('#calc-wall-level'),
    wallFinish: document.querySelector('#calc-wall-finish'),
    wallTile: document.querySelector('#calc-wall-tile'),
    floorFinish: document.querySelector('#calc-floor-finish'),
    floorTile: document.querySelector('#calc-floor-tile'),
    screed: document.querySelector('#calc-screed'),
    electric: document.querySelector('#calc-electric'),
    plumbing: document.querySelector('#calc-plumbing'),
  };

  const rates = {
    ceiling: { stretch: 450, painted: 3900, none: 0 },
    wallLevel: { full: 1160, corners: 550, perimeter: 250 },
    wallFinish: { paint: 500, wallpaper: 500, paintable: 1000, none: 0 },
    wallTile: { standard: 2000, large: 2000, none: 0 },
    floorFinish: { laminate: 450, vinyl: 1720, parquet: 4500, none: 0 },
    floorTile: { standard: 2000, large: 2000, none: 0 },
    electric: { partial: 900, expanded: 1250, new: 1750, none: 0 },
    plumbing: { pipes: [0, 37600, 47000], equipment: [0, 26000, 32000] },
    screed: 800,
    materials: 0.35,
    design: 2000,
  };

  const money = (value) => `${rubles.format(Math.round(value))} ₽`;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const calculate = () => {
    const area = clamp(Number(fields.area.value) || 60, 15, 200);
    const bathrooms = clamp(Number(fields.bathrooms.value) || 0, 0, 2);
    const rooms = clamp(Math.round(Number(fields.rooms.value) || 5), Math.max(3, bathrooms + 1), 15);
    const height = clamp(Number(fields.height.value) || 2.7, 2.3, 3.7);
    const firstBath = bathrooms === 2 ? (17.2 + 1.25 * area) / 25 : bathrooms === 1 ? 4.28 : 0;
    const secondBath = bathrooms === 2 ? firstBath * 0.57 : 0;
    const bathFloor = Math.min(firstBath + secondBath, area * 0.35);
    const dryFloor = Math.max(area - bathFloor, 0);
    const dryRooms = Math.max(rooms - bathrooms, 1);
    const roomSide = Math.sqrt(dryFloor / dryRooms);
    const dryWalls = 0.9 * 4 * height * roomSide * dryRooms;
    const wetWalls = 4 * height * (Math.sqrt(firstBath) + Math.sqrt(secondBath));
    const allWalls = dryWalls + wetWalls;
    const wallLevel = fields.wallLevel.value === 'full'
      ? allWalls * rates.wallLevel.full
      : fields.wallLevel.value === 'local'
        ? wetWalls * rates.wallLevel.full + dryRooms * height * 4 * rates.wallLevel.corners + dryRooms * roomSide * 4 * 1.5 * rates.wallLevel.perimeter
        : 0;
    const plumbing = fields.plumbing.value;

    const sections = [
      { label: 'Потолок', amount: area * rates.ceiling[fields.ceiling.value] },
      { label: 'Стены', amount: wallLevel + dryWalls * rates.wallFinish[fields.wallFinish.value] + wetWalls * rates.wallTile[fields.wallTile.value] },
      { label: 'Пол', amount: (fields.screed.checked ? area * rates.screed : 0) + dryFloor * rates.floorFinish[fields.floorFinish.value] + bathFloor * rates.floorTile[fields.floorTile.value] },
      { label: 'Электрика', amount: area * rates.electric[fields.electric.value] },
      { label: 'Сантехника', amount: (plumbing === 'both' || plumbing === 'pipes' ? rates.plumbing.pipes[bathrooms] : 0) + (plumbing === 'both' || plumbing === 'equipment' ? rates.plumbing.equipment[bathrooms] : 0) },
    ].map((item) => ({ ...item, amount: Math.round(item.amount) }));

    const work = sections.reduce((sum, item) => sum + item.amount, 0);
    const materials = Math.round(work * rates.materials);
    const design = fields.design.checked ? area * rates.design : 0;
    return { area, rooms, bathrooms, height, sections, work, materials, design, total: work + materials + design };
  };

  const bathroomWord = (count) => count === 1 ? 'санузел' : count >= 2 && count <= 4 ? 'санузла' : 'санузлов';
  const roomWord = (count) => count >= 2 && count <= 4 ? 'помещения' : 'помещений';

  const updateCalculator = () => {
    const result = calculate();
    fields.areaOutput.value = String(result.area);
    fields.areaOutput.textContent = String(result.area);
    fields.rooms.value = String(result.rooms);
    fields.height.value = String(result.height);

    document.querySelectorAll('[data-calc-total]').forEach((node) => { node.textContent = money(result.total); });
    document.querySelectorAll('[data-calc-work]').forEach((node) => { node.textContent = money(result.work); });
    document.querySelectorAll('[data-calc-materials]').forEach((node) => { node.textContent = money(result.materials); });
    document.querySelectorAll('[data-calc-design-price]').forEach((node) => { node.textContent = result.design ? money(result.design) : 'Не выбран'; });
    document.querySelectorAll('[data-calc-summary]').forEach((node) => {
      node.textContent = `${result.area} м² · ${result.rooms} ${roomWord(result.rooms)} · ${result.bathrooms} ${bathroomWord(result.bathrooms)} · ${result.height.toLocaleString('ru-RU')} м`;
    });
    document.querySelectorAll('[data-calc-breakdown]').forEach((list) => {
      list.replaceChildren(...result.sections.map((item) => {
        const row = document.createElement('div');
        const label = document.createElement('dt');
        const price = document.createElement('dd');
        label.textContent = item.label;
        price.textContent = money(item.amount);
        row.append(label, price);
        return row;
      }));
    });
  };

  Object.values(fields).forEach((field) => {
    if (!field || field === fields.areaOutput) return;
    field.addEventListener('input', updateCalculator);
    field.addEventListener('change', updateCalculator);
  });
  document.querySelectorAll('[data-step-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = document.getElementById(button.dataset.stepTarget);
      if (!(field instanceof HTMLInputElement)) return;
      if (button.dataset.step === 'up') field.stepUp();
      else field.stepDown();
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.focus({ preventScroll: true });
    });
  });
  updateCalculator();

  const calculatorFlow = document.querySelector('.calculator-flow');
  const workPrices = document.querySelector('#work-prices');
  if (calculatorFlow && workPrices) workPrices.insertAdjacentElement('afterend', calculatorFlow);
  const mobileBar = document.querySelector('.calc-mobile-bar');
  const mobileSummary = document.querySelector('.calc-mobile-summary');
  let mobileBarFrame = 0;

  const syncMobileCalculator = () => {
    mobileBarFrame = 0;
    if (!calculatorFlow || !mobileBar || !mobileSummary) return;
    const flowRect = calculatorFlow.getBoundingClientRect();
    const summaryRect = mobileSummary.getBoundingClientRect();
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    const insideCalculator = flowRect.top < window.innerHeight && flowRect.bottom > 0;
    const summaryReached = summaryRect.top <= window.innerHeight - 8;
    const showBar = isMobile && insideCalculator && !summaryReached;
    mobileBar.classList.toggle('is-visible', showBar);
    mobileBar.setAttribute('aria-hidden', String(!showBar));
    mobileSummary.classList.toggle('is-reached', isMobile && summaryReached);
  };

  const requestMobileCalculatorSync = () => {
    if (!mobileBarFrame) mobileBarFrame = requestAnimationFrame(syncMobileCalculator);
  };

  mobileBar?.addEventListener('click', () => mobileSummary?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  window.addEventListener('scroll', requestMobileCalculatorSync, { passive: true });
  window.addEventListener('resize', requestMobileCalculatorSync);
  syncMobileCalculator();
}

