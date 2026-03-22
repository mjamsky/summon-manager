# Backlog

## Next Up
- [x] Dock rework — move summon/setup into bottom dock as tray tabs. Tab order left-to-right: Summon | Buffs | Dismissed | Setup. Summon tab is visually prominent (right-aligned or larger). Tabs styled as notch cutouts *into* the dock — tray pulls up through the notch, tab is the handle. Subtle inset depth, not skeuomorphic. Fix dock spacing overall.
- [x] Rename "Trash" → "Dismissed" throughout UI and code (bundle with dock rework)
- [x] Dock tab visual fix — tabs shifted up to cover dock top border, no top border, left/bottom/right match dock.
- [x] Consolidate tray contents — Items in Summon tray, Settings (CL + feats) in Setup tray, Claude Import in top bar.
- [ ] Shimmer rework — see https://codepen.io/joshuapekera/pen/xGjMMq for reference
- [ ] HP keypad popup (RPG Scribe-style numpad for quick HP entry)
- [ ] Battlefield spell cards — generalized template for persistent damage effects (Flaming Sphere, Ball Lightning, Spiritual Weapon) with pre-rolled damage + re-roll on move/redirect

## Features
- [ ] Constrict auto-damage — add constrict damage to maintain-grapple result (no attack roll, just bonus damage on successful maintain)
- [ ] Buff/toggle rework — flanking per-creature, pounce/grapple/conditions promoted, buffs demoted. Also: changing feats/buffs should recalculate only (not reroll dice). Rerolls only on manual RE-ROLL or NEXT ROUND.
- [ ] Conditions system (sickened, blind, paralyzed)
- [ ] Effect damage rendering inline (replace `alert()` popup on line 914)
- [ ] Versatile Summoning feat in setup (Aerial/Aqueous/Chthonic/Dark/Fiery templates)

## Polish
- [ ] iPad Mini 5th gen pass — verify all layouts, touch targets, and trays in 1024×768 landscape + portrait

## Refactor (after features stabilize)
- [ ] CSS/JS separation — move remaining inline styles out of JS template literals into semantic CSS classes. New code should follow CSS-first convention now; this is backporting the old stuff.
- [ ] Dead creatures: [x] dismiss to Dismissed tray (current sideways layout is fine)

## Future
- [ ] Expanded spell/item support (wand charges, figurine activation, overrideable CL)
- [ ] SNA 7-9 community tier ratings
- [ ] Expand beyond SNA to Summon Monster etc.
