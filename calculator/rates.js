/* Temporary reference rates, RUB. Source: https://deco-stroy.ru/calc/,
 * reviewed 2026-10-07. Replace here after MURZ approves its own rates.
 * The detailed estimate is independent of the homepage package price grid.
 */
const MURZ_RATES = Object.freeze({
  ceiling: { stretch: 1500, painted: 3900, none: 0 },
  wallDemo: { wallpaper: 200, paint: 350, tile: 350, partitions: 6500, plaster: 400 },
  wallLevel: { full: 1160, corners: 550, perimeter: 250, panel: 350 },
  wallFinish: { paint: 2530, wallpaper: 1160, paintable: 1610, none: 0 },
  wallTile: { standard: 3700, large: 4100, none: 0 },
  floorDemo: { wood: 600, laminate: 300, tile: 350, screed: 800 },
  floorFinish: { laminate: 1220, vinyl: 1720, parquet: 4500, none: 0 },
  floorTile: { standard: 3000, large: 3600, none: 0 },
  electric: { partial: 900, expanded: 1250, new: 1750, none: 0 },
  plumbing: { pipes: [0, 37600, 47000], equipment: [0, 26000, 32000] },
  materials: 0.35,
});

function calculateRenovation(p, rates = MURZ_RATES) {
  if (!Number.isFinite(p.area) || p.area < 15 || p.area > 200 ||
      !Number.isInteger(p.rooms) || p.rooms < 3 || p.rooms > 15 ||
      !Number.isInteger(p.bathrooms) || p.bathrooms < 0 || p.bathrooms > 2 ||
      p.rooms <= p.bathrooms || !Number.isFinite(p.height) || p.height < 2.3 || p.height > 3.7 ||
      !Number.isFinite(p.plaster) || p.plaster < 0 || p.plaster > 100) {
    throw new RangeError('Проверьте площадь, количество помещений и высоту потолков.');
  }
  // Approximate geometry from the reference: equivalent square rooms.
  const firstBath = p.bathrooms === 2 ? (17.2 + 1.25 * p.area) / 25 : p.bathrooms === 1 ? 4.28 : 0;
  const secondBath = p.bathrooms === 2 ? firstBath * 0.57 : 0;
  const bathFloor = firstBath + secondBath;
  const dryFloor = p.area - bathFloor;
  const dryRooms = p.rooms - p.bathrooms;
  const roomSide = Math.sqrt(dryFloor / dryRooms);
  const dryWalls = 0.9 * 4 * p.height * roomSide * dryRooms;
  const wetWalls = 4 * p.height * (Math.sqrt(firstBath) + Math.sqrt(secondBath));
  const allWalls = dryWalls + wetWalls;
  const selected = (key, item) => (p[key] || []).includes(item);
  const level = p.wallLevel === 'full' ? allWalls * rates.wallLevel.full :
    p.wallLevel === 'none' ? 0 : wetWalls * rates.wallLevel.full +
      dryRooms * p.height * 4 * rates.wallLevel.corners +
      dryRooms * roomSide * 4 * 1.5 * rates.wallLevel.perimeter +
      (p.wallLevel === 'panel' ? dryWalls * rates.wallLevel.panel : 0);
  const sections = [
    { label: 'Потолок', amount: p.area * rates.ceiling[p.ceiling] },
    { label: 'Стены', amount:
      (selected('wallDemo', 'wallpaper') ? dryWalls * rates.wallDemo.wallpaper : 0) +
      (selected('wallDemo', 'paint') ? dryWalls * rates.wallDemo.paint : 0) +
      (selected('wallDemo', 'tile') ? wetWalls * rates.wallDemo.tile : 0) +
      (selected('wallDemo', 'partitions') ? rates.wallDemo.partitions : 0) +
      allWalls * rates.wallDemo.plaster * p.plaster / 100 + level +
      dryWalls * rates.wallFinish[p.wallFinish] + wetWalls * rates.wallTile[p.wallTile] },
    { label: 'Пол', amount:
      (selected('floorPrep', 'wood') ? dryFloor * rates.floorDemo.wood : 0) +
      (selected('floorPrep', 'laminate') ? dryFloor * rates.floorDemo.laminate : 0) +
      (selected('floorPrep', 'tile') ? bathFloor * rates.floorDemo.tile : 0) +
      (selected('floorPrep', 'screed') ? p.area * rates.floorDemo.screed : 0) +
      dryFloor * rates.floorFinish[p.floorFinish] + bathFloor * rates.floorTile[p.floorTile] },
    { label: 'Электрика', amount: p.area * rates.electric[p.electric] },
    { label: 'Сантехника', amount:
      (selected('plumbing', 'pipes') ? rates.plumbing.pipes[p.bathrooms] : 0) +
      (selected('plumbing', 'equipment') ? rates.plumbing.equipment[p.bathrooms] : 0) },
  ].map(item => ({ ...item, amount: Math.round(item.amount) }));
  if (sections.some(item => !Number.isFinite(item.amount))) throw new RangeError('Неизвестный вариант работ.');
  const base = sections.reduce((sum, item) => sum + item.amount, 0);
  const work = base;
  const materials = Math.round(work * rates.materials);
  return { sections, work, materials, total: work + materials };
}

if (typeof module !== 'undefined') module.exports = { MURZ_RATES, calculateRenovation };
