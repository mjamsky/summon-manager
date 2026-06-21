// ═══════════════════════════════════════════════════════════════
//  SNA Combat Manager — Test Harness
//  Run: node test.js
//  Zero dependencies. Deterministic dice via _setDice().
// ═══════════════════════════════════════════════════════════════

// ── Minimal DOM stubs ──
globalThis.__TEST__ = true;
const _el = () => ({ value: '', classList: { toggle(){}, add(){}, remove(){}, contains(){ return false; } },
  textContent: '', innerHTML: '', style: {}, addEventListener(){}, setAttribute(){}, getAttribute(){ return null; },
  appendChild(){}, removeChild(){}, parentNode: null, children: [], querySelectorAll(){ return []; } });
globalThis.document = { getElementById: _el, querySelectorAll(){ return []; }, querySelector(){ return null; },
  addEventListener(){}, createElement: _el, body: { classList: { add(){}, remove(){} } } };
globalThis.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} };
globalThis.window = { innerWidth: 1024 };
globalThis.alert = () => {};
globalThis.confirm = () => false;
globalThis.location = { reload(){} };

// ── Load bestiary globals ──
const fs = require('fs');
const fn = new Function(fs.readFileSync(__dirname + '/bestiary.js', 'utf8') + '; return { BESTIARY_DATA, RATINGS_DATA };');
const { BESTIARY_DATA, RATINGS_DATA } = fn();
globalThis.BESTIARY_DATA = BESTIARY_DATA;
globalThis.RATINGS_DATA = RATINGS_DATA;

// ── Load app ──
const app = require('./app.js');
app.loadBestiary();

// ── Assertion helpers ──
let pass = 0, fail = 0, currentSuite = '';
function suite(name) { currentSuite = name; }
function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error(`  FAIL [${currentSuite}]: ${msg}`); }
}
function eq(a, b, msg) { assert(a === b, `${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function approx(a, b, msg) { assert(Math.abs(a - b) < 0.001, `${msg}: expected ~${b}, got ${a}`); }
function ok(v, msg) { assert(!!v, `${msg}: expected truthy, got ${JSON.stringify(v)}`); }
function notOk(v, msg) { assert(!v, `${msg}: expected falsy, got ${JSON.stringify(v)}`); }

// ── Deterministic dice ──
let diceSeq = [], diceIdx = 0;
function setDice(seq) { diceSeq = seq; diceIdx = 0; app._setDice(s => ((diceSeq[diceIdx++ % diceSeq.length] - 1) % s) + 1); }
function resetDice() { diceIdx = 0; }

// ═══════════════════════════════════════════════════════════════
//  TESTS
// ═══════════════════════════════════════════════════════════════

// ── parseMelee ──
suite('parseMelee');
{
  const r = app.parseMelee('bite +5 (1d6+3)');
  eq(r.length, 1, 'single attack count');
  eq(r[0].name, 'bite', 'attack name');
  eq(r[0].bonus, 5, 'attack bonus');
  eq(r[0].dmg, '1d6+3', 'damage dice');
}
{
  const r = app.parseMelee('2 claws +7 (1d4+3 plus grab), bite +7 (1d6+3)');
  eq(r.length, 3, 'multi attack count (2 claws + bite)');
  ok(r[0].sp.includes('grab'), 'claw 1 has grab');
  ok(r[1].sp.includes('grab'), 'claw 2 has grab');
  assert(!r[2].sp.includes('grab'), 'bite has no grab');
  eq(r[2].name, 'bite', 'bite name');
}
{
  const r = app.parseMelee('bite +2 (1d6 plus poison)');
  eq(r.length, 1, 'poison attack count');
  ok(r[0].sp.includes('poison'), 'has poison special');
}
{
  const r = app.parseMelee('');
  eq(r.length, 0, 'empty string → no attacks');
}

// ── rdice ──
suite('rdice');
{
  setDice([3, 4]);
  const r = app.rdice('2d6+3');
  eq(r.r[0], 3, 'first roll');
  eq(r.r[1], 4, 'second roll');
  eq(r.m, 3, 'modifier');
  eq(r.t, 10, 'total: 3+4+3=10');
}
{
  setDice([1]);
  const r = app.rdice('1d4-1');
  eq(r.t, 1, 'min floor: 1d4-1 with roll 1 → max(1, 1-1) = 1');
}
{
  const r = app.rdice('invalid');
  eq(r.t, 0, 'invalid dice string → 0');
}

// ── bTotal ──
suite('bTotal');
{
  // Set up buffs: two morale (highest wins), one sacred, one untyped
  const origBuffs = { ...app.S.buffs };
  app.S.buffs = {};
  app.BD.testMorale1 = { a: 1, d: 1, s: 0, ty: 'morale', name: 'M1' };
  app.BD.testMorale2 = { a: 2, d: 2, s: 0, ty: 'morale', name: 'M2' };
  app.BD.testSacred = { a: 1, d: 1, s: 1, ty: 'sacred', name: 'Sac' };
  app.BD.testUntyped = { a: 1, d: 1, s: 0, ty: 'u', name: 'Unt' };
  app.S.buffs = { testMorale1: true, testMorale2: true, testSacred: true, testUntyped: true };
  const b = app.bTotal();
  eq(b.a, 4, 'attack: morale 2 + sacred 1 + untyped 1 = 4');
  eq(b.d, 4, 'damage: morale 2 + sacred 1 + untyped 1 = 4');
  eq(b.s, 1, 'saves: sacred 1');
  // Cleanup
  delete app.BD.testMorale1; delete app.BD.testMorale2; delete app.BD.testSacred; delete app.BD.testUntyped;
  app.S.buffs = origBuffs;
}

// ── parseAbilityDmg ──
suite('parseAbilityDmg');
{
  eq(app.parseAbilityDmg('constrict (1d6+3)', 'constrict'), '1d6+3', 'direct: constrict (dice)');
  eq(app.parseAbilityDmg('rend (2 claws, 1d4+6)', 'rend'), '1d4+6', 'comma: rend (stuff, dice)');
  eq(app.parseAbilityDmg('death roll (1d8+6 plus trip)', 'death roll'), '1d8+6', 'plus-text: death roll');
  eq(app.parseAbilityDmg('powerful charge (gore, 4d6+12)', 'powerful charge'), '4d6+12', 'comma: powerful charge');
  eq(app.parseAbilityDmg('earth mastery', 'constrict'), '', 'no match → empty string');
  eq(app.parseAbilityDmg('', 'gnaw', { dataField: '1d8+6 plus trip' }), '1d8+6', 'dataField fallback extracts dice');
  eq(app.parseAbilityDmg('', 'gnaw', {
    abilities: [{ name: 'Gnaw (Ex)', desc: 'inflicts automatic bite damage (1d8+3).' }]
  }), '1d8+3', 'special_abilities fallback');
  eq(app.parseAbilityDmg('', 'whirlwind', {
    melee: 'slam +10 (2d8+5)', atkName: 'slam'
  }), '2d8+5', 'melee attack fallback');
}

// ── mkCreature — ability flags ──
suite('mkCreature flags');
{
  const c = app.mkCreature(app.B['giant spider'], false);
  ok(c.hasWeb, 'Giant Spider has web');
  eq(c.webAtk.bonus, 5, 'web bonus +5');
  eq(c.webAtk.dc, 12, 'web DC 12');
  eq(c.webAtk.hp, 2, 'web HP 2');
}
{
  const c = app.mkCreature(app.B['giant spider'], true);
  eq(c.webAtk.dc, 14, 'augmented web DC 14 (+2 Con)');
  eq(c.webAtk.bonus, 5, 'augmented web bonus unchanged (Dex-based)');
}
{
  const c = app.mkCreature(app.B['constrictor snake'], false);
  ok(c.constrictDmg, 'Constrictor Snake has constrict damage');
}
{
  const c = app.mkCreature(app.B['lion'], false);
  ok(c.hasPounce, 'Lion has pounce');
  ok(c.hasRake, 'Lion has rake');
  ok(c.rakeAtks.length > 0, 'Lion has rake attacks');
}
{
  const e = app.B['dire ape'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasRend, 'Dire Ape has rend');
    ok(c.rendDmg, 'Dire Ape has rend damage');
  }
}
{
  const e = app.B['crocodile'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasDeathRoll, 'Crocodile has death roll');
    ok(c.deathRollDmg, 'Crocodile has death roll damage');
  }
}
{
  const e = app.B['giant moray eel'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasGnaw, 'Giant Moray Eel has gnaw');
    ok(c.gnawDmg, 'Giant Moray Eel has gnaw damage');
  }
}
{
  const e = app.B['triceratops'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasPowerfulCharge, 'Triceratops has powerful charge');
    ok(c.powerfulChargeDmg, 'Triceratops has powerful charge damage');
    ok(c.hasTrample, 'Triceratops has trample');
    ok(c.trampleDmg, 'Triceratops has trample damage');
    ok(c.trampleDC > 0, 'Triceratops has trample DC');
  }
}
{
  const e = app.B['elder earth elemental'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasEarthMastery, 'Elder Earth Elemental has earth mastery');
  }
}
{
  const e = app.B['hill giant'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasRockThrowing, 'Hill Giant has rock throwing');
    ok(c.rockAtk, 'Hill Giant has rock attack data');
    ok(c.rockAtk.dmg, 'Hill Giant rock has damage string');
  }
}
{
  const e = app.B['huge air elemental'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasWhirlwind, 'Huge Air Elemental has whirlwind');
    ok(c.whirlwindDC > 0, 'Huge Air Elemental has whirlwind DC');
  }
}

// ── preRoll + computeRoll pipeline ──
suite('pipeline: Giant Spider');
{
  setDice([10, 5, 3, 4, 8, 12]); // bite d20=10, bite dmg rolls, web d20=8
  const c = app.mkCreature(app.B['giant spider'], false);
  app.preRoll(c);
  const pr = app.computeRoll(c);
  ok(pr, 'computeRoll returns result');
  eq(pr.rows.length, 2, '2 rows: bite + web');
  const webRow = pr.rows.find(r => r.isWeb);
  ok(webRow, 'web row exists');
  eq(webRow.dmg, 0, 'web row has no damage');
  eq(webRow.name, 'web (touch)', 'web row name');
  const biteRow = pr.rows.find(r => !r.isWeb);
  ok(biteRow, 'bite row exists');
  ok(biteRow.dmg > 0, 'bite has damage');
}

suite('pipeline: Constrictor Snake');
{
  setDice([15, 3, 4, 2, 6]);
  const e = app.B['constrictor snake'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const constrictRow = pr.autoRows.find(r => r.isConstrict);
    ok(constrictRow, 'constrict auto-row exists');
    ok(constrictRow.dmg > 0, 'constrict has damage');
  }
}

suite('pipeline: Lion pounce');
{
  setDice([15, 4, 3, 12, 5, 2, 18, 6, 3, 10, 4, 2, 8, 3, 2, 14, 5, 3, 16, 4, 2]);
  const e = app.B['lion'];
  if (e) {
    const c = app.mkCreature(e, false);
    c.pouncing = true; // activate pounce
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const rakeRows = pr.rows.filter(r => r.isRake);
    ok(rakeRows.length > 0, 'pouncing lion has rake rows');
  }
}

suite('pipeline: Hill Giant rock');
{
  setDice([15, 4, 3, 5, 6, 12, 3, 4, 5, 6, 10, 4, 5]);
  const e = app.B['hill giant'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const rockRow = pr.rows.find(r => r.isRanged);
    ok(rockRow, 'rock throwing ranged row exists');
    ok(rockRow.dmg > 0, 'rock has damage');
  }
}

// ── Tier 2b/2c ability flags ──
suite('mkCreature Tier 2b/2c');
{
  const e = app.B['manticore'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasSpikes, 'Manticore has spikes');
    ok(c.spikesAtk, 'Manticore has spikes attack data');
    eq(c.spikesAtk.count, 4, 'Manticore has 4 spikes');
    ok(c.spikesAtk.dmg, 'spikes have damage string');
  }
}
{
  const e = app.B['giant skunk'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasMusk, 'Giant Skunk has musk');
    ok(c.muskAtk, 'Giant Skunk has musk attack data');
    eq(c.muskAtk.dc, 17, 'musk DC 17');
    eq(c.muskAtk.bonus, 5, 'musk ranged touch +5 (BAB 3 + Dex 3 - Large 1)');
    eq(c.muskAtk.range, '30 ft.', 'musk range 30 ft.');
  }
}
{
  const e = app.B['giant skunk'];
  if (e) {
    const c = app.mkCreature(e, true);
    eq(c.muskAtk.dc, 19, 'augmented musk DC 19 (+2 Con)');
    eq(c.muskAtk.bonus, 5, 'augmented musk bonus unchanged (Dex-based)');
  }
}
{
  const e = app.B['electric eel'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasElectricity, 'Electric Eel has electricity');
    eq(c.electricityDC, 15, 'electricity DC 15');
  }
}
{
  const e = app.B['electric eel'];
  if (e) {
    const c = app.mkCreature(e, true);
    eq(c.electricityDC, 17, 'augmented electricity DC 17 (+2 Con)');
  }
}
{
  const e = app.B['giant porcupine'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasQuills, 'Giant Porcupine has quills');
    ok(c.quillsDmg, 'Giant Porcupine has quills damage');
  }
}
{
  const e = app.B['huge water elemental'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasDrench, 'Huge Water Elemental has drench');
  }
}
{
  const e = app.B['giant frog'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasPull, 'Giant Frog has pull');
    ok(c.pullDist, 'Giant Frog has pull distance');
  }
}
{
  const e = app.B['fire giant'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasHeatedRock, 'Fire Giant has heated rock');
    ok(c.heatedRockDmg, 'Fire Giant has heated rock damage');
    ok(c.hasRockThrowing, 'Fire Giant has rock throwing');
  }
}
{
  const e = app.B['aurochs'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasStampede, 'Aurochs has stampede');
    ok(c.hasTrample, 'Aurochs has trample');
  }
}
{
  const e = app.B['stirge'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasAttach, 'Stirge has attach');
    ok(c.hasBloodDrain, 'Stirge has blood drain');
  }
}
{
  const e = app.B['mephit'];
  if (e) {
    const c = app.mkCreature(e, false);
    ok(c.hasBreathWeapon, 'Mephit has breath weapon');
    ok(c.breathDC > 0, 'Mephit has breath DC');
    ok(c.breathShape, 'Mephit has breath shape');
  }
}

suite('pipeline: Manticore spikes');
{
  setDice([15, 4, 3, 12, 5, 2, 18, 6, 3, 10, 4, 2, 8, 3, 14, 5, 16, 4, 11, 3, 2, 17, 5, 3, 9, 2, 1]);
  const e = app.B['manticore'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const spikeRows = pr.rows.filter(r => r.name.includes('spike'));
    eq(spikeRows.length, 4, 'Manticore has 4 spike rows');
    ok(spikeRows[0].isRanged, 'spike rows are ranged');
    ok(spikeRows[0].dmg > 0, 'spike has damage');
  }
}

suite('pipeline: Fire Giant heated rock');
{
  setDice([15, 4, 3, 5, 6, 12, 3, 4, 5, 6, 10, 4, 5, 8, 3, 2, 14, 6, 4]);
  const e = app.B['fire giant'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const rockRow = pr.rows.find(r => r.name.includes('rock'));
    ok(rockRow, 'Fire Giant has rock row');
    ok(rockRow.name.includes('+fire'), 'rock row includes +fire label');
    ok(rockRow.heatedRockDmg, 'rock row has heated rock damage');
  }
}

suite('pipeline: Giant Skunk musk');
{
  setDice([10, 3, 4, 5, 6, 14]);
  const e = app.B['giant skunk'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    const muskRow = pr.rows.find(r => r.isMusk);
    ok(muskRow, 'musk row exists');
    eq(muskRow.dmg, 0, 'musk row has no damage');
    ok(muskRow.isRanged, 'musk row is ranged');
    ok(muskRow.name.includes('musk'), 'musk row name');
  }
}

suite('pipeline: Electric Eel electricity');
{
  setDice([10, 3, 15, 4]);
  const e = app.B['electric eel'];
  if (e) {
    const c = app.mkCreature(e, false);
    app.preRoll(c);
    const pr = app.computeRoll(c);
    // Eel has bite + tail — both melee, no separate electricity row
    ok(pr.rows.length >= 2, 'Electric Eel has 2+ attack rows');
    const tailRow = pr.rows.find(r => r.name.includes('tail'));
    ok(tailRow, 'tail row exists');
  }
}

// ── Buff toggle invariant: no reroll ──
suite('buff toggle invariant');
{
  setDice([10, 3, 4, 8]);
  const c = app.mkCreature(app.B['giant spider'], false);
  app.preRoll(c);
  const rawBefore = JSON.stringify(c.rawRoll);
  // Compute with no buffs
  const pr1 = app.computeRoll(c);
  const bite1 = pr1.rows.find(r => !r.isWeb);
  // Simulate enabling a buff — compute again
  const origBuffs = { ...app.S.buffs };
  app.BD._testBuff = { a: 2, d: 2, s: 0, ty: 'u', name: 'Test' };
  app.S.buffs = { _testBuff: true };
  const pr2 = app.computeRoll(c);
  const bite2 = pr2.rows.find(r => !r.isWeb);
  // rawRoll must be identical
  eq(JSON.stringify(c.rawRoll), rawBefore, 'rawRoll unchanged after buff toggle');
  // bonus should differ by buff amount
  eq(bite2.bonus - bite1.bonus, 2, 'attack bonus increased by buff');
  // Cleanup
  delete app.BD._testBuff;
  app.S.buffs = origBuffs;
}

// ── Animal companions ──
suite('companions');
{
  const bE = app.B['zerda'];
  ok(bE, 'Zerda registered in B');
  eq(bE.sna_level, 0, 'Zerda sna_level 0 (out of summon dropdown)');
  const c = app.mkCreature(bE, false);
  eq(c.name, 'Zerda', 'name');
  eq(c.maxHp, 90, 'HP 90');
  eq(c.ac, 23, 'AC 23');
  eq(c.cmb, 6, 'CMB +6');
  eq(c.cmd, 21, 'CMD 21');
  eq(c.fort, 8, 'Fort +8');
  eq(c.attacks.length, 2, 'two bite attacks (+8/+3)');
  eq(c.attacks[0].bonus, 8, 'first bite +8');
  eq(c.attacks[1].bonus, 3, 'second bite +3');
  eq(c.attacks[0].dmg, '1d4+1', 'bite 1d4+1');
  eq(c.str, 12, 'Str 12 (no augment — addCompanion always passes aug=false)');
}

// ── Greater Magic Fang ──
suite('Greater Magic Fang');
{
  const origBuffs = { ...app.S.buffs };
  // Pin caster level to 10 so gmfBonus() = floor(10/4) = +2 (stub elements default to value '').
  const origGetById = globalThis.document.getElementById;
  globalThis.document.getElementById = (id) => id === 'inp-cl' ? { value: '10' } : origGetById(id);

  // gmfAll (all natural weapons, flat +1) is a uniform enhancement — stays in bTotal.
  app.S.buffs = { gmfAll: true };
  let t = app.bTotal({});
  eq(t.a, 1, 'GMF-all flat +1 attack (uniform)');
  eq(t.d, 1, 'GMF-all flat +1 damage (uniform)');
  // gmf (one weapon) is pulled OUT of the uniform total — applied per-weapon in computeRoll.
  app.S.buffs = { gmf: true };
  eq(app.bTotal({}).a, 0, 'GMF primary mode is not in the uniform bTotal (handled per-weapon)');

  const claws = pr => pr.rows.filter(r => /claw/i.test(r.name));
  const bite = pr => pr.rows.find(r => /^bite/i.test(r.name));

  // Zerda: one natural weapon (bite) → BOTH bites get +2 and are flagged gmfHit.
  setDice([10]);
  const z = app.mkCreature(app.B['zerda'], false);
  app.preRoll(z);
  app.S.buffs = {};
  const zBase = app.computeRoll(z).rows.filter(r => /bite/i.test(r.name)).sort((a, b) => b.baseBonus - a.baseBonus);
  app.S.buffs = { gmf: true };
  const zBuff = app.computeRoll(z).rows.filter(r => /bite/i.test(r.name)).sort((a, b) => b.baseBonus - a.baseBonus);
  eq(zBuff.length, 2, 'Zerda two bite rows under GMF');
  for (let i = 0; i < 2; i++) {
    eq(zBuff[i].bonus - zBase[i].bonus, 2, `Zerda bite ${i + 1} attack +2`);
    ok(zBuff[i].gmfHit, `Zerda bite ${i + 1} flagged gmfHit`);
  }

  // Lion: bite + 2 claws → GMF auto-picks claws (2 attacks beats 1); bite untouched.
  setDice([10]);
  const lion = app.mkCreature(app.B['lion'], false);
  app.preRoll(lion);
  app.S.buffs = {};
  const lBase = app.computeRoll(lion);
  app.S.buffs = { gmf: true };
  const lBuff = app.computeRoll(lion);
  const c0 = claws(lBase), c1 = claws(lBuff);
  eq(c1.length, 2, 'lion two claw rows');
  for (let i = 0; i < 2; i++) {
    eq(c1[i].bonus - c0[i].bonus, 2, `lion claw ${i + 1} +2 from GMF`);
    ok(c1[i].gmfHit, `lion claw ${i + 1} flagged gmfHit`);
  }
  eq(bite(lBuff).bonus - bite(lBase).bonus, 0, 'lion bite NOT buffed (GMF auto-picked claws)');
  notOk(bite(lBuff).gmfHit, 'lion bite not flagged gmfHit');

  // Enhancement non-stack: gmf + gmfAll → claws max(2,1)=+2, bite gets the uniform +1.
  app.S.buffs = { gmf: true, gmfAll: true };
  const lBoth = app.computeRoll(lion);
  eq(claws(lBoth)[0].bonus - c0[0].bonus, 2, 'claws +2 (max of gmf +2 / all +1, no stack)');
  eq(bite(lBoth).bonus - bite(lBase).bonus, 1, 'bite +1 from gmfAll only');

  // Cross-type stack: gmf (enhancement) + prayer (morale) → claws +3, bite +1.
  app.S.buffs = { gmf: true, prayer: true };
  const lPray = app.computeRoll(lion);
  eq(claws(lPray)[0].bonus - c0[0].bonus, 3, 'claws +3 (enh +2 + morale +1)');
  eq(bite(lPray).bonus - bite(lBase).bonus, 1, 'bite +1 (morale only, no GMF)');

  app.S.buffs = origBuffs;
  globalThis.document.getElementById = origGetById;
}

// ═══════════════════════════════════════════════════════════════
//  SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(40)}`);
if (fail === 0) {
  console.log(`  ALL ${pass} TESTS PASSED`);
} else {
  console.log(`  ${pass} passed, ${fail} FAILED`);
}
console.log('═'.repeat(40));
process.exit(fail > 0 ? 1 : 0);
