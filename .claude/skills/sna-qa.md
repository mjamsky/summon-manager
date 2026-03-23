---
description: Run headless QA tests for the SNA Combat Manager. Validates creature ability parsing, pre-roll logic, computeRoll math, toggle behavior, and HP logic without a browser. Use after any feature work.
model: haiku
user_invocable: true
---

# /sna-qa — Headless QA Test Runner

Run Node.js headless tests against `index.html` to validate creature abilities and combat logic.

## Steps

1. **Write test script** `test-sna-qa.js` in the project root that:
   - Reads `index.html`, extracts the `<script>` block
   - Strips the `async function init(){...}` block at the end (uses fetch)
   - Stubs browser globals using `vm.runInThisContext`:
     - `document.getElementById()` → dummy element with value/textContent/innerHTML/classList/style stubs
     - `document.querySelectorAll()` → `[]`
     - `localStorage` → `{getItem:()=>null, setItem:()=>{}, removeItem:()=>{}}`
     - `crypto.getRandomValues` → `require('crypto').getRandomValues`
     - `alert`, `fetch` → no-ops
   - Loads bestiary JSON files directly into `B` object
   - Sets `S.round = 1`

2. **Write assertions** covering recent changes. Check:
   - Creature flags parsed correctly (`hasRend`, `rendDmg`, `hasDeathRoll`, etc.)
   - `computeRoll()` produces expected `autoRows` entries
   - Toggle state changes affect `computeRoll()` output (e.g. `earthMastery` → +1 atk)
   - `nextRound()` resets one-shot toggles
   - `deathThreshold()` returns correct values
   - `dmgC()` triggers work (rage)
   - `renderRollTable()` HTML contains expected CSS classes

3. **Run** `node test-sna-qa.js` — each assertion prints PASS/FAIL

4. **If failures**: diagnose and fix in `index.html`, re-run until all pass

5. **Cleanup**: delete `test-sna-qa.js`, run final syntax check:
   ```bash
   node -e "new Function(require('fs').readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"
   ```

## Key test creatures
- Girallon (rend), Crocodile (death roll), Giant Moray Eel (gnaw)
- Small Earth Elemental (earth mastery), Rhinoceros (powerful charge)
- Woolly Rhinoceros (diehard), Wolverine (rage trigger)
- Lion (pounce+rake), Constrictor Snake (grab+constrict)

## Important
- `vm.runInThisContext()` is required (not `eval`) so globals are accessible
- The `init()` function regex strip: `js.replace(/async function init\(\)\{[\s\S]*$/, '')`
- Always delete the test script after QA passes
