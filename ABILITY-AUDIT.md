# SNA Combat Manager — Special Abilities Audit

Comprehensive analysis of all special abilities across SNA I-IX summonable creatures.
Total creatures in bestiary: ~95 across 9 SNA levels.

---

## Current Implementation Status

### Fully Implemented (dice, toggles, auto-damage)
| Ability | Implementation | Notes |
|---------|---------------|-------|
| **Grab** (Ex) | Melee parser detects `grab` keyword. Pre-rolls grab CMB (+4) and maintain CMB (+4 grab, +5 circ). Renders grab checks per-attack in legend. | 32 creatures. Fully correct. |
| **Constrict** (Ex) | Parsed from Special_Attacks. Auto-damage row in attack table (no attack roll). Active when grappling. | 6 creatures. Correct: triggers on any successful grapple check. |
| **Rake** (Ex) | Parsed from Special_Attacks. Pre-rolled as separate attack rows. Visible during pounce or maintain-grapple. | 6 creatures (all also have pounce). Correct. |
| **Pounce** (Ex) | Toggle on creature card. Enables rake attacks. Mutually exclusive with grapple toggle. | 7 creatures. Correct. |
| **Trip** | Melee parser detects keyword. Colored pip (orange) on attack row. Legend shows "Trip" with link. | 5 creatures (melee line) + 2 from death roll (crocodiles). |
| **Poison** (Ex) | Melee parser detects keyword. Colored pip (green). Legend extracts DC/save/effect from `special_abilities`. | 15 creatures. Display-only (no DC roll automation), which is correct — poison is a rider the DM resolves. |
| **Burn** (Ex) | Melee parser detects keyword. Colored pip (red-orange). Burn damage listed in Special_Attacks. | 6 creatures (all fire elementals). Display-only; DM applies burn rules manually. |
| **Disease** | Melee parser detects keyword in melee text. Legend extracts DC from special_abilities. | 2 creatures (Dire Rat, Giant Vulture). Display-only. |
| **Power Attack** | Per-creature toggle. Correct -X/+2X (or +3X single natural attack) math from BAB. | Feat-based, not creature ability. Working correctly. |
| **Flanking** | Per-creature toggle. +2 untyped attack. | Working correctly. |

### Partially Implemented (display-only, shown in ability section or statblock)
| Ability | Current State | Gap |
|---------|--------------|-----|
| **Rend** (Ex) | Melee parser detects keyword in attack parenthetical. Listed in `meleeSpecials` set (line 1578) so filtered from key abilities display. | **No auto-damage row.** Rend should trigger auto-damage when 2+ claw attacks hit, similar to constrict. 2 creatures (Dire Ape SNA 4, Girallon SNA 5). |
| **Trample** (Ex) | Shown in ability section with DC extracted from Special_Attacks text. PFSRD link in `PFSRD` object. | **No dice/DC automation.** 8 creatures. Could be a standard-action button that rolls damage + shows Ref DC. |
| **Swallow Whole** (Ex) | Not parsed at all — only visible if user expands statblock. | **No UI presence.** 8 creatures (SNA 2-8). Important grapple follow-up action. |
| **Whirlwind** (Su) | Shown in ability section — DC extracted from `Special_Attacks` text pattern `whirlwind (DC XX)`. | **Display-only.** 6 creatures (all air elementals). No dice automation needed — it's a special action the DM resolves. |
| **Vortex** (Su) | Shown in ability section — DC extracted from `Special_Attacks` text pattern `vortex (DC XX)`. | **Display-only.** 6 creatures (all water elementals). Identical mechanic to whirlwind but in water. |
| **Earth Mastery** (Ex) | Shown in ability section (no DC, just name). | **Display-only.** 6 creatures (all earth elementals). +1 atk/dmg vs grounded, -4 vs airborne. Could be a toggle. |
| **Water Mastery** (Ex) | Shown in ability section. | **Display-only.** 6 creatures (all water elementals). +1 atk/dmg in water, -4 on land. Could be a toggle. |
| **Drench** (Ex) | Shown in ability section. | **Display-only.** 6 creatures (all water elementals). Extinguishes fires. No dice needed. |
| **Pull/Push** | Melee parser detects keywords. Listed in `meleeSpecials` set. | **Detected but no special display.** 2 creatures have pull (Giant Frog, Giant Chameleon). No push creatures found in melee lines. |
| **Powerful Charge** (Ex) | Shown in ability section with damage text. | **No dice automation.** 3 creatures (Rhinoceros, Woolly Rhino, Triceratops). Could be a charge toggle that swaps damage dice. |

### Not Implemented (no UI presence beyond raw statblock text)
| Ability | Creatures | Priority |
|---------|-----------|----------|
| **Death Roll** (Ex) | Crocodile (SNA 3), Dire Crocodile (SNA 7) | Low — complex grapple sub-action. Bite damage + trip on successful grapple check. |
| **Gnaw** (Ex) | Giant Moray Eel (SNA 5) | Low — auto bite damage when starting round with grabbed foe. Similar to constrict but uses bite damage. |
| **Engulf** (Ex) | Giant Flytrap (SNA 7) | Low — 1 creature. Complex grapple + swallow mechanic. |
| **Rock Throwing** (Ex) | Hill Giant, Stone Giant (SNA 6), Fire Giant, Frost Giant (SNA 7), Cloud Giant (SNA 8) | Medium — 5 creatures. Ranged attack option not in melee line. Could add as separate ranged attack row. |
| **Breath Weapon** (Su) | Mephit (SNA 4) | Low — 1 creature, every 4 rounds. 15-ft cone, Ref half. Type varies by mephit subtype. |
| **Stampede** (Ex) | Aurochs (SNA 3), Bison (SNA 4) | Low — requires 3+ creatures with stampede adjacent. Trample variant. |
| **Blood Drain** (Ex) | Stirge (SNA 1) | Low — 1 Con damage/round when attached. Niche creature. |
| **Musk** (Ex) | Giant Skunk (SNA 4) | Low — 2/day, 30ft ranged, nauseated 1d6 rounds (Fort DC). |
| **Rage** (Ex) | Wolverine (SNA 3), Dire Badger (SNA 2) | Low — +2 Str, +2 Con, -2 AC when damaged. Could be a buff toggle. |
| **Web** (ranged) | Giant Spider (SNA 2) | Low — ranged entangle. 1 creature. |
| **Stun** (Ex) | Ankylosaurus (SNA 5) | Low — Fort DC 23 or stunned 1 round on tail hit. Attack rider like trip. |
| **Spikes** (Ex) | Manticore (SNA 5) | Low — ranged attack (4 spikes, +13, 1d6+5). Not in melee line. |
| **Tongue** (Ex) | Giant Frog (SNA 2), Giant Chameleon (SNA 4) | Low — primary attack with 3x reach. Pull on hit. |
| **Pipes** (Su) | Satyr (SNA 4) | Low — area charm/fear/sleep. Complex spell-like. |
| **Special Arrows** (Su) | Pixie (SNA 9) | Low — sleep or memory loss arrows. 1 creature. |
| **Invisibility** (Su) | Pixie (SNA 9) | Low — constant invisibility, even when attacking. |
| **Heated Rock** (Su) | Fire Giant (SNA 7) | Low — adds 1d6 fire to thrown rocks. Only matters with Rock Throwing. |
| **Attach** (Ex) | Stirge (SNA 1) | Low — touch attack → grapple. Niche. |

---

## Abilities Grouped by Pattern

### Pattern 1: Auto-Damage on Grapple (like Constrict)
Trigger: successful grapple check (initial or maintain). No attack roll. Auto-damage row in table.

| Ability | Type | Creatures | Damage | Notes |
|---------|------|-----------|--------|-------|
| **Constrict** | Ex | 6 creatures (SNA 3-7) | Varies (1d4+4 to 4d6+19) | **IMPLEMENTED.** |
| **Gnaw** | Ex | Giant Moray Eel (SNA 5) | 2d6+9 (auto bite dmg) | Same pattern as constrict. Could reuse constrict auto-row logic. |
| **Death Roll** | Ex | Crocodile (SNA 3), Dire Croc (SNA 7) | Bite damage + trip | Grapple check → bite damage + prone. More complex — adds trip rider. |

**Recommendation:** Gnaw can share the constrict auto-damage row pattern exactly. Death Roll is an edge case (2 creatures).

### Pattern 2: Attack Riders (trigger on hit, DM resolves)
Trigger: attack hits. Shows pip icon + legend with save DC/effect. No dice automation needed.

| Ability | Type | Pip Color | Creatures | Effect |
|---------|------|-----------|-----------|--------|
| **Grab** | Ex | Blue | 32 | CMB check → grapple. **IMPLEMENTED with dice.** |
| **Trip** | Ex | Orange | 5+2 | Free trip attempt. **IMPLEMENTED (display).** |
| **Poison** | Ex | Green | 15 | Fort save vs ability damage. **IMPLEMENTED (display).** |
| **Burn** | Ex | Red-orange | 6 | Reflex save or catch fire + extra damage. **IMPLEMENTED (display).** |
| **Disease** | Ex | — (no pip) | 2 | Fort save vs disease. **IMPLEMENTED (display, no pip).** |
| **Pull** | Ex | — | 2 | Move target 5ft toward attacker. Detected by parser, no pip. |
| **Push** | Ex | — | 0 in practice | Move target away. Detected by parser, no creatures use it. |
| **Stun** | Ex | — | 1 (Ankylosaurus) | Fort DC 23 or stunned. Same pattern as trip/poison. |
| **Attach** | Ex | — | 1 (Stirge) | Touch attack → grapple variant. |
| **Allergic Reaction** | Ex | — | 1 (Goblin Dog) | Fort DC save or sickened. |

**Recommendation:** Add pips for disease (sickly yellow?) and stun (white?). Pull/push are marginal — the 2 creatures that have them are rarely used.

### Pattern 3: Full-Attack Modifiers (change what attacks are available)
| Ability | Type | Creatures | Mechanic |
|---------|------|-----------|----------|
| **Pounce** | Ex | 7 | Charge → full attack + rake. **IMPLEMENTED.** |
| **Rake** | Ex | 6 | Extra claw attacks during pounce/grapple. **IMPLEMENTED.** |
| **Rend** | Ex | 2 (Dire Ape, Girallon) | If 2+ claw attacks hit, auto-bonus damage. **NEEDS auto-damage row.** |

**Recommendation for Rend:** Add an auto-damage row (like constrict) that activates when 2+ claw attacks hit vs current AC. Pre-roll rend damage. Show it below attack rows.

### Pattern 4: Area/Special Actions (standard or full-round action alternatives)
These are NOT part of the normal full-attack routine. They're alternative actions.

| Ability | Type | Creatures | Action | Mechanic |
|---------|------|-----------|--------|----------|
| **Trample** | Ex | 8 (SNA 3-7) | Full-round | Move through, auto-damage, Ref half DC. |
| **Swallow Whole** | Ex | 8 (SNA 2-8) | — | After successful grapple, swallow on next grapple check. Auto-damage inside. |
| **Whirlwind** | Su | 6 (air elementals) | Standard | Ref DC or trapped. Duration-based. |
| **Vortex** | Su | 6 (water elementals) | Standard | Same as whirlwind, in water only. |
| **Powerful Charge** | Ex | 3 (rhinos, triceratops) | Charge | Enhanced gore damage on charge. |
| **Rock Throwing** | Ex | 5 (giants) | Standard | Ranged attack, 120-180ft range. |
| **Breath Weapon** | Su | 1 (Mephit) | Standard | 15-ft cone, Ref half, every 4 rounds. |
| **Musk** | Ex | 1 (Giant Skunk) | Standard | 30ft ranged, 2/day, Fort vs nauseated. |
| **Spikes** | Ex | 1 (Manticore) | Standard | 4 ranged spikes, +13, 1d6+5, 180ft. |
| **Web** | Ex | 1 (Giant Spider) | Standard | Ranged entangle, +5, DC 12. |
| **Engulf** | Ex | 1 (Giant Flytrap) | — | Grapple → auto-swallow small creatures. |

**Recommendation:** Trample and Powerful Charge are the highest-value additions (11 combined creatures, all high-usage combat creatures). These could be action buttons on the card. Swallow Whole is complex but affects 8 creatures — could be a grapple sub-state.

### Pattern 5: Passive/Aura Effects (always-on, no action needed)
| Ability | Type | Creatures | Effect |
|---------|------|-----------|--------|
| **Earth Mastery** | Ex | 6 (earth elementals) | +1 atk/dmg if both on ground; -4 if airborne. |
| **Water Mastery** | Ex | 6 (water elementals) | +1 atk/dmg in water; -4 on land. |
| **Drench** | Ex | 6 (water elementals) | Extinguish nonmagical fires, dispel check vs magical fire. No dice. |
| **Quills** | Ex | 1 (Giant Porcupine) | Attackers take 1d8+4 damage (light/natural/unarmed). |
| **Luminescence** | Ex | 1 (Fire Beetle) | 10-ft light radius. Flavor only. |
| **Electric Fortitude** | Ex | 1 (Shambling Mound) | Immune to electricity; gains temp HP from it. |
| **Rage** | Ex | 2 (Wolverine, Dire Badger) | +2 Str/Con, -2 AC when damaged. |
| **Docile** | Ex | 1 (Horse) | Hooves are secondary unless combat-trained. |

**Recommendation:** Earth Mastery and Water Mastery could be per-creature buff toggles (+1/+1 atk/dmg, typed as circumstance). Low priority — the conditional nature makes them situational.

### Pattern 6: Special Movement/Utility (non-combat)
| Ability | Type | Creatures | Effect |
|---------|------|-----------|--------|
| **Sprint** | Ex | Cheetah (SNA 3), Crocodile (SNA 3) | 1/hour: 500ft charge (cheetah) or 40ft speed (croc). |
| **Jet** | Ex | Octopus (SNA 2), Squid (SNA 2) | Full-round: 200ft backward in water. |
| **Ink Cloud** | Ex | Octopus (SNA 2), Squid (SNA 2) | 1/min: total concealment in water. |
| **Hold Breath** | Ex | Dolphin (SNA 1), Crocodile (SNA 3) | Extended underwater time. |
| **Water Dependency** | Ex | Giant Crab (SNA 3) | Survive out of water for hours = Con score. |
| **Air Cyst** | Su | Seaweed Leshy (SNA 4) | Grant water breathing to ally. |

**Recommendation:** None of these need UI treatment. They're informational and visible in the expanded statblock.

---

## Ex vs Su Classification (Antimagic Relevance)

All summoned creatures are themselves magical (summoning spell), so antimagic dispels the creature entirely. The Ex/Su distinction is academic for summoned creatures — but included for completeness.

| Supernatural (Su) — would be suppressed | Extraordinary (Ex) — always works |
|----------------------------------------|-----------------------------------|
| Whirlwind (air elementals) | Grab, Constrict, Rake, Pounce, Trip |
| Vortex (water elementals) | Poison, Disease, Burn, Rend, Trample |
| Breath Weapon (Mephit) | Swallow Whole, Death Roll, Gnaw |
| Pipes (Satyr) | Rock Throwing, Powerful Charge |
| Special Arrows (Pixie) | Earth Mastery, Water Mastery, Drench |
| Invisibility (Pixie) | Rage, Stun, Web, Musk |
| Flash of Insight (Cyclops) | Sprint, Jet, Ink Cloud |
| Heated Rock (Fire Giant) | All senses (blindsight, tremorsense, scent) |
| Split (Amphisbaena) | Engulf, Attach, Blood Drain |
| Air Cyst (Seaweed Leshy) | Stampede, Quills |

---

## Priority Recommendations

### Tier 1 — High Value, Low Effort (pattern already exists or trivial to add)
1. **Fix Triceratops Improved Critical data bug** — Melee line missing `/19-20` on gore. Affects pre-roll crit detection. One-line fix.
2. **Rend auto-damage row** — 2 creatures (Dire Ape SNA 4, Girallon SNA 5). Reuse constrict pattern. Pre-roll rend damage; show as auto-row when 2+ claw attacks hit. Girallon is an S-tier summon so this matters.
3. **Disease pip** — 2 creatures. Add a pip icon (sickly yellow) like poison/burn/trip. Trivial.
4. **Stun pip** — 1 creature (Ankylosaurus SNA 5). Add a pip icon. Same display pattern as poison/trip.
5. **Flyby Attack tag** — 8 creatures (all air elementals + Manticore + Roc). Critical tactical info: creature can move→attack→keep moving. Show as chip/tag on card. Trivial to add, high impact — this is the air elemental's primary combat mode.
6. **CMB feat lines in ability section** — 19 creatures have Improved Bull Rush alone. Show "Imp. Bull Rush CMB +X (no AoO)" etc. in key abilities section. Parse from Feats string, display only — no dice automation.

### Tier 2 — Medium Value, Medium Effort
7. **Trample action button** — 8 creatures. Standard-action alternative: rolls damage dice, shows Ref DC. Could be a button on the card or an action mode.
8. **Powerful Charge toggle** — 3 creatures. When "charging," swap gore damage dice to the powerful charge dice. Simple damage replacement.
9. **Awesome Blow line** — 6 creatures (SNA 6-9). Standard action: CMB check, target flies 10 ft + prone. Surface CMB value. Important repositioning option for high-SNA earth elementals and giants.
10. **Rock Throwing ranged row** — 5 creatures (giants). Add a ranged attack row to the attack table with the thrown rock stats.
11. **Swallow Whole grapple state** — 8 creatures. After successful maintain, option to swallow. Shows auto-damage per round inside stomach + AC/HP for cutting out.
12. **Diehard flag** — 2 creatures (Woolly Rhino SNA 5, T-Rex SNA 7). Change death threshold from 0 HP to -Con HP. Currently the app incorrectly kills these at 0.
13. **Spring Attack tag** — 4 creatures (fire elementals SNA 5-8). Same display pattern as Flyby.
14. **Combat Reflexes line** — 10 creatures. Show "Combat Reflexes (X AoOs/round)" — important for zone control.

### Tier 3 — Low Value or Edge Cases
15. **Bleeding/Staggering Critical** — 3 creatures. Crit rider text in legend when crit confirms. Low frequency.
16. **Vital Strike action button** — 2-3 creatures. Double/triple weapon dice as standard action. Niche.
17. **Cleave/Great Cleave tag** — 23/9 creatures. Informational only — requires specific positioning. Low UI value.
18. **Earth/Water Mastery toggles** — 12 creatures but situational. +1/+1 conditional buff.
19. **Gnaw auto-damage** — 1 creature. Same as constrict pattern.
20. **Death Roll** — 2 creatures. Grapple check → bite damage + trip.
21. **Rage buff** — 2 creatures. +2 Str/Con, -2 AC when damaged.
22. Everything else — 1 creature each, rarely used.

---

## Feat-Based Combat Abilities (Not Creature Special Abilities)

The above sections audit creature special abilities (Ex/Su). This section covers **feats** that grant combat maneuver options or modify attack behavior. These are not in the melee line or Special_Attacks — they live in the Feats field of the stat block and are easy to miss.

### Pattern 7: CMB Feat Maneuvers (alternative standard action, CMB vs CMD)

These give the creature a combat maneuver it can perform without provoking AoOs, with a +2 CMB bonus. No damage roll — result is positional (push, trip, etc.). The player needs to see the CMB value and know the option exists.

| Feat | Creatures | Effect | UI Recommendation |
|------|-----------|--------|-------------------|
| **Improved Bull Rush** | **19 creatures** — Small/Med/Large/Huge Earth Elementals, Bison, Ankylosaurus, Brachiosaurus, Cyclops, Elephant, Mastodon, Triceratops, Purple Worm, Cloud/Storm Giant, Elder/Greater/Huge Water Elementals | CMB+2 to push target back 5ft/5 over CMD. No AoO. | Surface as ability-section line: "Imp. Bull Rush CMB +X (no AoO)" |
| **Improved Overrun** | **10 creatures** — Large/Huge/Greater/Elder Earth Elementals, Ankylosaurus, Brachiosaurus, Stegosaurus, Ettin, Cloud Giant, Fire/Frost Giant | CMB+2 to move through enemy square, knock prone. No AoO. | Same: "Imp. Overrun CMB +X (no AoO)" |
| **Improved Sunder** | **7 creatures** — Greater/Elder Earth/Water Elementals, Fire/Frost Giant, Storm Giant | CMB+2 to break equipment/weapons. No AoO. | Same pattern. Situational but devastating vs armed enemies. |
| **Greater Bull Rush** | **4 creatures** — Large/Huge/Greater/Elder Earth Elementals | Bull rush targets provoke AoOs from allies when pushed. Stacks with Improved. | Upgrade the bull rush line to note "allies get AoOs on pushed target" |
| **Greater Overrun** | **3 creatures** — Brachiosaurus, Greater/Elder Earth Elementals | Overrun targets provoke AoOs. Stacks with Improved. | Same upgrade pattern. |
| **Awesome Blow** | **6 creatures** — Huge/Greater/Elder Earth Elementals, Cloud Giant, Purple Worm, Storm Giant | Standard action: melee attack that sends target flying 10 ft + prone. No AoO. Requires Large+ size. | Surface as: "Awesome Blow CMB +X → 10ft knockback + prone" |
| **Improved Disarm** | 1 creature — Giant Owl (SNA 5) | CMB+2 disarm. No AoO. | Low priority — 1 creature. |

**Overall recommendation for CMB feats:** Surface as informational lines in the ability section. Format: `Feat Name — CMB +X (no AoO)`. No dice automation needed — it's a CMB vs CMD comparison the player resolves mentally. The CMB value is already on the card.

**Note on Earth Elementals:** Earth elementals are the CMB kings of the SNA list. A Greater Earth Elemental (SNA 7) has Improved Bull Rush, Improved Overrun, Greater Bull Rush, Greater Overrun, and Awesome Blow — five different repositioning options, all using CMB +25 (27 augmented). This should be prominently surfaced.

### Pattern 8: Tactical Movement Feats (change how the creature moves + attacks)

| Feat | Creatures | Effect | UI Recommendation |
|------|-----------|--------|-------------------|
| **Flyby Attack** | **8 creatures** — All Air Elementals (SNA 2-8), Manticore (SNA 5), Roc (SNA 7) | Move → single attack at any point during move → continue moving. Does not provoke from defender. | Surface as tag/chip: "Flyby" — critical tactical info (creature doesn't have to stop next to target) |
| **Spring Attack** | **4 creatures** — Large/Huge/Greater/Elder Fire Elementals (SNA 5-8) | Move → single melee attack during move → continue moving. Requires Mobility/Dodge. | Same as Flyby but ground-based. "Spring Atk" tag. |
| **Combat Reflexes** | **10 creatures** — Large+ Air Elementals, Large+ Fire Elementals, Giant Octopus, Giant Squid, Storm Giant | Extra AoOs/round = Dex mod. | Surface as: "Combat Reflexes (X AoOs/round)" — important for threatening/zone control |
| **Lunge** | 1 creature — Giant Snapping Turtle (SNA 7) | -2 AC to gain +5 ft reach until end of turn. | Low priority. Could be a toggle. |

**Flyby Attack is the most under-represented feat in the current UI.** All air elementals have it, and it fundamentally changes how you use them — they can slam a target and keep flying without ending in melee. This is the air elemental's primary combat tactic (even more than whirlwind at lower SNA levels).

### Pattern 9: Attack Modifier Feats (change damage/crit math)

| Feat | Creatures | Effect | Current Status |
|------|-----------|--------|----------------|
| **Improved Critical** | **12 creatures** (SNA 6-9) | Double threat range on specified weapon. | **Already baked into melee strings** for 11 of 12. **BUG: Triceratops (SNA 6)** melee line shows `gore +17 (2d10+12)` with no `/19-20` despite having Improved Critical (gore). Should be `gore +17 (2d10+12/19-20)`. |
| **Cleave** | **23 creatures** | If first attack hits, free attack on adjacent target at same bonus. | Not surfaced. Low priority — requires specific positioning. Informational tag at most. |
| **Great Cleave** | **9 creatures** | Cleave without limit — keep attacking adjacent targets as long as you keep hitting. | Same as Cleave. Informational. |
| **Vital Strike** | 2 creatures — Giant Flytrap (SNA 7), Storm Giant (SNA 9) | Standard action: double weapon damage dice on single attack. | Not surfaced. Could be an action button ("Vital Strike: Xd6+Y"). |
| **Improved Vital Strike** | 1 creature — Storm Giant (SNA 9) | Triple weapon damage dice. Storm Giant greatsword becomes 12d6+21. | Same. Storm Giant only. |
| **Bleeding Critical** | 2 creatures — Dire Shark (SNA 7), Tyrannosaurus (SNA 7) | Confirmed crit → 2d6 bleed damage/round (stacks). | Not surfaced. Should show as crit rider in roll table legend when a crit confirms. |
| **Staggering Critical** | 1 creature — Purple Worm (SNA 8) | Confirmed crit → staggered 1d4+1 rounds (Fort DC = 10 + BAB). | Same — crit rider. Purple Worm only. |

**Triceratops Improved Critical is a data bug** — fix in `build_bestiary.py` or directly in the statblock JSON. Threat range should be 19-20 on gore.

### Pattern 10: Survivability Feats

| Feat | Creatures | Effect | UI Recommendation |
|------|-----------|--------|-------------------|
| **Diehard** | 2 creatures — Woolly Rhinoceros (SNA 5), Tyrannosaurus (SNA 7) | Automatically stabilize at negative HP. Can continue to act while disabled (negative HP but above -Con). | **Affects the "dead" card behavior.** Currently the app sets `alive=false` at 0 HP. These creatures should stay alive/actionable until -Con HP. Surface as tag on card. |
| **Multiattack** | 4 creatures — Octopus (SNA 2), Squid (SNA 2), Giant Octopus (SNA 6), Giant Squid (SNA 7) | Secondary natural attack penalty reduced from -5 to -2. | **Already baked into melee line attack bonuses.** No additional UI needed. |

**Diehard is a functional gap:** The app kills creatures at 0 HP, but Woolly Rhino and T-Rex should keep fighting into negative HP. This could be a flag on the creature data that changes the HP-to-death threshold.

---

## Data Bugs Found

| Bug | Creature | Issue | Fix |
|-----|----------|-------|-----|
| **Missing Improved Critical** | Triceratops (SNA 6) | Melee line `gore +17 (2d10+12)` lacks `/19-20`. Has Improved Critical feat. | Add `/19-20` to melee and augmented melee strings. |

---

## Generalizability Assessment

**90%+ of abilities fit these 10 patterns:**

1. **Attack rider (pip + legend):** grab, trip, poison, burn, disease, stun, pull, push, attach, allergic reaction — **~60 creature-ability instances.** Already handled except stun and disease pip.

2. **Auto-damage on grapple (auto-row):** constrict, gnaw, death roll — **~10 creature-ability instances.** Constrict implemented; gnaw and death roll are the same pattern.

3. **Full-attack modifier (toggle):** pounce, rake, rend — **~15 creature-ability instances.** Pounce/rake implemented; rend needs the "2+ claws hit" auto-damage.

4. **Alternative action (button/mode):** trample, powerful charge, rock throwing, whirlwind, vortex, breath weapon, swallow whole — **~40 creature-ability instances.** Currently display-only. Trample and powerful charge are the highest-ROI additions.

5. **Passive indicator (always-on text):** earth/water mastery, drench, quills, rage, luminescence — **~20 creature-ability instances.** Mastery could be toggles; rest are informational.

6. **CMB maneuver (informational line):** improved bull rush, improved overrun, improved sunder, awesome blow — **~42 creature-feat instances across 19+ unique creatures.** Display CMB value + "no AoO" note. No dice needed.

7. **Tactical movement (tag/chip):** flyby attack, spring attack, combat reflexes — **~22 creature-feat instances.** Flyby is the most important — changes how air elementals are played entirely.

8. **Crit modifier (roll table integration):** improved critical, bleeding critical, staggering critical — **~15 creature-feat instances.** Improved Critical already in melee strings (1 bug). Bleeding/Staggering Critical are crit riders that could show in the legend when a crit confirms.

9. **Survivability (HP threshold change):** diehard — **2 creatures.** Changes when "dead" triggers. Functional gap in app logic.

10. **Action substitution (damage swap):** vital strike, cleave/great cleave — **~34 creature-feat instances.** Mostly informational. Vital Strike could be an action button for the 2-3 creatures that have it.

**True edge cases (need unique handling):** Stirge attach+blood drain, Pixie invisibility+arrows, Satyr pipes, Mephit breath weapon, Giant Flytrap engulf, Spider web. Each is 1 creature with a unique mechanic.
