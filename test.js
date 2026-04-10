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
