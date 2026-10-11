(() => {
  'use strict';
  const form = document.querySelector('#murz-calc-form');
  const area = form.elements.area;
  const slider = document.querySelector('#calc-area-range');
  const error = document.querySelector('#form-error');
  const copy = document.querySelector('#copy-calculation');
  const status = document.querySelector('#copy-status');
  const manual = document.querySelector('#manual-copy');
  const brief = document.querySelector('#calculation-text');
  const rubles = value => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' ₽';
  let currentResult = null;
  const numericNames = ['area', 'rooms', 'bathrooms', 'height', 'plaster'];
  const checkboxNames = ['wallDemo', 'floorPrep', 'plumbing'];

  function parameters() {
    const data = new FormData(form);
    const values = Object.fromEntries(data);
    numericNames.forEach(name => values[name] = Number(data.get(name)));
    checkboxNames.forEach(name => values[name] = data.getAll(name));
    return values;
  }
  function update() {
    currentResult = null;
    status.textContent = '';
    manual.hidden = true;
    const invalid = [...form.querySelectorAll('input[type="number"]')].filter(field => !field.checkValidity());
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    invalid.forEach(field => field.setAttribute('aria-invalid', 'true'));
    try {
      if (invalid.length) throw new RangeError('Площадь: 15–200 м²; помещений: 3–15; высота: 2,3–3,7 м; демонтаж штукатурки: 0–100%.');
      const values = parameters();
      const result = calculateRenovation(values);
      error.textContent = '';
      if (document.activeElement !== slider) slider.value = area.value;
      document.querySelector('#summary-total').textContent = rubles(result.total);
      document.querySelector('#mobile-total').textContent = rubles(result.total);
      document.querySelector('#summary-work').textContent = rubles(result.work);
      document.querySelector('#summary-materials').textContent = rubles(result.materials);
      document.querySelector('#summary-selection').textContent = `${values.area.toLocaleString('ru-RU')} м² · помещений: ${values.rooms} · санузлов: ${values.bathrooms} · потолки: ${values.height.toLocaleString('ru-RU')} м`;
      const rows = [...result.sections, { label: 'Резерв 15%', amount: result.reserve }];
      const breakdown = document.querySelector('#summary-breakdown');
      breakdown.replaceChildren(...rows.map(item => {
        const row = document.createElement('div');
        const label = document.createElement('dt');
        const price = document.createElement('dd');
        label.textContent = item.label;
        price.textContent = rubles(item.amount);
        row.append(label, price);
        return row;
      }));
      currentResult = { values, result };
      copy.disabled = false;
    } catch (exception) {
      error.textContent = exception.message;
      ['summary-total', 'mobile-total', 'summary-work', 'summary-materials'].forEach(id => document.getElementById(id).textContent = '—');
      document.querySelector('#summary-selection').textContent = 'Проверьте параметры квартиры.';
      document.querySelector('#summary-breakdown').replaceChildren();
      copy.disabled = true;
      brief.value = '';
    }
  }

  function makeBrief() {
    const { values, result } = currentResult;
    const lines = ['MURZ — предварительный расчёт ремонта', `Площадь: ${values.area} м²`, `Помещений с кухней, коридором и санузлами: ${values.rooms}`, `Санузлов: ${values.bathrooms}`, `Высота: ${values.height} м`, `Демонтаж штукатурки: ${values.plaster}%`];
    form.querySelectorAll('.calc-section').forEach((section, index) => {
      if (!index) return;
      const choices = [...section.querySelectorAll('input:checked')].map(input => input.closest('label').querySelector('strong, span').textContent.trim());
      lines.push(`${section.querySelector('h2').textContent}: ${choices.join('; ') || 'Без работ'}`);
    });
    lines.push('', ...result.sections.map(item => `${item.label}: ${rubles(item.amount)}`), `Резерв 15%: ${rubles(result.reserve)}`, `Работы с резервом: ${rubles(result.work)}`, `Черновые материалы (35%): ${rubles(result.materials)}`, `Итого: ${rubles(result.total)}`, '', 'Объёмы поверхностей приблизительные. Комплект натяжного потолка включён в расценку. Остальные чистовые материалы, мебель и техника не учтены. Итоговая смета — после замера.', 'MURZ: +7 (928) 000-11-10');
    return lines.join('\n');
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  slider.addEventListener('input', () => { area.value = slider.value; update(); });
  copy.addEventListener('click', async () => {
    if (!currentResult) return;
    const text = makeBrief();
    brief.value = text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Расчёт скопирован. Его можно отправить нам.';
    } catch {
      manual.hidden = false;
      brief.focus();
      brief.select();
      status.textContent = 'Скопируйте выделенный текст вручную.';
    }
  });
  if ('IntersectionObserver' in window) {
    const observed = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? observed.add(entry.target) : observed.delete(entry.target));
      document.querySelector('.mobile-result').classList.toggle('is-hidden', observed.size > 0);
    });
    observer.observe(document.querySelector('.calc-summary'));
    observer.observe(document.querySelector('.calc-footer'));
  }
  update();
})();
