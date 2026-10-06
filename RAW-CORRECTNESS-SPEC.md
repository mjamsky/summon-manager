# PF1e Rules-Confirmation Spec — SNA Combat Manager

Purpose: pin down exact numbers/sources for combat mechanics the tool implements. Every rule below is sourced from either the local vault SRD (`/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/`) or, where the vault didn't carry it, Archives of Nethys (cited by URL). No rule below is from memory alone.

**Vault coverage note:** the local SRD vault (`Assets/SRD/`) contains only `spells/`, `fantasy-bestiary/` (creature statblocks), and `afflictions-and-hazards/`. It does **not** contain the Core Rulebook's Combat chapter or class-feature text (no barbarian, no flanking, no natural-attack multiplier rules, no universal monster rules). Confirmed by directory listing and by `grep -rl` for "natural attack" / "flanking" across the vault turning up only bestiary/spell cross-references, never a rules definition. So Topics 1 and 2 (and the Rage class-feature cross-reference in Topic 4) are AoN-sourced; Topics 3 and 4's actual spells are vault-sourced.

---

## 1. Natural attack Strength-to-damage multiplier

**Source (primary):** Archives of Nethys, *Universal Monster Rules* — https://legacy.aonprd.com/bestiary/universalmonsterrules.html (also stated in the Core Rulebook Combat chapter mirror at https://legacy.aonprd.com/coreRulebook/combat.html, `id="natural-attacks"`). Vault does not carry this text — verified absent above.

> "Most creatures possess one or more natural attacks (attacks made without a weapon). These attacks fall into one of two categories, primary and secondary attacks. **Primary attacks are made using the creature's full base attack bonus and add the creature's full Strength bonus on damage rolls. Secondary attacks are made using the creature's base attack bonus –5 and add only 1/2 the creature's Strength bonus on damage rolls. If a creature has only one natural attack, it is always made using the creature's full base attack bonus and adds 1-1/2 the creature's Strength bonus on damage rolls.** This increase does not apply if the creature has multiple attacks but only takes one. If a creature has only one type of attack, but has multiple attacks per round, that attack is treated as a primary attack, regardless of its type."

- **Primary natural attack:** full Str modifier to damage.
- **Secondary natural attack:** ½ Str modifier to damage (and attack roll at BAB –5, noted for context only per your instructions).
- **Single natural attack (only one natural attack, period — e.g. a creature whose only natural weapon is a bite):** 1½× Str modifier to damage. Does **not** apply if the creature merely *chooses* to use one of several available attacks; it must have only the one type/instance.
- **Edge case called out by the rule itself:** "If a creature has only one type of attack, but has multiple attacks per round, that attack is treated as a primary attack" (not 1½×) — e.g. a creature with 2 claw attacks and nothing else: both claws are primary (full Str), not 1½×. The 1½× bonus is reserved for a creature with exactly one attack total.

**Two-handed manufactured weapon** — Core Rulebook Combat chapter, https://legacy.aonprd.com/coreRulebook/combat.html (`id="damage-two-handed"`):

> "*Wielding a Weapon Two-Handed*: When you deal damage with a weapon that you are wielding two-handed, **you add 1-1/2 times your Strength bonus** (Strength penalties are not multiplied). You don't get this higher Strength bonus, however, when using a light weapon with two hands."

So: two-handed manufactured weapon = same 1½× multiplier as a single natural attack.

### Classification list (default Primary/Secondary)

Source: same Universal Monster Rules page, "Table: Natural Attacks by Size":

| Attack type | Default classification |
|---|---|
| Bite | **Primary** |
| Claw | **Primary** |
| Gore | **Primary** |
| Slam | **Primary** |
| Sting | **Primary** |
| Talons | **Primary** |
| Hoof | **Secondary** |
| Tentacle | **Secondary** |
| Wing | **Secondary** |
| Pincers | **Secondary** |
| Tail Slap | **Secondary** |
| "Other" (catch-all, incl. tongue, tusk, trample, and anything not listed) | **Secondary** |

**Not individually listed in the table:** tongue, tusk, trample fall under the table's own "Other" row (Secondary) — the SRD does not give them a bespoke entry. Trample in particular is actually its own special-attack type with separate damage rules (not a normal natural-attack damage roll) — flagging this as an edge case; if the tool treats "trample" as a standard attack row using the primary/secondary Str multiplier, that's a simplification, not strict RAW (trample's real damage rule is: trample damage = 1.5× Str, one available die roll per trample action, with a separate Reflex save for half — distinct subsystem, not covered further here since it's out of scope for this task).

**Important qualifier from the same source text (also matches your app's existing note that this "increase does not apply if the creature has multiple attacks but only takes one" and the multiple-primary-attacks case above):** the table gives *defaults*; an individual creature's stat block can and does override these (e.g., some creatures have a bite classified differently). Treat the table as fallback classification only, statblock text is authoritative per-creature.

### Natural attacks + manufactured weapons in the same round

Same source (Universal Monster Rules) and confirmed independently by Core Rulebook Combat chapter (`id` anchor after `natural-attacks`, https://legacy.aonprd.com/coreRulebook/combat.html):

> "Creatures with natural attacks and attacks made with weapons can use both as part of a full attack action (although often a creature must forgo one natural attack for each weapon clutched in that limb, be it a claw, tentacle, or slam). **Such creatures attack with their weapons normally but treat all of their natural attacks as secondary attacks during that attack, regardless of the attack's original type.**"

Core Rulebook phrasing (same rule, slightly different wording), curled directly from https://legacy.aonprd.com/coreRulebook/combat.html:

> "You can make attacks with natural weapons in combination with attacks made with a melee weapon and unarmed strikes, so long as a different limb is used for each attack... When you make additional attacks in this way, **all of your natural attacks are treated as secondary natural attacks**, using your base attack bonus minus 5 and adding only 1/2 of your Strength modifier on damage rolls. Feats such as Two-Weapon Fighting and Multiattack can reduce these penalties."

- **Effect:** ALL natural attacks (even ones that are normally Primary, e.g. bite) drop to Secondary (½ Str, BAB –5) the moment the creature also attacks with a manufactured weapon in that same full attack. This is a full downgrade, not per-limb.

### Context only — attack-roll penalties / Multiattack (noted briefly, per your instructions; tool already stores final attack bonus from statblock)

- Secondary attacks take the BAB –5 penalty on the *attack roll* (separate from the damage multiplier above).
- The Multiattack feat (and Two-Weapon Fighting, when mixing natural + manufactured) reduces these attack-roll penalties, per the same Combat-chapter quote above. Not otherwise detailed here since the tool consumes final attack bonuses directly from statblocks.

---

## 2. Flanking

**Source:** Archives of Nethys, Core Rulebook Combat chapter — https://legacy.aonprd.com/coreRulebook/combat.html (`id="flanking"`), cross-checked against the Table: Attack Roll Modifiers in the same document.

> "**Flanking** — When making a melee attack, you get a **+2 flanking bonus** if your opponent is threatened by another enemy character or creature on its opposite border or opposite corner."
>
> "When in doubt about whether two characters flank an opponent in the middle, trace an imaginary line between the two attackers' centers. If the line passes through opposite borders of the opponent's space (including corners of those borders), then the opponent is flanked."
>
> "*Exception*: If a flanker takes up more than 1 square, it gets the flanking bonus if any square it occupies counts for flanking."
>
> "Only a creature or character that threatens the defender can help an attacker get a flanking bonus."
>
> "**Creatures with a reach of 0 feet can't flank an opponent.**"

Table: Attack Roll Modifiers (same page) lists:

```
Flanking defender    Melee: +2    Ranged: —
```

- **Bonus amount and type:** +2, and it is **untyped** (the RAW text never assigns it a bonus type like morale/circumstance; it functions as a flat, stacking modifier — this is standard PF1e/3.5 convention, no explicit "type:" label given in the rule text itself, which is itself worth flagging as a minor ambiguity, though it is universally treated as untyped and therefore always stacks with other bonus types).
- **Melee only.** Ranged attacks get no flanking bonus (confirmed by the table's "—" under Ranged).
- Reach-0 creatures cannot participate in flanking (neither give nor, implicitly, benefit from a flanking partner who is reach-0).

---

## 3. Haste (spell)

**Source:** vault SRD, `/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/spells/h/haste.md` (cites "PRPG Core Rulebook pg. 293").

> "When making a full attack action, a hasted creature may make **one extra attack** with one natural or manufactured weapon. The attack is made using the creature's full base attack bonus, plus any modifiers appropriate to the situation. (This effect is not cumulative with similar effects... nor does it actually grant an extra action...)
>
> A hasted creature gains a **+1 bonus on attack rolls** and a **+1 dodge bonus to AC and Reflex saves**. Any condition that makes you lose your Dexterity bonus to Armor Class (if any) also makes you lose dodge bonuses.
>
> All of the hasted creature's modes of movement (including land movement, burrow, climb, fly, and swim) **increase by 30 feet**, to a maximum of twice the subject's normal speed using that form of movement. This increase counts as an **enhancement bonus**... **Multiple *haste* effects don't stack.** *Haste* dispels and counters *slow*."

Summary of grants:
- **Attack bonus:** +1 (type not explicitly named in this text — RAW convention treats untyped/typeless attack-roll bonuses like this as stacking with everything except another instance of the identical effect; multiple haste castings explicitly do NOT stack per the last line quoted)
- **AC bonus:** +1, explicitly a **dodge** bonus
- **Reflex bonus:** +1, same dodge bonus (the rule bundles AC and Reflex into one +1 dodge grant)
- **Extra attack:** one extra attack at full BAB on a full-attack action, with one natural or manufactured weapon; not an extra action
- **Movement:** +30 ft. to every movement mode, capped at 2× normal speed for that mode; enhancement bonus type
- **Non-stacking:** multiple haste effects don't stack (this is haste-specific, not the general dodge-stacking rule below)

### Dodge-bonus stacking (general rule, for cross-reference against haste's +1 dodge to AC)

**Source:** Archives of Nethys, Core Rulebook Combat chapter — https://legacy.aonprd.com/coreRulebook/combat.html (`id="dodge-bonuses"`).

> "*Dodge Bonuses*: Dodge bonuses represent actively avoiding blows. Any situation that denies you your Dexterity bonus also denies you dodge bonuses. (Wearing armor, however, does not limit these bonuses the way it limits a Dexterity bonus to AC.) **Unlike most sorts of bonuses, dodge bonuses stack with each other.**"

- **Yes, multiple dodge bonuses stack with each other** (general rule). Note this is distinct from haste's own specific no-self-stacking clause — haste's dodge bonus stacks fine with, say, a Dodge feat or Guarded Stance dodge bonus, but a second casting of haste on the same creature does not add a second +1 (haste-specific override, quoted above).

---

## 4. Buff bonus types & saves affected

### Bless

**Source:** vault SRD, `/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/spells/b/bless.md` (PRPG Core Rulebook pg. 249).

> "*Bless* fills your allies with courage. Each ally gains a **+1 morale bonus on attack rolls and on saving throws against fear effects.**"

- **Bonus:** +1, type **morale**.
- **Saves affected: only vs. fear effects** — NOT a general save bonus. (Confirms your question: it does not apply to all saves, only fear-related ones.)
- Also grants no AC/damage bonus in the base (non-mythic) version.

### Prayer

**Source:** vault SRD, `/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/spells/p/prayer.md` (PRPG Core Rulebook pg. 324).

> "You bring special favor upon yourself and your allies while bringing disfavor to your enemies. **You and each of your allies gain a +1 luck bonus on attack rolls, weapon damage rolls, saves, and skill checks**, while each of your foes takes a **-1 penalty** on such rolls."

- **Bonus:** +1, type **luck** (allies) / –1 penalty (foes, same rolls).
- **Saves affected: ALL saves** (unconditional — "saves" with no fear/condition qualifier), unlike bless. Also touches attack rolls, weapon damage rolls, and skill checks (broader than bless).

### Heroism

**Source:** vault SRD, `/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/spells/h/heroism.md` (PRPG Core Rulebook pg. 295).

> "This spell imbues a single creature with great bravery and morale in battle. **The target gains a +2 morale bonus on attack rolls, saves, and skill checks.**"

- **Bonus:** +2, type **morale**.
- **Saves affected: ALL saves**, unconditional (like prayer, unlike bless). Does not include weapon damage rolls (unlike prayer) in its base version.

### Rage (cross-reference: AC penalty + Con/save effects)

Two distinct entities carry "Rage" — flagging this explicitly since it's a possible source of confusion:

**(a) The *Rage* spell** — vault SRD, `/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/spells/r/rage.md` (PRPG Core Rulebook pg. 329):

> "Each affected creature gains a **+2 morale bonus to Strength and Constitution, a +1 morale bonus on Will saves, and a -2 penalty to AC.** The effect is otherwise identical with a barbarian's rage except that the subjects aren't fatigued at the end of the rage."

**(b) The Barbarian's Rage class feature** (referenced by the spell above, but not itself in the vault) — Archives of Nethys, Core Rulebook Barbarian class — https://legacy.aonprd.com/corerulebook/classes/barbarian.html (`id="rage"`):

> "While in rage, a barbarian gains a **+4 morale bonus** to her Strength and Constitution, as well as a **+2 morale bonus on Will saves**. In addition, she takes a **–2 penalty to Armor Class**. The increase to Constitution grants the barbarian 2 hit points per Hit Dice, but these disappear when the rage ends... A barbarian can end her rage as a free action and is **fatigued** after rage for a number of rounds equal to 2 times the number of rounds spent in the rage."

- **AC penalty:** –2, both versions, untyped penalty (not a "bonus type" — straight numeric penalty).
- **Con/save effects:** both versions grant a **morale** bonus to Str/Con and a **morale** bonus to Will saves only (not Fort/Ref). Numbers differ: class feature = +4 Str/+4 Con/+2 Will; the *Rage spell* = +2 Str/+2 Con/+1 Will (half the class feature's numbers) and, unlike the class feature, does not cause fatigue when it ends.
- **Bonus HP:** both grant +2 hp/HD from the temporary Con increase (this is standard PF1e temp-Con-to-HP math, not a separate bonus type), which disappear (not lost first like temp HP) when the effect ends.

---

## Report — one-line claim per topic

1. **Natural attacks:** Primary = full Str, secondary = ½ Str (BAB –5), single-natural-attack creature = 1½× Str; two-handed manufactured weapon also 1½× Str. Defaults: bite/claw/gore/slam/sting/talons = Primary; hoof/tentacle/wing/pincers/tail-slap = Secondary; tongue/tusk/trample fall under the table's "Other" (Secondary) catch-all, not individually listed. Mixing natural + manufactured weapon attacks in one round downgrades ALL natural attacks to Secondary. **AoN-sourced (vault has no core-rules/universal-monster-rules text).**
2. **Flanking:** +2, melee-attack-rolls only (not ranged), untyped/stacking, reach-0 creatures can't flank. **AoN-sourced (not in vault).**
3. **Haste:** +1 attack, +1 dodge to AC and Reflex, one extra attack at full BAB, +30 ft. to all movement modes (enhancement bonus, capped at 2×); multiple haste castings don't stack on the same creature, but dodge bonuses in general do stack with each other (separate rule). **Vault-sourced** (dodge-stacking cross-reference is AoN, not in vault).
4. **Buffs:** bless = +1 morale to attack + saves-vs-fear-only (NOT all saves); prayer = +1 luck to attack/damage/saves(all)/skills (foes –1); heroism = +2 morale to attack/saves(all)/skills; rage (spell) = +2 morale Str/Con, +1 morale Will, –2 AC, no fatigue after; rage (barbarian class feature, AoN cross-ref) = +4 morale Str/Con, +2 morale Will, –2 AC, fatigued after. **Vault-sourced for all four spells; barbarian class-feature cross-reference is AoN (not in vault).**

**Flag:** Topics 1 and 2, and the barbarian-class-feature half of Topic 4's rage cross-reference, required AoN fallback — the vault SRD only covers spells/bestiary/afflictions, not the Core Rulebook Combat chapter or class features. Everything else (haste, bless, prayer, heroism, the Rage *spell*) came directly from the vault. One real ambiguity worth your attention: RAW never explicitly labels the flanking +2 or haste's +1 attack bonus with a bonus *type* (unlike the clearly-typed morale/luck/dodge/enhancement bonuses elsewhere) — universal convention treats them as untyped/stacking, but the source text itself is silent on the label. Also flagged: trample is really its own special-attack subsystem (not a standard Str-multiplier natural attack), separate from the primary/secondary framework — worth checking how the tool currently handles it if trample creatures are in the bestiary.
