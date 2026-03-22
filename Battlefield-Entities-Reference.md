# Pathfinder 1e: Controllable Battlefield Entities

Comprehensive reference for all spells and items that create persistent, controllable entities on the battlefield — things that need to be tracked, moved, rolled for, or managed each round.

**Scope:** All Paizo-published PF1e sources (CRB, APG, UM, UC, ACG, OA, player companions).
**Excluded:** Pure buffs, static zones (place-and-forget), instantaneous damage, touch spells delivered by caster.

---

## Action Economy Quick Reference

| Control Action | Spells |
|---|---|
| **None (autonomous)** | Black Tentacles, Grasping Tentacles, Insect Plague, Summon Swarm, Mage's Faithful Hound, Animate Dead/Create Undead (permanent), Cloudkill |
| **Free action** | Ghost Wolf (attack), Flame Steed (auto-smoke) |
| **Swift action** | Spiritual Ally (move), Spiritual Squire (move) |
| **Move action** | Flaming Sphere, Greater Flaming Sphere, Ball Lightning (all globes), Aqueous Orb, Shifting Sand, Swarm of Fangs, Aggressive Thundercloud, Greater Aggressive Thundercloud, Spiritual Weapon (redirect), Interposing Hand family (redirect), Animate Objects (redirect), Animate Plants (redirect) |
| **Standard action** | Call Lightning/Storm (call bolt), Mage's Sword (switch target), Telekinesis (concentration), Creeping Doom (direct swarms), Whip of Spiders/Centipedes/Ants (attack) |
| **Concentration** | Telekinesis (sustained/combat modes), Summon Swarm |

---

## 1. Movable Damage Entities (Move Action to Direct)

The highest-value category for a combat manager — a token on the map you reposition each round while still taking your standard action.

### Flaming Sphere
- **Classes:** Druid 2, Arcanist/Sorcerer/Wizard 2, Bloodrager 2, Magus 2, Occultist 2
- **Creates:** 5-ft fire globe
- **Control:** Move action to direct 30 ft; stays put if undirected
- **Duration:** 1 rd/level
- **Rolls:** Target Reflex save vs 3d6 fire
- **Tracking:** Sphere position; SR on first hit per creature

### Aggressive Thundercloud
- **Classes:** Druid 2, Arcanist/Sorcerer/Wizard 2, Bloodrager 2, Magus 2, Occultist 2
- **Creates:** 5-ft storm cloud (fly 20, perfect)
- **Control:** Move action to direct
- **Duration:** 1 rd/level
- **Rolls:** Target Reflex save vs 3d6 electricity
- **Tracking:** Cloud position; provides 20% concealment in its square

### Aqueous Orb
- **Classes:** Druid 3, Arcanist/Sorcerer/Wizard 3, Bloodrager 3, Magus 3, Summoner 3
- **Creates:** 10-ft water sphere
- **Control:** Move action to roll 30 ft; stays put if undirected
- **Duration:** 1 rd/level
- **Rolls:** Reflex negates 2d6 nonlethal; failed = second Reflex or engulfed (entangled, drowning, carried along); engulfed get new Reflex each round
- **Tracking:** Orb position; who is engulfed (max 1 Large, 4 Medium, 16 Small); engulfed take 2d6 nonlethal at start of their turn

### Shifting Sand
- **Classes:** Druid 3
- **Creates:** 20-ft spread of churning earth
- **Control:** Move action to slide area 10 ft, carrying entangled/prone creatures
- **Duration:** 1 rd/level
- **Rolls:** Reflex or entangled; entangled + move = second Reflex or prone; Acrobatics penalty = CL (max +10)
- **Tracking:** Zone position; difficult terrain; who is entangled/prone

### Swarm of Fangs
- **Classes:** Druid 3, Arcanist/Sorcerer/Wizard 3, Psychic 3, Summoner 3, Witch 3
- **Creates:** 10-ft swarm of flying animate teeth
- **Control:** Move action to direct 40 ft; if undirected, auto-pursues nearest creature (including you)
- **Duration:** 1 rd/level
- **Rolls:** 2d6 piercing auto to all in area (on arrival + end of movement)
- **Tracking:** Swarm position; auto-pursuit behavior if undirected

### Ball Lightning
- **Classes:** Druid 4, Arcanist/Sorcerer/Wizard 4, Bloodrager 4, Magus 4, Occultist 4, Shaman 4
- **Creates:** 2+ lightning globes (+1 per 4 CL above 7th; max 5 at CL 19)
- **Control:** Move action directs ALL globes (20 ft, perfect)
- **Duration:** 1 rd/level
- **Rolls:** Each globe: Reflex negates 3d6 electricity (-4 penalty in metal armor)
- **Tracking:** Position of each globe individually; one move action controls all
- **Note:** Strongest action economy in this category — multiple tokens, one action

### Greater Flaming Sphere
- **Classes:** Druid 4, Arcanist/Sorcerer/Wizard 4, Bloodrager 4, Magus 4, Occultist 4
- **Creates:** 5-ft fire globe (enhanced)
- **Control:** Move action to direct 30 ft
- **Duration:** 1 rd/level
- **Rolls:** Target Reflex save vs 6d6 fire; failed save = catch fire (ongoing 1d6, DC = spell DC to extinguish)
- **Tracking:** Sphere position; which creatures are on fire

### Greater Aggressive Thundercloud
- **Classes:** Druid 4, Arcanist/Sorcerer/Wizard 4, Bloodrager 4, Magus 4, Occultist 4
- **Creates:** 5-ft storm cloud (enhanced)
- **Control:** Move action to direct
- **Duration:** 1 rd/level
- **Rolls:** Reflex negates 6d6 electricity; first creature damaged is stunned 1 round (Fort negates, sonic)
- **Tracking:** Cloud position; stun rider only hits first creature damaged total

---

## 2. Spiritual Weapon Family (Force Weapons That Attack Independently)

### Spiritual Weapon
- **Classes:** Cleric/Oracle 2, Inquisitor 2, Medium 2, Shaman 2, Spiritualist 2, Warpriest 2
- **Creates:** Force weapon (deity's favored weapon form)
- **Control:** Move action to redirect to new target; attacks automatically on your turn
- **Duration:** 1 rd/level (D)
- **Rolls:** Attack = BAB + Wis mod; damage 1d8 + 1/3 CL (max +5); uses real weapon's crit range/multiplier
- **Tracking:** Target designation; multiple attacks at high BAB (but only 1 on redirect rounds); AC 12 vs touch

### Spiritual Ally
- **Classes:** Cleric/Oracle 4, Medium 4, Spiritualist 4, Warpriest 4
- **Creates:** 5-ft force construct (occupies space, threatens, flanks, makes AoOs)
- **Control:** Swift action to move 30 ft (fly 30, perfect); attacks automatically on your turn
- **Duration:** 1 rd/level (D)
- **Rolls:** Attack = BAB + Wis mod (multiple at high BAB); damage 1d10 + 1/3 CL (max +5) force
- **Tracking:** Position (threatens, flanks, AoOs); AC 10 vs touch; bypasses all DR as force

### Spiritual Squire
- **Classes:** Antipaladin 2, Cleric/Oracle 2, Inquisitor 2, Paladin 2, Shaman 2, Spiritualist 2, Warpriest 2
- **Creates:** Force servant (cannot attack, does not threaten)
- **Control:** Swift action to move 30 ft
- **Duration:** 1 min/level (D)
- **Rolls:** Aid Another: attack = BAB + Wis mod (to hit AC 10)
- **Tracking:** Position; current task (retrieve item, carry, aid another, help don armor); max 10 lb/CL

### Summon Ancestral Guardian
- **Classes:** Bard/Skald 3, Cleric/Oracle 3, Warpriest 3 (dwarf spell)
- **Creates:** Two transparent ancestor spirits, each functions as spiritual weapon
- **Control:** Move action to redirect each
- **Duration:** 1 rd/level (D)
- **Rolls:** Each attacks as spiritual weapon but deals physical damage (B/P/S by weapon choice)
- **Tracking:** Two separate targets; two separate attack sequences

---

## 3. Bigby's Hand Family (Force Hand Constructs)

All are 10-ft Large force hand constructs. HP = caster's max HP. AC 20 (-1 size, +11 natural). Saves = caster's. Redirect = move action. Can be dispelled/disintegrated.

### Interposing Hand
- **Classes:** Arcanist/Sorcerer/Wizard 5, Magus 5, Occultist 5, Psychic 5
- **Creates:** Hand providing cover (+4 AC) vs one opponent
- **Control:** Move action to redirect; auto-follows target
- **Duration:** 1 rd/level (D)
- **Rolls:** None for cover effect
- **Tracking:** Hand HP; designated opponent

### Forceful Hand
- **Classes:** Arcanist/Sorcerer/Wizard 6, Magus 6, Occultist 6, Psychic 6
- **Creates:** Hand providing cover AND bull rushing
- **Control:** Move action to redirect
- **Duration:** 1 rd/level (D)
- **Rolls:** CMB for bull rush = CL + 8 (Str 27) + 1 (Large); one attempt/round
- **Tracking:** Hand HP; target; bull rush distance

### Grasping Hand
- **Classes:** Arcanist/Sorcerer/Wizard 7, Psychic 7
- **Creates:** Hand that grapples OR bull rushes OR interposes
- **Control:** Move action to redirect
- **Duration:** 1 rd/level (D)
- **Rolls:** CMB for grapple = CL + 10 (Str 31) + 1 (Large); holds but does not harm
- **Tracking:** Hand HP; grapple state; target CMD vs hand CMB

### Clenched Fist
- **Classes:** Arcanist/Sorcerer/Wizard 8, Psychic 8
- **Creates:** Hand that attacks, bull rushes, or interposes; 60 ft/round
- **Control:** Move action to redirect
- **Duration:** 1 rd/level (D)
- **Rolls:** Attack = CL + casting stat + 11 (Str 33) - 1 (Large); damage 1d8+11; Fort save or stunned 1 round
- **Tracking:** Hand HP; target; stun status on hit creatures

### Crushing Hand
- **Classes:** Arcanist/Sorcerer/Wizard 9, Psychic 9
- **Creates:** Hand that grapples with crushing damage, or bull rushes, or interposes
- **Control:** Move action to redirect
- **Duration:** 1 rd/level (D)
- **Rolls:** CMB for grapple = CL + 12 (Str 35) + 1 (Large); 2d6+12 damage/round while grappled
- **Tracking:** Hand HP; grapple state; cumulative damage; target CMD

---

## 4. Mage's Sword & Force Blades

### Mage's Sword
- **Classes:** Arcanist/Sorcerer/Wizard 7, Psychic 7
- **Creates:** Shimmering force sword (Medium)
- **Control:** Standard action to switch targets; attacks automatically each round on your turn
- **Duration:** 1 rd/level (D)
- **Rolls:** Attack = CL + casting stat + 3 enhancement; damage 4d6+3 force; threat 19-20/x2
- **Tracking:** Target designation; AC 13; cannot flank

---

## 5. Tentacle/Grapple Zone Spells

### Black Tentacles
- **Classes:** Arcanist/Sorcerer/Wizard 4, Bloodrager 4, Magus 4, Psychic 4, Spiritualist 4, Summoner 3/Unchained 4, Witch 4
- **Creates:** 20-ft radius field of tentacles (difficult terrain)
- **Control:** None (automatic grapple checks at start of your turn)
- **Duration:** 1 rd/level (D)
- **Rolls:** CMB = CL + 4 (Str) + 1 (size); one roll applies to ALL creatures; +5 vs already-grappled; damage 1d6+4 on successful grapple
- **Tracking:** Which creatures are grappled; cumulative damage; CMD to escape = 10 + CMB

### Grasping Tentacles
- **Classes:** Arcanist/Sorcerer/Wizard 3, Bloodrager 3, Magus 3, Summoner 3, Witch 3
- **Creates:** 20-ft radius tentacle field (dirty trick variant)
- **Control:** None (automatic dirty trick checks at start of your turn)
- **Duration:** 1 rd/level (D)
- **Rolls:** Dirty Trick CMB = CL + 4 + 1; roll d% for effect (blind/deaf/entangle/shaken/sicken)
- **Tracking:** Which creatures have which conditions; condition durations

---

## 6. Call Lightning Family (Persistent Directed Bolts)

### Call Lightning
- **Classes:** Druid 3, Occultist 3, Shaman 3
- **Creates:** Ongoing ability to call lightning bolts
- **Control:** Standard action each round to call a bolt
- **Duration:** 1 min/level
- **Rolls:** Reflex half for 3d6 electricity (3d10 outdoors in storm); max bolts = CL (max 10)
- **Tracking:** Bolts remaining; storm conditions (damage upgrade)

### Call Lightning Storm
- **Classes:** Druid 5, Occultist 5, Shaman 5
- **Creates:** Enhanced ongoing bolt ability
- **Control:** Standard action each round
- **Duration:** 1 min/level
- **Rolls:** Reflex half for 5d6 electricity (5d10 in storm); max 15 bolts
- **Tracking:** Bolts remaining; storm conditions

---

## 7. Telekinesis (Sustained)

### Telekinesis
- **Classes:** Arcanist/Sorcerer/Wizard 5, Magus 5, Occultist 5, Psychic 4, Spiritualist 5
- **Control:** Concentration (standard action per round); ends if concentration drops
- **Duration:** Concentration, up to 1 rd/level
- **Modes:**
  - *Sustained Force:* Move up to 25 lb/CL at 20 ft/round; Will save for attended objects
  - *Combat Maneuver:* CMB = CL + casting stat; bull rush, disarm, grapple (including pin), or trip once/round
- **Tracking:** Weight/object being moved; concentration status; maneuver results

---

## 8. Summoned Creatures (Beyond SM/SNA)

### Summon Swarm
- **Classes:** Druid 2, Arcanist/Sorcerer/Wizard 2, Bard/Skald 2, Shaman 2, Summoner 2, Witch 2
- **Creates:** Swarm of bats, rats, or spiders
- **Control:** None — **uncontrollable**, attacks nearest creatures
- **Duration:** Concentration + 2 rounds
- **Rolls:** Swarm damage auto; distraction Fort save; variant-specific (rat disease, spider poison)
- **Tracking:** Swarm position; concentration status; variant type

### Mad Monkeys
- **Classes:** Druid 3, Arcanist/Sorcerer/Wizard 3, Bard/Skald 3, Summoner 3
- **Creates:** Controllable monkey swarm
- **Control:** Commands (obeys you)
- **Duration:** 1 rd/level
- **Rolls:** Swarm damage auto; distraction Fort save; free disarm or steal per turn, CMB = CL + casting stat
- **Tracking:** Swarm position; stolen items; CMB vs target CMD

### Giant Vermin
- **Classes:** Druid 4, Cleric/Oracle 4, Shaman 4, Warpriest 4
- **Creates:** Enlarges existing vermin (3 centipedes, 1 scorpion, or 2 spiders at CL 9+)
- **Control:** Simple commands ("Attack," "Defend," "Stop")
- **Duration:** 1 min/level
- **Rolls:** Full stat blocks per vermin; own initiative; requires actual vermin present
- **Tracking:** Individual HP per vermin; each is a separate combatant

### Cape of Wasps
- **Classes:** Druid 4
- **Creates:** Wasp swarm covering caster
- **Control:** Free action to toggle protection mode vs flight mode
- **Duration:** 1 rd/level
- **Rolls:** Auto 2d6 + poison to melee attackers (protection mode); Fort save vs poison
- **Tracking:** Current mode; concealment (protection) or fly 20 poor (flight)

### Insect Plague
- **Classes:** Druid 5, Cleric/Oracle 5, Shaman 5, Summoner 4/Unchained 5, Warpriest 5
- **Creates:** 1 wasp swarm per 3 CL (max 6 at CL 18)
- **Control:** None after placement (stationary, won't pursue)
- **Duration:** 1 min/level
- **Rolls:** Swarm damage auto; distraction Fort save (wasp swarm stats)
- **Tracking:** Number and position of swarms; individual swarm HP

### Creeping Doom
- **Classes:** Druid 7, Shaman 7, Summoner 5/Unchained 6
- **Creates:** 4 centipede swarms (60 HP each, 4d6 damage, custom poison DC = spell DC)
- **Control:** Standard action to command any number to move (within 100 ft of caster)
- **Duration:** 1 rd/level
- **Rolls:** 4d6 swarm damage auto; Fort vs poison; Fort vs distraction
- **Tracking:** Position of 4 swarms individually; HP of each (60); must stay within 100 ft

### Spectral Saluqi
- **Classes:** Arcanist/Sorcerer/Wizard 6, Witch 6
- **Creates:** Undead spectral hound (yeth hound stats)
- **Control:** Telepathic commands
- **Duration:** 10 min/level (D)
- **Rolls:** Yeth hound stat block (bite, trip, bay: 300 ft panic, Will DC 12); sees/attacks ethereal
- **Tracking:** HP; bay ability usage; alignment for DR

### Animate Plants
- **Classes:** Druid 7, Shaman 7
- **Creates:** 1 Large plant per 3 CL as animated objects
- **Control:** Move action to redirect targets
- **Duration:** 1 rd/level
- **Rolls:** Animated object stat blocks per size
- **Tracking:** Number/size; HP of each

### Elemental Swarm
- **Classes:** Druid 9, Shaman 9, Witch 9
- **Creates:** Staggered waves: 2d4 Large (immediate), 1d4 Huge (10 min later), 1 Greater (20 min later); all max HP
- **Control:** Verbal commands
- **Duration:** 10 min/level (D)
- **Rolls:** Full elemental stat blocks
- **Tracking:** Number/type/HP; arrival timing; element chosen

### Shambler
- **Classes:** Druid 9, Shaman 9
- **Creates:** 1d4+2 advanced shambling mounds
- **Control:** Verbal commands
- **Duration:** 7 days (combat) or 7 months (guard)
- **Rolls:** Full stat blocks with grab, constrict, electric immunity
- **Tracking:** Number; HP of each; only one Shambler active at a time

---

## 9. Whip of Vermin Family

### Whip of Spiders
- **Classes:** Druid 2, Arcanist/Sorcerer/Wizard 2, Bard/Skald 2, Summoner 2, Witch 2
- **Creates:** Spider whip (wielded); can transform into spider swarm
- **Control:** Standard action (your melee touch attacks); standard to transform
- **Duration:** 1 rd/level (D)
- **Rolls:** Melee touch attack; if swarm: 1d6 + poison (Fort) + distraction (Fort)
- **Tracking:** Whip vs swarm form; if swarm, HP = 3, persists 2 rounds then ends

### Whip of Centipedes
- **Classes:** Druid 5, Arcanist/Sorcerer/Wizard 5, Bard/Skald 5, Summoner 5, Witch 5
- **Creates:** Enhanced centipede whip; transforms into centipede swarm
- **Duration:** 1 rd/level (D)
- **Rolls:** Melee touch; if swarm: 2d6 + poison + distraction
- **Tracking:** Form; if swarm, HP = 10

### Whip of Ants
- **Classes:** Druid 6, Arcanist/Sorcerer/Wizard 6, Bard/Skald 6, Summoner 6, Witch 6
- **Creates:** Army ant whip; transforms into army ant swarm
- **Duration:** 1 rd/level (D)
- **Rolls:** Melee touch; if swarm: 3d6 + poison + distraction
- **Tracking:** Form; if swarm, HP = 16

---

## 10. Animated Objects / Constructs

### Animate Objects
- **Classes:** Bard/Skald 6, Cleric/Oracle 6, Occultist 6, Psychic 6, Warpriest 6, Witch 6
- **Creates:** 1 Small object per CL (Medium = 2, Large = 4, etc.) using animated object stat block
- **Control:** Move action to redirect targets
- **Duration:** 1 rd/level
- **Rolls:** Animated object attacks per stat block by size; construction points determine abilities
- **Tracking:** Number/size; HP of each; construction point abilities (slam, grab, constrict)

---

## 11. Undead Creation & Control

### Lesser Animate Dead
- **Classes:** Cleric/Oracle 2, Arcanist/Sorcerer/Wizard 3, Occultist 2, Shaman 2, Spiritualist 2, Warpriest 2
- **Creates:** 1 Small or Medium skeleton or zombie (no variants)
- **Duration:** Instantaneous (permanent)
- **Rolls:** Skeleton or zombie stat block
- **Tracking:** HP; counts toward 4 HD/CL control limit; 25 gp/HD onyx

### Animate Dead
- **Classes:** Antipaladin 3, Cleric/Oracle 3, Arcanist/Sorcerer/Wizard 4, Occultist 3, Shaman 3, Spiritualist 3, Warpriest 3
- **Creates:** Skeletons or zombies (including variants) up to 2x CL HD per casting
- **Duration:** Instantaneous (permanent)
- **Rolls:** Full stat blocks
- **Tracking:** HD per casting (max 2x CL); total controlled (max 4 HD/CL); variant types; 25 gp/HD onyx

### Create Undead
- **Classes:** Arcanist/Sorcerer/Wizard 6, Cleric/Oracle 6, Shaman 6, Spiritualist 6, Warpriest 6
- **Creates:** Ghoul (CL 11-), Ghast (12-14), Mummy (15-17), Mohrg (18+)
- **Duration:** Instantaneous (permanent)
- **Control:** NOT automatically controlled — must Command Undead at creation
- **Tracking:** Type by CL; control status; 50 gp/HD onyx; must cast at night

### Create Greater Undead
- **Classes:** Arcanist/Sorcerer/Wizard 8, Cleric/Oracle 8, Shaman 8
- **Creates:** Shadow (CL 15-), Wraith (16-17), Spectre (18-19), Devourer (20+)
- **Duration:** Instantaneous (permanent)
- **Control:** NOT automatically controlled
- **Tracking:** Type by CL; incorporeal rules; 50 gp/HD onyx; must cast at night

### Control Undead
- **Classes:** Arcanist/Sorcerer/Wizard 7
- **Creates:** Takes control of existing undead (up to 2 HD/level)
- **Duration:** 1 min/level
- **Rolls:** Will save negates; SR applies
- **Tracking:** Which undead; HD total; intelligent undead remember

---

## 12. Planar Binding Family (Arcane Calling)

### Lesser Planar Binding
- **Classes:** Arcanist/Sorcerer/Wizard 5, Medium 4, Occultist 5, Psychic 5, Summoner 4/Unchained 5
- **Creates:** One called outsider/elemental, 6 HD or less
- **Duration:** Until task complete or 1 day/CL (open-ended)
- **Rolls:** Will save to resist; opposed Cha check to compel service; CL check vs SR
- **Tracking:** Creature HD/stats; Magic Circle containment; service terms; escape attempts (1/day)

### Planar Binding
- **Classes:** Arcanist/Sorcerer/Wizard 6, Occultist 6, Psychic 6, Summoner 5/Unchained 6
- **Creates:** One outsider 12 HD or less, OR up to 3 same kind totaling 12 HD

### Greater Planar Binding
- **Classes:** Arcanist/Sorcerer/Wizard 8, Psychic 8, Summoner 6
- **Creates:** One outsider 18 HD or less, OR up to 3 same kind totaling 18 HD

---

## 13. Planar Ally Family (Divine Calling)

### Lesser Planar Ally
- **Classes:** Cleric/Oracle 4, Medium 3, Psychic 4, Shaman 4, Warpriest 4
- **Creates:** One outsider 6 HD or less (deity sends)
- **Duration:** Per negotiated task (1 min/CL for 100 gp/HD, 1 hr/CL for 500 gp/HD, 1 day/CL for 1000 gp/HD)
- **Rolls:** Full creature stat block; no save (comes willingly)
- **Tracking:** Gold payment; task parameters; 500 gp offering to cast

### Planar Ally
- **Classes:** Cleric/Oracle 6, Psychic 6, Shaman 6, Warpriest 6
- **Creates:** 1-2 outsiders totaling 12 HD; 1250 gp offering

### Greater Planar Ally
- **Classes:** Cleric/Oracle 8, Psychic 8, Shaman 8
- **Creates:** 1-3 outsiders totaling 18 HD; 2500 gp offering

---

## 14. Shadow Conjuration/Evocation (Versatile Entity Creation)

### Shadow Conjuration
- **Classes:** Arcanist/Sorcerer/Wizard 4, Bard/Skald 4, Mesmerist 4, Spiritualist 4
- **Creates:** Quasi-real version of any Sor/Wiz conjuration (summoning/creation) spell level 3 or lower
- **Rolls:** Will save to disbelieve; if disbelieved: 20% damage/effect, creatures have 1/5 HP and 1/5 AC bonus
- **Tracking:** Which spell mimicked; disbelief status per target; shadow vs real effectiveness

### Greater Shadow Conjuration
- **Classes:** Arcanist/Sorcerer/Wizard 7
- **Creates:** Mimics Sor/Wiz conjuration level 6 or lower; 60% vs disbelievers

### Shadow Evocation
- **Classes:** Arcanist/Sorcerer/Wizard 5, Bard/Skald 5, Mesmerist 5, Spiritualist 5
- **Creates:** Quasi-real version of any Sor/Wiz evocation spell level 4 or lower
- **Rolls:** Will to disbelieve; 20% if disbelieved
- **Note:** Can mimic Flaming Sphere, Interposing Hand, etc.

### Greater Shadow Evocation
- **Classes:** Arcanist/Sorcerer/Wizard 8
- **Creates:** Mimics Sor/Wiz evocation level 7 or lower; 60% vs disbelievers

---

## 15. Summon Monster / Summon Nature's Ally (Standard Summons)

### Summon Monster I-IX
- **Classes:** Antipaladin (I-IV as 1st-4th), Bard/Skald (I-VI), Cleric/Oracle/Warpriest (I-IX), Arcanist/Sorcerer/Wizard (I-IX), Medium (I-VI), Mesmerist (I-III), Occultist (I-VI), Psychic (I-IX), Shaman (I-IX), Spiritualist (I-VI), Summoner (I-VI cover SM I-IX), Witch (I-IX)
- **Creates:** 1 creature from list (or 1d3 from -1 level, or 1d4+1 from -2 levels)
- **Control:** Verbal commands
- **Duration:** 1 rd/level (D)
- **Rolls:** Full creature stat blocks; celestial/fiendish template
- **Tracking:** HP; number summoned; abilities/SLAs; position

### Summon Nature's Ally I-IX
- **Classes:** Druid (I-IX), Shaman (I-IX), Hunter (I-VI), Ranger (I-IV)
- **Same structure as SM** with different creature lists; elementals at higher levels

---

## 16. Guardian/Watchdog Spells

### Mage's Faithful Hound
- **Classes:** Arcanist/Sorcerer/Wizard 5, Spiritualist 5, Summoner 4/Unchained 5
- **Creates:** Invisible phantom watchdog (stationary)
- **Control:** None (autonomous guard)
- **Duration:** 1 hr/CL (guard) then 1 rd/CL (attack once triggered)
- **Rolls:** Bite +10, 2d6+3 piercing (once/round); attacks as invisible creature
- **Tracking:** Guard range (barks at 30 ft, bites at 5 ft); guard-to-attack transition timer; sees invisible/ethereal; cannot be attacked (only dispelled)

---

## 17. Combat Mounts (Spell-Created)

### Ghost Wolf
- **Classes:** Arcanist/Sorcerer/Wizard 4, Bloodrager 4, Psychic 4, Summoner 2/Unchained 2 (half-orc)
- **Creates:** Large quasi-real wolf mount (roiling black smoke)
- **Control:** Free action to direct attack
- **Duration:** 1 hr/level (mount) or 1 rd/level (once it attacks)
- **Rolls:** Bite +10, 1d8+6; fear aura: Will save or shaken 1d4 rounds (<6 HD within 30 ft)
- **Tracking:** HP; mode transition (attacking starts round timer); fear aura per creature (24 hr immunity on save)

### Flame Steed
- **Classes:** Druid 4, Cleric/Oracle 4, Paladin 4, Shaman 4, Warpriest 4, Witch 4, Bloodrager 3
- **Creates:** Large quasi-real flame mount
- **Control:** None (mount; auto-smoke when attacked)
- **Duration:** 1 hr/level (D)
- **Rolls:** Fort vs sickened 1d6 rounds (15 ft cone, auto when attacked); fire immune; resist acid/cold/elec 10
- **Tracking:** Mount HP; smoke positioning; sickened duration per creature

---

## 18. Persistent Clouds (Mobile)

### Cloudkill
- **Classes:** Arcanist/Sorcerer/Wizard 5, Magus 5, Spiritualist 5, Summoner (Unchained) 5, Witch 5
- **Creates:** 20-ft radius, 20-ft high poison cloud; moves 10 ft/round away from caster
- **Control:** None (auto-moves); Mythic version: move action to redirect
- **Duration:** 1 min/level
- **Rolls:** 3 HD or less: auto-kill; 4-6 HD: Fort or die (pass = 1d4 Con/round); 6+ HD: Fort half of 1d4 Con/round
- **Tracking:** Cloud position each round; which creatures inside; Con damage accumulated; sinks to low ground

---

## 19. Touch Spell Delivery

### Spectral Hand
- **Classes:** Arcanist/Sorcerer/Wizard 2, Medium 2, Occultist 2, Psychic 2, Spiritualist 2, Witch 2
- **Creates:** Incorporeal hand delivering touch spells at range
- **Control:** Deliver touch spells through it (your actions)
- **Duration:** 1 min/level
- **Rolls:** Melee touch attack +2 bonus; delivers touch spells of 4th level or lower
- **Tracking:** Hand HP (1d4, same caster lost); AC 22; improved evasion; returns after delivering or leaving range

---

## 20. Utility Entities

### Unseen Servant
- **Classes:** Arcanist/Sorcerer/Wizard 1, Bard/Skald 1, Magus 1, Medium 1, Mesmerist 1, Occultist 1, Psychic 1, Spiritualist 1, Summoner 1, Witch 1
- **Creates:** Invisible, mindless force servant
- **Control:** Verbal commands
- **Duration:** 1 hr/level
- **Rolls:** None (cannot attack); Str 2 (lift 20 lb, drag 100 lb)
- **Tracking:** Position; current task; 6 HP (area damage only)

---

## 21. Simulacrum (Permanent Duplicate)

### Simulacrum
- **Classes:** Arcanist/Sorcerer/Wizard 7, Psychic 7, Summoner 5
- **Creates:** Duplicate of any creature at half HD/levels
- **Control:** Verbal commands (absolute obedience)
- **Duration:** Instantaneous (permanent until destroyed)
- **Rolls:** Full stat block at half original's levels
- **Tracking:** HP (half original's); cannot level up; repair: 24+ hrs, 100 gp/HP; cost: 500 gp/HD powdered rubies

---

## 22. Class-Specific Companions

### Eidolon (Summoner class feature)
- Fully customizable outsider companion; acts on own initiative
- Free action to command; full custom stat block with evolution points
- Disappears if summoner unconscious; can't coexist with SLA summon monster
- Life link (damage transfer)

### Phantom (Spiritualist class feature)
- Incorporeal or ectoplasmic companion tied to emotional focus
- Two modes: incorporeal (fly, 50% miss, touch attacks) or ectoplasmic (physical, Str-based)
- Harbored in consciousness when not manifested (grants bonuses)

---

## Items That Create Battlefield Entities

| Item | Price | Creates | Notes |
|---|---|---|---|
| **Figurines of Wondrous Power** | Varies | Specific creature per figurine type | Act as summoned creatures; no spell slot cost |
| **Elemental Gem** | 2,250 gp (consumable) | Large elemental | Acts as SNA-summoned; type by gem |
| **Staff of Swarming Insects** | 22,800 gp | Insect Plague swarms (1 charge) | |
| **Staff of the Woodlands** | 100,400 gp | Animate Plants | |
| **Horn of the Huntmaster** | 5,000 gp | Summon Nature's Ally effects | |
| **Necklace of Fireballs** | Varies | Instant damage, not entity | Included for completeness (no management) |

---

## Classes With NO Unique Entity Spells

These classes have no unique entity-creation spells beyond what appears on shared lists above:

- **Kineticist** — all damage delivered directly, no separate entities
- **Medium** — uses shared spell list entries only
- **Occultist** — uses shared spell list entries only
- **Psychic** — uses shared spell list entries only
- **Mesmerist** — only Unseen Servant, Shadow Conjuration/Evocation
- **Ranger/Hunter** — only SNA I-IV / I-VI
- **Bloodrager** — only shared arcane entries (Flaming Sphere, Ball Lightning, Black Tentacles, etc.)
- **Warpriest** — cleric list at adjusted levels
- **Skald** — bard list (Mad Monkeys, Animate Objects, SM I-VI, etc.)
- **Witch** — shared entries only (Black Tentacles, Animate Objects, SM I-IX, Elemental Swarm, Cloudkill, Spectral Saluqi)
