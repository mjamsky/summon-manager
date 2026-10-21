# Backlog

## Next Up
- [x] Dock rework — move summon/setup into bottom dock as tray tabs. Tab order left-to-right: Summon | Buffs | Dismissed | Setup. Summon tab is visually prominent (right-aligned or larger). Tabs styled as notch cutouts *into* the dock — tray pulls up through the notch, tab is the handle. Subtle inset depth, not skeuomorphic. Fix dock spacing overall.
- [x] Rename "Trash" → "Dismissed" throughout UI and code (bundle with dock rework)
- [x] Dock tab visual fix — tabs shifted up to cover dock top border, no top border, left/bottom/right match dock.
- [x] Consolidate tray contents — Items in Summon tray, Settings (CL + feats) in Setup tray, Claude Import in top bar.
- [x] Shimmer rework — Facebook-style CSS shimmer (gold sweep over green) on active specials
- [x] HP keypad popup — numpad replaces [−][input][+] on creature cards and AC reference input in dock
- [x] Battlefield spell cards — Flaming Sphere (cast + wand), Ball Lightning as full cards in creatures-flow with pre-rolled damage + re-roll
- [x] Dismissed persistence — dismissed creatures survive page refresh via localStorage

## Features
- [x] Greater Magic Fang buff (dual nature) — `gmf` chip = one natural weapon, +1 per 4 CL (max +5, scales off Caster Level input, label shows live value); `gmfAll` chip = all natural weapons flat +1. New `enh` (enhancement) buff type: highest wins, doesn't stack with itself, stacks with morale/sacred/etc. Verified vs Archives of Nethys.
- [x] GMF Mode A single-weapon targeting — pulled out of the uniform buff total; auto-targets the "best" natural weapon (`gmfBestWeapon()`: grouped by EXACT name = one appendage; most attacks of that weapon, tiebreak highest bonus then avg damage) and applies per-row only to that weapon. Strict RAW: multiple appendages are separate weapons, so only ONE benefits — Lion → bite only (claws untouched); Zerda → both bites (one weapon, two attacks). Chosen rows show a ✦ marker. Enhancement non-stacks with `gmfAll` (best weapon = max). Not yet applied to rake/auto-damage rows (future).
- [x] Animal companion card — hand-authored statblocks in `COMPANION_DATA` (Zerda), registered into `B` at `sna_level:0` so they stay out of the summon dropdown. `addCompanion(key)` adds a non-expiring `src:'companion'` group (∞ duration badge, never decremented in `nextRound`). "Allies: Zerda" button in Summon tray. Reuses full mkCreature/render/buff/persist pipeline. Source of truth: vault `Current Build.md` (Zerda section); RPG Scribe should agree.
- [x] Constrict auto-damage — no-roll row in attack table (muted until grapple toggled). Maintain auto-dmg row (grab attack damage) shown when grappling. Maintain CMB includes +4 grab +5 circumstance.
- [x] Buff/toggle rework — decisions row (flank/pounce/grapple/PA) above attack table, buff chips muted below. Flanking per-creature. Per-creature local buff [+] button. No toggles reroll dice.
- [x] Power Attack toggle — detected from creature feats, -X atk/+2X dmg (3x for single natural attack). 38 creatures have it. Notable feats (CE, Lunge, Cleave) surfaced as badges.
- [x] Animal Growth (druid 5) — per-creature "Grow" decision toggle (`togGrowth`). Single-target size +1: net +3 atk (+4 Str −1 size), +4 dmg, and damage **dice step up one size** on all natural/grapple/charge damage (grown dice pre-rolled at summon via `growDice()`/`SIZE_STEP`, picked at render so toggling never re-rolls). Stateful bits applied/reversed atomically in the toggle: +2 HP/HD, +2 Fort / −1 Ref, reach & space +5 ft, size label +1. AC net 0 (−1 size, −1 Dex, +2 natural armor). Tests in `test.js`.
- [x] Target AC affordance — "TARGET AC" label + border on dock AC touchpoint.
- [x] Bestiary feat/ability data layer — build_bestiary.py parses badges, CMB feats, 15+ ability flags. Triceratops crit fix.
- [x] Tactical badges with tooltips — Flyby, Spring Attack, Combat Reflexes, Diehard
- [x] Combat Reflexes AoO count is 1 + Dex bonus (`aooCount()`), not the Dex bonus alone; Zerda shows 5. RAW: the feat's AoOs are additional to the normal one.
- [x] Zerda synced to the vault build (2026-10-19/21): bite +11/+6 (Weapon Finesse), 9d8, AC 24 / touch 16 / flat-footed 19 with Bracers of Armor +1, feats, fennec senses (blindsense, no scent), Desert Runner and Sand Hunter, skills (Stealth +13, Linguistics -2). Tests in `test.js`.
- [x] Disease + Stun pip icons
- [x] CMB feat lines in ability section — Bull Rush, Overrun, Sunder, Awesome Blow, Greater variants
- [x] Bleeding/Staggering Critical — conditional legend text on crit confirm
- [x] Web ranged touch attack — parsed from Special_Attacks, attack row + entangle, DC/HP legend
- [ ] Grab -20 hold option — creature takes -20 CMB to avoid grappled condition, can full attack + maintain. Only constrict dmg (no auto grab-attack dmg). Surface for high-CMB creatures only?
- [x] Power Attack damage multiplies on crit — was added to `dmgBase` once but omitted from the `*extraMults` term, so a ×2 crit applied PA ×1. Fixed in the standard attack path (`computeRoll`); regression test added. NOTE: the **powerful-charge gore** crit path (`computeRoll` ~line 685) has the same PA-not-multiplied gap — niche, fix with its own test.
- [x] Flanking +2 leaks onto ranged attack rows — FIXED: melee-only attack bonuses (flanking, Animal Growth's Str-driven +3) tracked as `b.meleeOnlyAtk` in `computeRoll` and subtracted in `buildRangedRow`; Earth/Water Mastery still applies to a thrown rock. Regression test added (giant spider bite vs web). Rules: `RAW-CORRECTNESS-SPEC.md` §2.
- [x] Apply buff AC mods to displayed card AC — DONE: `effAC(c)`/`acDelta(c)` helpers; card AC + statblock AC show `c.ac + b.ac` with `.ac-up`/`.ac-down` color + a "Base AC N, buffs ±X" title. Added `ac:1` to the `haste` BD entry (dodge). Verified live: rage 14→12, haste 14→15, both→13 (dodge stacks). (+1 Reflex is the deferred saves item.) Rules: `RAW-CORRECTNESS-SPEC.md` §3.
- [x] **RAW: natural-attack Str-to-damage multiplier** — DONE. `b.d` still carries Str-boost buffs at the PRIMARY rate (rage +1, Animal Growth +4); per melee row `computeRoll` applies `strInc(baseStrMod, strModDelta, m) − strModDelta` to shift only the Str portion to the attack's real multiplier — secondary ×½, lone natural attack ×1½ (helpers `strMultipliers`/`strContrib`/`strInc`/`natType`). Primary rows and all auto/ranged rows unchanged (zero regression). Classification uses the spec §1 default table (statblock per-creature overrides NOT tracked — documented limitation). Verified live: grown Crocodile bite +4 Str, tail slap +2 (half). Tests added. Rules: `RAW-CORRECTNESS-SPEC.md` §1.
- [ ] **RAW: buff bonuses on displayed saves (DEFERRED — lowest value)** — `b.s` is computed but applied to nothing; the card renders static `c.fort/ref/will` (app.js ~1708). RAW-correct means per-save-*type* contributions: bless = +1 morale vs **fear only**, prayer/heroism = all three saves, rage spell = Will only, haste = +1 dodge **Reflex only**. Deferred because saves are a reference readout the app never rolls against (unlike AC). Rules: `RAW-CORRECTNESS-SPEC.md` §3–4.
- [ ] **Trample is its own subsystem, not a Str-multiplier natural attack** — when the Str-multiplier work above lands, ensure trample auto-rows are NOT run through primary/secondary classification. RAW trample = 1½× Str, one die per action, separate Reflex-half save (`RAW-CORRECTNESS-SPEC.md` §1 note). Verify against how `computeRoll` currently builds the trample auto-row.
- [ ] Conditions system (sickened, blind, paralyzed)
- [x] Effect damage rendering inline — superseded by spell cards (alert removed)
- [ ] Versatile Summoning feat in setup (Aerial/Aqueous/Chthonic/Dark/Fiery templates)
- [ ] Poison expanded info — onset, frequency, cure, specific ability damage in legend
- [ ] Bulette pounce — "Leap" ability is a conditional pounce (DC 20 Acrobatics, claws only, no bite). Needs `pounce` in Special_Attacks or custom Leap toggle logic.
- [ ] Stirge attach-only attack — `touch +7 (attach)` has no damage dice (correct per PF1e). Suppress empty damage column for attach-only attacks.

## Polish
- [x] HP numpad tap target — HP bar is now clickable with expanded touch area
- [x] Visual revamp Phase 1 — Foundation: CSS token system (spacing, text hierarchy, surfaces, HP ramp), self-hosted Vollkorn + Alegreya Sans fonts (base64 woff2), noise texture, font-feature-settings tnum on roll numbers
- [x] Visual revamp Phase 2 — Surface & Depth: Twilight Stone palette, neumorphic card shadows, inset troughs (HP bar, inputs, AC well), inlaid windows (ability sections), warm HP ramp (olive→gold→ember)
- [x] Visual revamp Phase 3 — Attack Table: ember glow AC threshold line, dotted row separators, warm roll state colors (muted miss, olive hit, gold crit, ember fumble), 2-variant shimmer (glint + crit)
- [x] Visual revamp Phase 4 — Toggles & Pips: unified 3-tier toggle system (situational/state/decision), clip-path shaped pips (half-circle, triangle, diamond, star, square, hexagon)
- [x] Visual revamp Phase 5 — Dock & Trays: stone slab dock with noise, keystone clip-path tabs, inlaid tray panels with accent bars, groove+ember junction, button hierarchy (ghost/gold/olive-green CTA)
- [x] Visual revamp Phase 6 — Cards & Groups: groove+glow group identity (top border, 5 warm colors), removed gpill system, warm numpad/buff popup, inset groove card section separators
- [x] Visual revamp Phase 8 — Polish: centered grid, dead CSS removal, warm HP text, phone breakpoint (280px centered)
- [x] Visual revamp Phase 7 — Stat Block Popover: centered popover on creature name tap, replaces inline show-stats expand
- [x] Statblock popup vs expand — implemented as modal/popup overlay. Scrim click, × button, Escape to dismiss. No grid reflow.
- [ ] iPad Mini 5th gen pass — verify all layouts, touch targets, and trays in 1024×768 landscape + portrait
- [x] Dock 820px breakpoint — shrink action buttons instead of tray tab notches
- [x] Buffs tray container spacing fix — row-gap on chip-row, ::before pulled out of flex flow

## Refactor (after features stabilize)
- [x] renderCard() decomposition — extracted renderDeadCard(), renderBuffChips(), renderDecisions(), renderRollTable(), renderSpecialsLegend(), renderAbilities(), renderStatBlock(). renderCard() is now ~40 lines of assembly.
- [x] CSS/JS separation — all inline styles migrated to CSS. HP bar uses raw custom properties (`--hp-cur`, `--hp-max`) with CSS `calc()`. Dropdown stats, buff popup text use CSS classes. Zero inline `style=` rules remain.
- [x] Dead card wrapper — moved inline style to `.dead-wrap` CSS class
- [x] DRY refactor — extracted parseAbilityDmg(), preRoll auto-damage loop, buildAutoRow(), buildRangedRow(), EXTRA_LEGENDS. Test harness (70 tests, `node test.js`).
- [ ] Dead creatures: [x] dismiss to Dismissed tray (current sideways layout is fine)
- [ ] updTiers() called inside render() rebuilds dropdown every render — only needed when slot/tier selection changes.
- [ ] Global function namespace — consider namespacing (e.g., `App.doSummon()`) as function count grows.
- [ ] Error boundary — try/catch around renderCard() with fallback "error" card to prevent one bad creature from blanking the board.

## Ability Surfacing — see `ABILITY-PLAN.md` for full plan

### Tier 1 remaining (Batches C + D — attack table rows + toggles + triggers)
- [x] Rend auto-damage row at bottom of table (Dire Ape, Girallon). Active when 2+ claws hit vs AC.
- [x] Death Roll auto-damage row (Crocodile, Dire Croc). Constrict pattern + trip tooltip with size note.
- [x] Gnaw: auto-damage row + pre-rolled bonus bite in grapple mode (Giant Moray Eel).
- [x] Earth/Water Mastery situational toggles (+1 atk/+1 dmg, persistent)
- [x] Powerful Charge situational toggle (swap gore dice, one-shot auto-off)
- [x] One-shot auto-off on Next Round: Pounce + Powerful Charge
- [x] Triggered buff system — generic `{ on: 'event', apply: 'buff_id' }` infrastructure
- [x] Rage via triggered buff (Wolverine, Dire Badger — on damage → auto-apply)
- [x] Diehard HP logic fix (death at -Con not 0, Woolly Rhino + T-Rex)

### Tier 2 (mode toggles + state changes + ranged)
- [x] Trample mode toggle (one-shot: suppress attacks, show damage + Ref DC)
- [x] Vital Strike mode toggle (one-shot: single attack, doubled/tripled dice)
- [x] Whirlwind state change (persistent: suppress attacks, damage/round + Ref DC)
- [x] Vortex state change (same as whirlwind, water)
- [x] Rock Throwing ranged attack row (5 giants, SNA 6-8)

### Tier 2b (ranged + special attacks from bestiary audit)
- [x] Web ranged touch attack (Giant Spider) — parsed from Special_Attacks, entangle on hit, DC/HP legend
- [x] Spikes ranged volley (Manticore) — 4 ranged attack rows via buildRangedRow, computed from BAB+Dex/Str
- [x] Electricity ranged touch (Electric Eel) — melee touch parsed, Fort DC stun on crit legend
- [x] Musk ranged spray (Giant Skunk) — ranged touch row + Fort DC nauseated legend (2/day)
- [x] Breath Weapon (Mephit) — auto-damage row + Ref DC + shape, 4-round cooldown legend
- [x] Heated Rock (Fire Giant) — +fire label on rock throwing rows, damage in legend
- [x] Stampede (Aurochs) — conditional trample legend (requires 3+ creatures)

### Tier 2c (legend/info lines from bestiary audit)
- [x] Drench legend (Water Elementals, 6x) — informational: extinguishes fire effects
- [x] Pull legend (Giant Frog) — drag distance on hit
- [x] Quills legend (Giant Porcupine) — reactive damage when hit by melee
- [x] Attach + Blood Drain (Stirge) — grapple mechanic + Con damage/round legend

### Tier 3 (new interaction patterns)
- [ ] Cleave / Great Cleave inline row action — button on attack row, spawns new roll on click. Great Cleave chains.
- [ ] Swallow Whole popover (8 creatures) — grapple sub-state overlay with escape mechanics
- [ ] Engulf (Giant Flytrap) — grapple + acid/round, like swallow whole

## Refactor (future)
- [ ] Triggered buff system migration — annotate existing hardcoded conditional logic (constrict, rake, pounce, death at 0 HP) as candidates for trigger system unification

## Deployment & Portability
- [ ] `build.py` — inline script that concatenates style.css, bestiary.js, app.js into index.html → produces single `sna-manager.html`. Keep 4-file split for dev, single file for deploy.
- [ ] PWA support — add `manifest.json` + minimal service worker for offline caching and iPad "Add to Home Screen" with app icon. Layered on top of build output.
- [ ] iCloud / AirDrop workflow — document how to drop built file into iCloud Drive or AirDrop to iPad for zero-server usage.

## Future
- [ ] Spell layer — broader spell management beyond quick buttons (spell slots, concentration tracking, CL overrides, full spell list from Battlefield-Entities-Reference.md)
- [ ] Expanded spell/item support (wand charges, figurine activation, overrideable CL)
- [ ] SNA 7-9 community tier ratings
- [ ] Expand beyond SNA to Summon Monster etc.
