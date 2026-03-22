# Backlog

## Next Up
- [x] Dock rework — move summon/setup into bottom dock as tray tabs. Tab order left-to-right: Summon | Buffs | Dismissed | Setup. Summon tab is visually prominent (right-aligned or larger). Tabs styled as notch cutouts *into* the dock — tray pulls up through the notch, tab is the handle. Subtle inset depth, not skeuomorphic. Fix dock spacing overall.
- [x] Rename "Trash" → "Dismissed" throughout UI and code (bundle with dock rework)
- [x] Dock tab visual fix — tabs shifted up to cover dock top border, no top border, left/bottom/right match dock.
- [x] Consolidate tray contents — Items in Summon tray, Settings (CL + feats) in Setup tray, Claude Import in top bar.
- [ ] Shimmer rework — see https://codepen.io/joshuapekera/pen/xGjMMq for reference
- [x] HP keypad popup — numpad replaces [−][input][+] on creature cards and AC reference input in dock
- [x] Battlefield spell cards — Flaming Sphere (cast + wand), Ball Lightning as full cards in creatures-flow with pre-rolled damage + re-roll
- [x] Dismissed persistence — dismissed creatures survive page refresh via localStorage

## Features
- [ ] Constrict auto-damage — add constrict damage to maintain-grapple result (no attack roll, just bonus damage on successful maintain)
- [ ] Buff/toggle rework — flanking per-creature, pounce/grapple/conditions promoted, buffs demoted. Also: changing feats/buffs should recalculate only (not reroll dice). Rerolls only on manual RE-ROLL or NEXT ROUND.
- [ ] Conditions system (sickened, blind, paralyzed)
- [x] Effect damage rendering inline — superseded by spell cards (alert removed)
- [ ] Versatile Summoning feat in setup (Aerial/Aqueous/Chthonic/Dark/Fiery templates)

## Polish
- [ ] HP numpad tap target — clicking HP text or HP bar should open numpad, or add a visible touch point
- [ ] iPad Mini 5th gen pass — verify all layouts, touch targets, and trays in 1024×768 landscape + portrait

## Refactor (after features stabilize)
- [ ] renderCard() decomposition — extract renderRollTable(), renderSpecialsLegend(), renderSummary(), renderStatBlock(), renderAbilities() as sub-functions. renderCard() becomes assembly. Currently 315 lines doing too much.
- [ ] CSS/JS separation — move remaining inline styles out of JS template literals into semantic CSS classes. New code should follow CSS-first convention now; this is backporting the old stuff.
- [ ] Dead card wrapper — inline `style="width:80px;height:280px"` should move to CSS class.
- [ ] Dead creatures: [x] dismiss to Dismissed tray (current sideways layout is fine)
- [ ] updTiers() called inside render() rebuilds dropdown every render — only needed when slot/tier selection changes.
- [ ] Global function namespace — consider namespacing (e.g., `App.doSummon()`) as function count grows.
- [ ] Error boundary — try/catch around renderCard() with fallback "error" card to prevent one bad creature from blanking the board.

## Future
- [ ] Spell layer — broader spell management beyond quick buttons (spell slots, concentration tracking, CL overrides, full spell list from Battlefield-Entities-Reference.md)
- [ ] Expanded spell/item support (wand charges, figurine activation, overrideable CL)
- [ ] SNA 7-9 community tier ratings
- [ ] Expand beyond SNA to Summon Monster etc.
