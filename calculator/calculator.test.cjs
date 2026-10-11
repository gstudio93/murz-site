const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRenovation } = require('./rates.js');
const empty = { area: 60, rooms: 5, bathrooms: 1, height: 2.7, plaster: 0, ceiling: 'none', wallDemo: [], wallLevel: 'none', wallFinish: 'none', wallTile: 'none', floorPrep: [], floorFinish: 'none', floorTile: 'none', electric: 'none', plumbing: [] };
test('no selected work produces zero, without fixed unexplained charges', () => {
  assert.equal(calculateRenovation(empty).total, 0);
});
test('60 m² stretch ceiling: 90,000 base + 15% reserve + 35% materials', () => {
  const result = calculateRenovation({ ...empty, ceiling: 'stretch' });
  assert.equal(result.sections[0].amount, 90000);
  assert.equal(result.reserve, 13500);
  assert.equal(result.work, 103500);
  assert.equal(result.materials, 36225);
  assert.equal(result.total, 139725);
});
test('ceiling and electric selections change their own subtotals', () => {
  const result = calculateRenovation({ ...empty, ceiling: 'painted', electric: 'new' });
  assert.equal(result.sections[0].amount, 234000);
  assert.equal(result.sections[3].amount, 105000);
});
test('bathroom count changes plumbing and zero bathrooms suppresses it', () => {
  for (const [bathrooms, expected] of [[0, 0], [1, 63600], [2, 79000]]) {
    const result = calculateRenovation({ ...empty, bathrooms, plumbing: ['pipes', 'equipment'] });
    assert.equal(result.sections[4].amount, expected);
  }
});
test('every finish and preparation option affects its relevant subtotal', () => {
  const options = { ceiling: ['stretch', 'painted'], wallLevel: ['full', 'local', 'panel'], wallFinish: ['paint', 'wallpaper', 'paintable'], wallTile: ['standard', 'large'], floorFinish: ['laminate', 'vinyl', 'parquet'], floorTile: ['standard', 'large'], electric: ['partial', 'expanded', 'new'], wallDemo: ['wallpaper', 'paint', 'tile', 'partitions'], floorPrep: ['wood', 'laminate', 'tile', 'screed'], plumbing: ['pipes', 'equipment'] };
  for (const [name, values] of Object.entries(options)) for (const value of values) {
    const p = { ...empty, [name]: Array.isArray(empty[name]) ? [value] : value };
    assert.ok(calculateRenovation(p).total > 0, `${name}: ${value}`);
  }
  assert.ok(calculateRenovation({ ...empty, plaster: 100 }).total > 0);
});
test('small/large apartments, all room counts and heights yield finite consistent totals', () => {
  for (const area of [15, 15.1, 40, 80, 200]) for (const rooms of [3, 5, 15]) for (const bathrooms of [0, 1, 2]) for (const height of [2.3, 3.7]) {
    const result = calculateRenovation({ ...empty, area, rooms, bathrooms, height, wallLevel: 'full', wallFinish: 'paint', floorFinish: 'parquet' });
    assert.ok(Number.isFinite(result.total) && result.total >= 0);
    assert.equal(result.total, result.work + result.materials);
    assert.equal(result.work, result.sections.reduce((sum, item) => sum + item.amount, 0) + result.reserve);
  }
});
test('invalid geometry cannot return a misleading price', () => {
  for (const update of [{ area: 0 }, { area: NaN }, { area: 201 }, { rooms: 2 }, { rooms: 3.5 }, { bathrooms: 3 }, { height: 0 }, { plaster: 101 }, { ceiling: 'unknown' }]) {
    assert.throws(() => calculateRenovation({ ...empty, ...update }), RangeError);
  }
});
