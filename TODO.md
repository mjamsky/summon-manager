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
- [x] Constrict auto-damage — no-roll row in attack table (muted until grapple toggled). Maintain auto-dmg row (grab attack damage) shown when grappling. Maintain CMB includes +4 grab +5 circumstance.
- [x] Buff/toggle rework — decisions row (flank/pounce/grapple/PA) above attack table, buff chips muted below. Flanking per-creature. Per-creature local buff [+] button. No toggles reroll dice.
- [x] Power Attack toggle — detected from creature feats, -X atk/+2X dmg (3x for single natural attack). 38 creatures have it. Notable feats (CE, Lunge, Cleave) surfaced as badges.
- [x] Target AC affordance — "TARGET AC" label + border on dock AC touchpoint.
- [ ] Grab -20 hold option — creature takes -20 CMB to avoid grappled condition, can full attack + maintain. Only constrict dmg (no auto grab-attack dmg). Surface for high-CMB creatures only?
- [ ] Conditions system (sickened, blind, paralyzed)
- [x] Effect damage rendering inline — superseded by spell cards (alert removed)
- [ ] Versatile Summoning feat in setup (Aerial/Aqueous/Chthonic/Dark/Fiery templates)

## Polish
- [x] HP numpad tap target — HP bar is now clickable with expanded touch area
- [ ] Statblock popup vs expand — currently expands card downward (`.show-stats`). Consider: modal/popup overlay instead? Pros: doesn't reflow grid, can be larger, dismiss on outside click. Cons: loses card context, overlay management. Discuss.
- [ ] iPad Mini 5th gen pass — verify all layouts, touch targets, and trays in 1024×768 landscape + portrait

## Refactor (after features stabilize)
- [x] renderCard() decomposition — extracted renderDeadCard(), renderBuffChips(), renderDecisions(), renderRollTable(), renderSpecialsLegend(), renderAbilities(), renderStatBlock(). renderCard() is now ~40 lines of assembly.
- [x] CSS/JS separation — all inline styles migrated to CSS. HP bar uses raw custom properties (`--hp-cur`, `--hp-max`) with CSS `calc()`. Dropdown stats, buff popup text use CSS classes. Zero inline `style=` rules remain.
- [x] Dead card wrapper — moved inline style to `.dead-wrap` CSS class
- [ ] Dead creatures: [x] dismiss to Dismissed tray (current sideways layout is fine)
- [ ] updTiers() called inside render() rebuilds dropdown every render — only needed when slot/tier selection changes.
- [ ] Global function namespace — consider namespacing (e.g., `App.doSummon()`) as function count grows.
- [ ] Error boundary — try/catch around renderCard() with fallback "error" card to prevent one bad creature from blanking the board.

## Future
- [ ] Spell layer — broader spell management beyond quick buttons (spell slots, concentration tracking, CL overrides, full spell list from Battlefield-Entities-Reference.md)
- [ ] Expanded spell/item support (wand charges, figurine activation, overrideable CL)
- [ ] SNA 7-9 community tier ratings
- [ ] Expand beyond SNA to Summon Monster etc.
