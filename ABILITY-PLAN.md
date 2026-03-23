# Special Abilities & Feat Surfacing Plan

## Context
Bestiary audit identified 10 patterns of creature abilities/feats, many invisible in the app. This plan maps every ability to a UI layer and scopes implementation.

## UI Layer Taxonomy (agreed)

| Layer | Purpose | Interaction | Examples |
|---|---|---|---|
| **Ability section** | Quick-reference alternative actions with DC/CMB/desc | Display + SRD link | Trample DC 20, Bull Rush CMB +25 |
| **Mode toggles** | "I'm doing this" — changes which rows appear | Click, alters table rows | Pounce (shows rake), Vital Strike (single enhanced row) |
| **State changes** | Sustained modes that replace/overlay the attack table | Click, swaps/overlays table | Grapple, Whirlwind, Vortex, Swallow Whole |
| **Situational toggles** | Conditional modifiers — "battlefield allows this" | Click, modifies math | Flank (+2 atk), PA, Earth/Water Mastery, Powerful Charge |
| **Inline row action** | On-demand rolls triggered by a hit | Click button on attack row | Cleave / Great Cleave |
| **Badges** | Tactical awareness, passive info | Non-interactive + tooltip | Flyby, Spring Attack, Combat Reflexes, Diehard |
| **Attack table rows** | Conditional/auto damage rows | Appear based on toggle/hit/grapple state | Rake, Constrict, Rend, Death Roll, Gnaw |
| **On-hit pips + legend** | DM-resolved attack riders | Highlights on hit | Grab, Poison, Trip, Disease, Stun |
| **Buff chips** | Stat modifiers from spells/effects | Toggle on/off | fh4, bless, etc. |

### Toggle persistence
| Type | Behavior | Examples |
|---|---|---|
| **Persistent** | Stays on until manually toggled off | Flank, PA, Earth/Water Mastery, Grapple, Whirlwind |
| **One-shot** | Auto-off on Next Round | Pounce, Powerful Charge, Vital Strike, Trample |

### Dividing lines
- **Situational toggle** vs **mode toggle** vs **state change**: Situational modifies math on existing rows. Mode changes which rows appear. State replaces/overlays the entire table.
- **Toggle** vs **badge**: If the app can compute the effect on this card → toggle. If it's tactical awareness only → badge.
- **Badges** get tooltips (badge is just a word; tooltip has the description). **Ability section** is self-documenting (inline desc + SRD link, no tooltip needed).

---

## Ability-to-Layer Mapping (all decisions made)

### Badges (with tooltips)

| Ability | Creatures | Tooltip |
|---|---|---|
| **Flyby Attack** | 8 (air elementals, Manticore, Roc) | "Move → attack → continue moving. No AoO from target." |
| **Spring Attack** | 4 (fire elementals) | "Move → melee attack during move → continue moving." |
| **Combat Reflexes** | 10 | "X AoOs per round (Dex mod)." Compute X from creature Dex. |
| **Diehard** | 2 (Woolly Rhino, T-Rex) | "Fights until -Con HP. Auto-stabilizes." Also: HP logic fix. |

### Pips (attack riders)

| Ability | Creatures | Pip color |
|---|---|---|
| **Disease** | 2 (Dire Rat, Giant Vulture) | Sickly yellow |
| **Stun** | 1 (Ankylosaurus) | White |

### Ability section lines (CMB feats — parsed from Feats string)

| Feat | Creatures | Display format |
|---|---|---|
| **Imp. Bull Rush** | 19 | "Imp. Bull Rush — CMB +X (no AoO)" + SRD link |
| **Imp. Overrun** | 10 | Same format |
| **Imp. Sunder** | 7 | Same format |
| **Awesome Blow** | 6 | "Awesome Blow — CMB +X → 10ft knockback + prone" |
| **Greater Bull Rush** | 4 | "Gr. Bull Rush — CMB +X, pushed foe provokes AoOs" |
| **Greater Overrun** | 3 | "Gr. Overrun — CMB +X, overrun foe provokes AoOs" |

### Attack table rows

| Ability | Creatures | Pattern | Trigger |
|---|---|---|---|
| **Rend** | 2 (Dire Ape, Girallon) | Auto-damage row at BOTTOM of table. Pre-rolled. Always visible with damage number. | `auto-active` when 2+ claw attacks hit vs reference AC. `auto-muted` when <2 hit. No AC set → always `auto-active` (player judges). Numbers always shown — never hidden. Same principle as all other rows: AC line separates, doesn't hide. |
| **Death Roll** | 2 (Croc, Dire Croc) | Auto-damage row (constrict pattern). Trip indicator on row. | Active when grappling (same as constrict). Tooltip on trip: "Prone. Target must be [size] or smaller." |
| **Gnaw** | 1 (Giant Moray Eel) | Auto-damage row (2d6+9) + pre-rolled bonus bite row (+11, 1d6+3) | Both visible in maintain/grapple mode. Same pattern as constrict + rake. |

### Situational toggles (modify math on existing rows)

| Ability | Creatures | Behavior | Persistence |
|---|---|---|---|
| **Earth Mastery** | 6 (earth elementals) | +1 atk/+1 dmg when both grounded | Persistent |
| **Water Mastery** | 6 (water elementals) | +1 atk/+1 dmg in water | Persistent |
| **Powerful Charge** | 3 (Rhino, Woolly Rhino, Triceratops) | Swap gore damage dice to charge dice | One-shot |

### Mode toggles (change which rows appear)

| Ability | Creatures | Behavior | Persistence |
|---|---|---|---|
| **Pounce** | 7 | Charge → full attack + rake rows | One-shot (already implemented) |
| **Vital Strike** | 2-3 (Giant Flytrap, Storm Giant) | Single attack, doubled/tripled dice | One-shot |
| **Trample** | 8 | Suppress attacks, show trample damage + Ref DC | One-shot |

### State changes (replace/overlay attack table, sustained)

| Ability | Creatures | Behavior | Persistence |
|---|---|---|---|
| **Grapple** | many | Suppress normal attacks, maintain CMB + auto-dmg + rake | Persistent (already implemented) |
| **Whirlwind** | 6 (air elementals) | Suppress attacks, show damage/round + Ref DC | Persistent |
| **Vortex** | 6 (water elementals) | Same as whirlwind, water | Persistent |
| **Swallow Whole** | 8 | Grapple sub-state popover: auto-dmg/round, internal AC, escape HP | Persistent |

### Inline row action (NEW pattern)

| Ability | Creatures | Behavior |
|---|---|---|
| **Cleave** | 23 | Button `[⚔]` on first attack row. Click → spawn new row below with same bonus, fresh d20+dmg roll. -2 AC noted. One extra attack per round. |
| **Great Cleave** | 9 | Same, but spawned row also gets a `[⚔]` button. Chain continues until miss or stop clicking. |

### Popover (NEW pattern)

| Ability | Creatures | Behavior |
|---|---|---|
| **Swallow Whole** | 8 | After successful grapple maintain, "Swallow" button appears. Opens popover over attack table showing: auto-damage/round, internal AC, HP threshold to cut out. Dismissible — grapple state persists underneath. |

### Data fixes

| Bug | Fix |
|---|---|
| **Triceratops Improved Critical** | Add `/19-20` to gore in melee line (statblock JSON). |
| **Diehard death threshold** | Change death check from `hp <= 0` to `hp <= -con` for creatures with Diehard flag. |

---

## Implementation Tiers

### Tier 1 — Existing patterns (badges, pips, ability lines, auto-rows, situational toggles)
No new UI interaction patterns needed.

- [x] Triceratops crit data bug fix
- [x] Badge system with tooltips: Flyby, Spring Attack, Combat Reflexes, Diehard
- [x] Disease + Stun pip icons
- [x] CMB feat lines in renderAbilities() — parse from Feats string
- [x] Diehard HP logic fix (death at -Con not 0)
- [x] Rend auto-damage row at bottom of table (conditional on 2+ claw hits)
- [x] Death Roll auto-damage row (constrict pattern + trip tooltip with size note)
- [x] Gnaw: auto-damage row + pre-rolled bonus bite in grapple mode
- [x] Earth/Water Mastery situational toggles (+1 atk/+1 dmg, persistent)
- [x] Powerful Charge situational toggle (swap gore dice, one-shot)
- [x] Bleeding/Staggering Critical — conditional text in specials legend when crit confirms
- [x] One-shot auto-off: Pounce + Powerful Charge reset on Next Round
- [x] Triggered buff system — generic `{ on: 'event', apply: 'buff_id' }` infrastructure
- [x] Rage via triggered buff (on damage → auto-apply +1 atk/dmg, -2 AC, +1 HP/HD)

### Tier 2 — Mode toggles + state changes + ranged
New toggle types that alter or replace attack table.

- [ ] Trample mode toggle (one-shot: suppress attacks, show damage + Ref DC)
- [ ] Vital Strike mode toggle (one-shot: single attack, doubled/tripled dice)
- [ ] Whirlwind state change (persistent: suppress attacks, damage/round + Ref DC)
- [ ] Vortex state change (same as whirlwind, water)
- [ ] Rock Throwing ranged attack row (5 giants, SNA 6-8)

### Tier 3 — New interaction patterns

- [ ] Cleave / Great Cleave inline row action (on-demand roll generation)
- [ ] Swallow Whole popover (grapple sub-state overlay)

### Triggered Buff System (generic, reusable)
Creatures can declare triggers: `{ on: 'event', apply: 'buff_id' }`. The app evaluates triggers at the right moments. Not creature-specific hardcoding.

| Event | Trigger | Example | Tier |
|---|---|---|---|
| `damage` | Creature takes any damage | Rage: auto-apply +1 atk/dmg, +1 HP/HD, -2 AC | Tier 1 |
| `crit_confirm` | Attack confirms a critical hit | Bleeding Crit: show bleed rider in legend | Tier 1 (already planned) |
| `charge` | Creature charges | Powerful Charge: swap damage dice | Tier 1 (already planned) |
| `hp_threshold` | HP crosses a boundary | Diehard: keep fighting below 0 | Tier 1 (already planned) |

Implementation: hook into `dmgC()`, `nextRound()`, toggle functions. Check creature triggers, auto-apply matching buffs. Rage buff defined in `BD` like any other: `rage: {a:1, d:1, ac:-2, con:2, ty:'u'}`.

**Scope decision**: Build trigger infrastructure for *new* abilities only. Don't retrofit existing working code (constrict, rake, pounce) — they work, rewriting them as triggers risks regressions for zero user benefit. Migrate them later if we touch that code for other reasons. The trigger system pays off for: Rage, Bleeding Crit, future homebrew creatures that declare triggers in data without code changes.

**Migration notes**: Add code comments on existing hardcoded conditional logic (constrict auto-row, rake visibility, pounce full-attack, death at 0 HP) noting they're candidates for trigger system migration on a future rework. Add a TODO.md item for the eventual unification pass.

This moves Rage to Tier 1 and provides infrastructure for future triggered effects.

---

## Key Files

| File | Changes |
|---|---|
| `index.html` | renderDecisions() — badges; renderAbilities() — CMB feats; renderRollTable() — rend/death roll/gnaw rows; new renderBadges(); IC object — disease/stun pips; HP death logic |
| `statblocks/*.json` | Triceratops crit fix; possibly add diehard/gnaw/deathroll flags |
| `build_bestiary.py` | Parse Feats for badges, CMB feats; detect diehard/rend/death roll |

## Verification
- Summon Crocodile → verify death roll auto-row in grapple, trip tooltip
- Summon Girallon → verify rend row activates when 2+ claws hit vs AC
- Summon Air Elemental → verify Flyby badge with tooltip
- Summon Earth Elemental → verify CMB feat lines in ability section
- Summon Woolly Rhino → verify Diehard badge, fights below 0 HP
- Summon Ankylosaurus → verify stun pip on tail
- Toggle all existing toggles → verify no regressions
