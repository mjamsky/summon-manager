---
description: Summon a set of test creatures in the browser for visual inspection of abilities, toggles, badges, and card layout. Uses Chrome MCP tools. Run after feature work for manual QA.
model: haiku
user_invocable: true
---

# /sna-showcase — Visual Test Showcase

Summon a curated set of creatures via Chrome browser automation to visually verify abilities, toggles, badges, and layout.

## Prerequisites
- HTTP server running: `python3 -m http.server 8787` (start if not running)
- Chrome browser with Claude-in-Chrome extension active

## Steps

1. **Start server** if not already running (check with `lsof -i:8787`)

2. **Get browser context**: call `tabs_context_mcp` to find or create a tab

3. **Navigate** to `http://localhost:8787/`

4. **Summon creatures** via `javascript_tool` — clear state, then summon one of each showcase creature with appropriate toggles pre-set:

   | Creature | SNA | Toggle/State | Tests |
   |----------|-----|-------------|-------|
   | Girallon | 5 | — | Rend row at bottom |
   | Crocodile | 3 | grappling=true | Death roll + trip legend |
   | Giant Moray Eel | 5 | grappling=true | Gnaw auto-row |
   | Small Earth Elemental | 2 | earthMastery=true | Mastery toggle + Earth Glide badge |
   | Rhinoceros | 4 | charging=true | Charge toggle + gore dice swap |
   | Woolly Rhinoceros | 5 | hp=-5 | Diehard at negative HP |
   | Wolverine | 3 | dmgC 3 | Rage auto-applied |
   | Lion | 3 | pouncing=true | Pounce + rake rows |
   | Constrictor Snake | 3 | grappling=true | Grab + constrict |
   | Dire Rat | 1 | — | Disease pip on bite |
   | Large Air Elemental | 5 | — | Flyby badge + AoO badge |
   | Greater Earth Elemental | 7 | earthMastery=true | CMB feats in ability section |
   | Large Fire Elemental | 5 | — | Spring Atk badge + burn pips |

5. **Set ref AC** to 18 for hit/miss visibility

6. **Report** what's on screen, let user visually inspect

## JS Template for Summon

```javascript
localStorage.removeItem('sna-combat-state');
S.groups = []; S.round = 0; S.effects = [];
S.feats.augment = true;
function s(name, lv) {
  const e = B[name.toLowerCase()]; if (!e) return null;
  const c = mkCreature(e, true);
  S.groups.push({ id:'G'+(nGid++), name:'SNA '+lv+': '+name, src:'sna', creatures:[c], rl:10, casting:false, slot:lv });
  preRoll(c); return c;
}
// ... summon creatures, set toggles ...
if (S.round === 0) S.round = 1;
document.getElementById('ref-ac').value = '18';
render();
```

## Important
- Always clear localStorage before summoning to avoid stale state
- Set `S.feats.augment = true` for augmented stats
- Wolverine rage: call `dmgC(wolv.id, 3)` AFTER `render()` to trigger the damage event
- Do NOT close the browser tab — let user inspect
