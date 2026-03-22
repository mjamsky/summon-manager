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

Single file: `index.html` (~1550 lines). Do not split unless explicitly doing the CSS/JS separation backlog item.

| Section | Lines (approx) | Contents |
|---------|-------|----------|
| `<style>` | 9–390 | `:root` color tokens, all component styles, responsive breakpoints (≤1024px, ≤480px) |
| `<body>` | 390–500 | Static shell: title bar, numpad popup, setup drawer, output divs, bottom dock |
| `<script>` | 500–1550 | State, dice, buffs, spell defs, melee parser, tier logic, pre-roll, render, spell cards, numpad, actions, persistence, init |

Section markers: `<!-- ═══ Section ═══ -->` in HTML, `// ═══ SECTION ═══` in JS.

## Coding Conventions

### CSS-First Principle

JS is the "backend" — it manages state and data. CSS handles all presentation.

- **Do**: set data attributes or CSS classes in JS, style them in CSS (e.g., `.chip.on`, `.ccard.dead`, `.casting`)
- **Do**: use CSS transitions/animations for visual state changes
- **Don't**: use inline `style=` in template literals for fixed or categorical values
- **Exception**: HP bar fill width (`style="width:${pct}%"`) is acceptable — it's per-instance continuous data
- **Migrate**: dead card dimensions and dropdown column width currently use JS-computed inline styles and should move to CSS

### State & Render Cycle

- **`S`** = single mutable state: `{ round, groups[], effects[], feats{}, buffs{} }`
- **`B`** = bestiary (name→data), **`R`** = ratings (level→name→tier) — both read-only after init
- **`dismissed`** = dismissed creatures (separate from `S`, persisted in localStorage)
- **Cycle**: mutate `S` → call `render()` → DOM rebuilt via template literals → `saveState()` called automatically
- **Pre-roll strategy**: `preRoll(c)` stores raw d20s and damage dice at summon time. `computeRoll(c)` recalculates bonuses from current `S.buffs`/`S.feats` at render time. Buff toggles call `render()` (recalculate only). Feat toggles call `reroll()` (re-roll all dice, because feats like Haste add/remove attack rows).

### Event Handling

- Static HTML elements: inline `onclick` calling named global functions
- Template-generated HTML (cards, roll tables): inline `onclick` in template literals
- Document-level: one `addEventListener('click')` for dropdown outside-click dismissal
- Keep this pattern. No event delegation framework.

### Icons

`IC` object returns inline SVG strings. All use `fill="currentColor"`. Special pips (grab, trip, poison, burn) are 8×8 colored circles. No CDN, no icon fonts — keep icons self-contained.

### Layout

CSS Grid (`repeat(auto-fill, 280px)`) — all cards (creatures + spells) flow in a single flat grid. No wrapper containers for groups. Group identity via colored pills (`.gpill`) on card top borders. 5-color palette for creature groups, 4 purple shades for spell groups.

### Adding a Spell Effect

1. Add entry to `SE` object: `name, dmg, dmgType, spLv, save, note, dc(cl), dur(cl)` — optionally `count(cl)` for multi-entity spells
2. Add `<button onclick="addSpell('key')">Label</button>` to `.bar-spells` in the Summon tray
3. DC uses `castMod()` which reads the Cast Mod input in Setup tray
4. Spell cards auto re-roll damage on NEXT ROUND

### Adding a Buff

1. Add entry to `BD` object: `name: {a: atkBonus, d: dmgBonus, s: saveBonus, ty: 'type'}` — types: `'morale'`/`'sacred'` (highest wins), `'u'` (untyped, stacks), `'haste'` (extra attack), `'sp'` (special handling)
2. Add `<span class="chip" data-buff="name" onclick="tBuff(this)">Label</span>` to `#tray-buffs` in HTML
3. Stacking math in `bTotal()` is automatic

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
| Grab | Only on attacks listing "plus grab" (lion: bite only, not claws). CMB +4 for grab/maintain. |
| Crit | Confirm roll vs AC. Per-attack multiplier (×2 default, ×3 for some). |
| Fumble | House rule: nat 1 → reroll → miss = crit fail. Not RAW. |
| Damage types | Per UMR: bite=B/P/S, claw=B/S, gore=P, slam=B, etc. See `DMG_TYPE` object. |
| Augment Summoning | +4 Str/+4 Con at creature creation, not as a runtime buff. Affects HP, atk, dmg, CMB, CMD, Fort. |

## Gotchas

- **Smart quote in vault path**: `Serpent's Skull` — use glob patterns (`Serpent*`) in Python, not hardcoded apostrophe strings
- **Naz cannot cast spells** — Fighter class, no exceptions
- **Lion figurines**: 1hr/day duration, not permanent. `rl:600` in code.
- **Branch is `master`**, no remote configured
- **`preRoll` vs `render()`**: calling `preRoll` changes dice. If you only need to update bonuses, call `render()`. `tBuff()` → `render()`. `tFeat()` → `reroll()` (which calls `preRoll` for all creatures).

## Do Not

- Add frameworks, libraries, or `package.json`
- Add a build step (webpack, vite, esbuild)
- Split `index.html` into multiple files (unless explicitly doing the CSS/JS separation backlog item)
- Use `el.style.*` or inline `style=` for things CSS classes can handle
- Add icon fonts or CDN dependencies
