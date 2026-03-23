# SNA Combat Manager

PF1e Summon Nature's Ally combat tool.

## Project Structure

| File | Role |
|------|------|
| `README.md` | What this is, how to run it, rules implemented |
| `TODO.md` | Canonical backlog — all planned work lives here |
| `CLAUDE.md` | Coding conventions, correctness constraints, gotchas (this file) |
| `index.html` | The entire app (single file, no dependencies) |

### Workflow

- **Before starting work**: check `TODO.md` for current priorities and checkboxes.
- **After completing a feature**: tick the checkbox in `TODO.md`. If the item wasn't listed, add it as checked.
- **New ideas during work**: add to the appropriate section in `TODO.md` (Next Up / Architecture / Features / Ideas).
- **Design preferences** (layout philosophy, typography, interaction patterns) are in auto-memory, not in repo files.

## Path Constants

```
APP_ROOT     = /Users/jameson/Documents/Claude Projects/Serpents Skull/summon-manager
VAULT_ROOT   = /Users/jameson/Documents/Obsidian/Serpent's Skull
SRD_BESTIARY = $VAULT_ROOT/Assets/SRD/fantasy-bestiary
```

## Development

```bash
python3 -m http.server 8787          # serve at localhost:8787
python3 build_bestiary.py            # rebuild statblocks/ from SRD vault files
```

No build step, no npm, no bundler. Reload browser to test. Verify: summon a creature, toggle buffs, set AC, advance rounds. Pre-rolls must not change when toggling buffs (only computed bonuses change).

## File Structure

Single file: `index.html` (~2225 lines). Do not split unless explicitly doing the CSS/JS separation backlog item.

| Section | Lines (approx) | Contents |
|---------|-------|----------|
| `<style>` | 9–450 | `:root` color tokens, all component styles, shimmer animations, responsive breakpoints (≤1024px, ≤480px) |
| `<body>` | 450–560 | Static shell: title bar, numpad popup, setup drawer, output divs, bottom dock |
| `<script>` | 560–2220 | State, dice, buffs, spell defs, melee parser, tier logic, pre-roll, render, spell cards, numpad, actions, buff popup, persistence, init |

Section markers: `<!-- ═══ Section ═══ -->` in HTML, `// ═══ SECTION ═══` in JS.

## Coding Conventions

### CSS-First Principle

JS is the "backend" — it manages state and data. CSS handles all presentation. No exceptions.

- **Do**: set data attributes or CSS classes in JS, style them in CSS (e.g., `.chip.on`, `.ccard.dead`, `.casting`)
- **Do**: use CSS transitions/animations for visual state changes
- **Do**: pass dynamic values to CSS via custom properties (`style="--hp:${pct}%"` + CSS `width: var(--hp)`), not inline style rules
- **Don't**: use inline `style=` to set CSS properties directly (e.g., `style="width:42%"`, `style="color:red"`)
- **Why**: CSS custom properties keep presentation in CSS where it belongs. JS passes data, CSS decides how to render it. If the backend changes (React, Rust/WASM, server-rendered), the CSS works unchanged — only the data source swaps out.
- **Migrate**: dropdown column width currently uses JS-computed inline style and should move to CSS

### State & Render Cycle

- **`S`** = single mutable state: `{ round, groups[], effects[], feats{}, buffs{} }`
- **`B`** = bestiary (name→data), **`R`** = ratings (level→name→tier) — both read-only after init
- **`dismissed`** = dismissed creatures (separate from `S`, persisted in localStorage)
- **Cycle**: mutate `S` → call `render()` → DOM rebuilt via template literals → `saveState()` called automatically
- **Pre-roll strategy**: `preRoll(c)` stores raw d20s and damage dice at summon time — including rake, maintain, constrict, and haste rolls regardless of current toggle state. `computeRoll(c)` recalculates bonuses and filters visible rows based on current `S.buffs`/`S.feats`/pounce/grapple toggles at render time. All toggles (buff, feat, pounce, grapple) call `render()` only — never `preRoll()`. Rerolls happen only on RE-ROLL ALL or NEXT ROUND.

### Event Handling

- Static HTML elements: inline `onclick` calling named global functions
- Template-generated HTML (cards, roll tables): inline `onclick` in template literals
- Document-level: one `addEventListener('click')` for dropdown outside-click dismissal
- Keep this pattern. No event delegation framework.

### Icons

`IC` object returns inline SVG strings. All use `fill="currentColor"`. Special pips (grab, trip, poison, burn, disease, stun) are 8×8 colored circles. No CDN, no icon fonts — keep icons self-contained.

### Layout

CSS Grid (`repeat(auto-fill, 280px)`) — all cards (creatures + spells) flow in a single flat grid. No wrapper containers for groups. Group identity via colored pills (`.gpill`) on card top borders. 5-color palette for creature groups, 4 purple shades for spell groups.

### Adding a Spell Effect

1. Add entry to `SE` object: `name, dmg, dmgType, spLv, save, note, dc(cl), dur(cl)` — optionally `count(cl)` for multi-entity spells
2. Add `<button onclick="addSpell('key')">Label</button>` to `.bar-spells` in the Summon tray
3. DC uses `castMod()` which reads the Cast Mod input in Setup tray
4. Spell cards auto re-roll damage on NEXT ROUND

### Adding a Buff

1. Add entry to `BD` object: `name: {a: atkBonus, d: dmgBonus, s: saveBonus, ac: acMod, ty: 'type'}` — types: `'morale'`/`'sacred'` (highest wins), `'u'` (untyped, stacks), `'haste'` (extra attack), `'sp'` (special handling)
2. Add `<span class="chip" data-buff="name" onclick="tBuff(this)">Label</span>` to `#tray-buffs` in HTML
3. Stacking math in `bTotal()` is automatic. `ac` field tracks AC modifiers (e.g. rage -2).
4. Per-creature local buffs: `c.buffOvr[id]=true` enables a non-global buff for one creature. `bTotal()` has a second pass for these. The `[+]` button on each card opens a popup to add local-only buffs.

### Adding a UI Section

1. Add HTML inside the appropriate `<!-- ═══ Section ═══ -->` block
2. Add CSS rules in the corresponding area (keep CSS order matching HTML order)
3. If it needs state, add a field to `S` and handle in `saveState()`/`loadState()`

## PF1e Correctness Constraints

Wrong implementation = wrong combat results. Verify against `Assets/SRD/` when uncertain.

| Rule | Correct Implementation |
|------|----------------------|
| Buff stacking | Same named type (morale, sacred) → highest only. Untyped always stacks. |
| Pounce + rake | Charge → all natural attacks + rake. No grapple needed. |
| Grapple rake | Only if creature started turn already grappling AND succeeds maintain CMB. |
| Grab | Only on attacks listing "plus grab" (lion: bite only, not claws). CMB +4 for grab, +4 grab +5 circ for maintain. |
| Constrict | Auto-damage on ANY successful grapple check (initial grab + maintain). No attack roll. Shown as no-roll row in attack table. |
| Maintain grapple | Standard action. On success: auto grab-attack damage + constrict (if any) + rake attacks (if any). Normal attacks suppressed (standard action consumed). |
| Crit | Confirm roll vs AC. Per-attack multiplier (×2 default, ×3 for some). |
| Fumble | House rule: nat 1 → reroll → miss = crit fail. Not RAW. |
| Damage types | Per UMR: bite=B/P/S, claw=B/S, gore=P, slam=B, etc. See `DMG_TYPE` object. |
| Augment Summoning | +4 Str/+4 Con at creature creation, not as a runtime buff. Affects HP, atk, dmg, CMB, CMD, Fort. |
| Power Attack | NOT baked into statblock numbers (verified against AoN). Toggle applies -X atk / +2X dmg. Single natural attack = +3X (two-handed). X = 1+floor(BAB/4). |
| Flanking | Per-creature toggle, +2 untyped attack. Not a global buff. |

## Gotchas

- **Smart quote in vault path**: `Serpent's Skull` — use glob patterns (`Serpent*`) in Python, not hardcoded apostrophe strings
- **Naz cannot cast spells** — Fighter class, no exceptions
- **Lion figurines**: 1hr/day duration, not permanent. `rl:600` in code.
- **Branch is `master`**, no remote configured
- **`preRoll` vs `render()`**: calling `preRoll` changes dice. If you only need to update bonuses or toggle visibility, call `render()`. ALL toggles (`tBuff`, `tFeat`, `togPounce`, `togGrapple`, `togFlanking`, `togPA`, `togMastery`, `togCharge`) → `render()`. Only `reroll()` and `nextRound()` call `preRoll`.
- **Creature card layout**: decisions row (Flank / Pounce / Charge / E. Mastery / Pwr Atk / Grapple) above attack table. Feat badges (Cleave, CE, Lunge) + tactical badges (Flyby, Sprint, Earth Glide, Diehard, N AoO) below toggles. Buff chips muted at card bottom with `[+]` for local-only buffs.
- **Grapple round tracking**: `c.grappleRound` records when grapple toggled. Same round = initial grab (constrict active, all attacks visible). Next round = maintain mode (normal attacks suppressed, auto-dmg + rake only).
- **Shimmer animations**: `.legend-active` (green/gold), `.shimmer-blue` (maintain text), `.shimmer-red` (confirmed crits). All use same `legend-shimmer` keyframes with different gradient colors.

## Do Not

- Add frameworks, libraries, or `package.json`
- Add a build step (webpack, vite, esbuild)
- Split `index.html` into multiple files (unless explicitly doing the CSS/JS separation backlog item)
- Use `el.style.*` or inline `style=` for things CSS classes can handle
- Add icon fonts or CDN dependencies
