#!/usr/bin/env python3
"""
Build SNA bestiary JSON from the authoritative SRD bestiary files.

Reads creature stat blocks from the Obsidian vault SRD, maps them
to SNA spell levels, and computes augmented (+4 Str/Con) versions.

Usage: python3 build_bestiary.py
"""

import re
import json
import math
from pathlib import Path

SRD_DIR = Path("/Users/jameson/Documents/Obsidian/Serpent's Skull/Assets/SRD/fantasy-bestiary")
OUT_DIR = Path(__file__).parent / "statblocks"

# SNA creature list by level (from d20pfsrd master list)
# Creature entries: (display_name, srd_slug, source)
# source: "core" = Pathfinder Core/Bestiary, "APxx" = Adventure Path supplement
SNA_LISTS = {
    1: [
        ("Dire Rat", "dire-rat", "core"),
        ("Dog", "dog", "core"),
        ("Dolphin", "dolphin", "core"),
        ("Eagle", "eagle", "core"),
        ("Fire Beetle", "fire-beetle", "core"),
        ("Giant Centipede", "giant-centipede", "core"),
        ("Mite", "mite", "core"),
        ("Poisonous Frog", "poison-frog", "core"),
        ("Pony", "pony", "core"),
        ("Stirge", "stirge", "core"),
        ("Viper", "viper", "core"),
    ],
    2: [
        ("Giant Ant (Worker)", "giant-ant", "core"),
        ("Small Air Elemental", "small-air-elemental", "core"),
        ("Small Earth Elemental", "small-earth-elemental", "core"),
        ("Small Fire Elemental", "small-fire-elemental", "core"),
        ("Small Water Elemental", "small-water-elemental", "core"),
        ("Giant Frog", "giant-frog", "core"),
        ("Giant Spider", "giant-spider", "core"),
        ("Goblin Dog", "goblin-dog", "core"),
        ("Horse", "horse", "core"),
        ("Hyena", "hyena", "core"),
        ("Octopus", "octopus", "core"),
        ("Squid", "squid", "core"),
        ("Wolf", "wolf", "core"),
        # Alternates
        ("Axe Beak", "axe-beak", "AP75"),
        ("Elk", "elk", "AP32"),
        ("Dire Badger", "dire-badger", "AP75"),
        ("Giant Porcupine", "giant-porcupine", "AP75"),
        ("Venomous Snake", "venomous-snake", "AP42"),
    ],
    3: [
        ("Giant Ant (Soldier)", "giant-ant-soldier", "core"),
        ("Ape", "gorilla", "core"),
        ("Aurochs", "aurochs", "core"),
        ("Boar", "boar", "core"),
        ("Cheetah", "cheetah", "core"),
        ("Constrictor Snake", "constrictor-snake", "core"),
        ("Crocodile", "crocodile", "core"),
        ("Dire Bat", "dire-bat", "core"),
        ("Electric Eel", "electric-eel", "core"),
        ("Giant Crab", "giant-crab", "core"),
        ("Leopard", "leopard", "core"),
        ("Monitor Lizard", "monitor-lizard", "core"),
        ("Shark", "shark", "core"),
        ("Wolverine", "wolverine", "core"),
    ],
    4: [
        ("Bison", "bison", "core"),
        ("Deinonychus", "deinonychus", "core"),
        ("Dire Ape", "dire-ape", "core"),
        ("Dire Boar", "dire-boar", "core"),
        ("Dire Wolf", "dire-wolf", "core"),
        ("Medium Air Elemental", "medium-air-elemental", "core"),
        ("Medium Earth Elemental", "medium-earth-elemental", "core"),
        ("Medium Fire Elemental", "medium-fire-elemental", "core"),
        ("Medium Water Elemental", "medium-water-elemental", "core"),
        ("Giant Scorpion", "giant-scorpion", "core"),
        ("Giant Stag Beetle", "giant-stag-beetle", "core"),
        ("Giant Wasp", "giant-wasp", "core"),
        ("Griffon", "griffon", "core"),
        ("Grizzly Bear", "grizzly-bear", "core"),
        ("Lion", "lion", "core"),
        ("Mephit", "mephit", "core"),
        ("Owlbear", "owlbear", "core"),
        ("Pteranodon", "pteranodon", "core"),
        ("Rhinoceros", "rhinoceros", "core"),
        ("Satyr", "satyr", "core"),
        ("Tiger", "tiger", "core"),
        # Alternates
        ("Amphisbaena", "amphisbaena", "AP42"),
        ("Giant Chameleon", "giant-chameleon", "AP75"),
        ("Giant Skunk", "giant-skunk", "AP75"),
        ("Seaweed Leshy", "seaweed-leshy", "AP75"),
        ("Giant Vulture", "giant-vulture", "AP75"),
    ],
    5: [
        ("Ankylosaurus", "ankylosaurus", "core"),
        ("Cyclops", "cyclops", "core"),
        ("Dire Lion", "dire-lion-spotted-lion", "core"),
        ("Large Air Elemental", "large-air-elemental", "core"),
        ("Large Earth Elemental", "large-earth-elemental", "core"),
        ("Large Fire Elemental", "large-fire-elemental", "core"),
        ("Large Water Elemental", "large-water-elemental", "core"),
        ("Ettin", "ettin", "core"),
        ("Giant Moray Eel", "giant-moray-eel", "core"),
        ("Girallon", "girallon", "core"),
        ("Manticore", "manticore", "core"),
        ("Orca", "orca", "core"),
        ("Woolly Rhinoceros", "woolly-rhinoceros", "core"),
        # Alternates
        ("Emperor Cobra", "emperor-cobra", "AP42"),
        ("Giant Owl", "giant-owl", "AP75"),
        ("Giant Gar", "giant-gar", "AP75"),
    ],
    6: [
        ("Bulette", "bulette", "core"),
        ("Dire Bear", "dire-bear-cave-bear", "core"),
        ("Dire Tiger", "dire-tiger-smilodon", "core"),
        ("Elasmosaurus", "elasmosaurus", "core"),
        ("Huge Air Elemental", "huge-air-elemental", "core"),
        ("Huge Earth Elemental", "huge-earth-elemental", "core"),
        ("Huge Fire Elemental", "huge-fire-elemental", "core"),
        ("Huge Water Elemental", "huge-water-elemental", "core"),
        ("Elephant", "elephant", "core"),
        ("Giant Octopus", "giant-octopus", "core"),
        ("Hill Giant", "hill-giant", "core"),
        ("Stegosaurus", "stegosaurus", "core"),
        ("Stone Giant", "stone-giant", "core"),
        ("Triceratops", "triceratops", "core"),
        # Alternates
        ("Shambling Mound", "shambling-mound", "AP75"),
        ("Tylosaurus", "tylosaurus", "AP55"),
    ],
    7: [
        ("Brachiosaurus", "brachiosaurus", "core"),
        ("Dire Crocodile", "dire-crocodile", "core"),
        ("Dire Shark", "dire-shark", "core"),
        ("Greater Air Elemental", "greater-air-elemental", "core"),
        ("Greater Earth Elemental", "greater-earth-elemental", "core"),
        ("Greater Fire Elemental", "greater-fire-elemental", "core"),
        ("Greater Water Elemental", "greater-water-elemental", "core"),
        ("Fire Giant", "fire-giant", "core"),
        ("Frost Giant", "frost-giant", "core"),
        ("Giant Squid", "giant-squid", "core"),
        ("Mastodon", "mastodon", "core"),
        ("Roc", "roc", "core"),
        ("Tyrannosaurus", "tyrannosaurus", "core"),
        # Alternates
        ("Giant Anaconda", "giant-anaconda", "AP42"),
        ("Giant Flytrap", "giant-flytrap", "AP75"),
        ("Giant Snapping Turtle", "giant-snapping-turtle", "AP75"),
    ],
    8: [
        ("Cloud Giant", "cloud-giant", "core"),
        ("Elder Air Elemental", "elder-air-elemental", "core"),
        ("Elder Earth Elemental", "elder-earth-elemental", "core"),
        ("Elder Fire Elemental", "elder-fire-elemental", "core"),
        ("Elder Water Elemental", "elder-water-elemental", "core"),
        ("Purple Worm", "purple-worm", "core"),
    ],
    9: [
        ("Pixie", "pixie", "core"),
        ("Storm Giant", "storm-giant", "core"),
    ],
}


def find_srd_file(slug: str) -> Path | None:
    """Find a creature file in the SRD bestiary by slug."""
    # Manual overrides for tricky mappings
    SLUG_OVERRIDES = {
        "giant-ant-soldier": "giant-ant",
        "giant-ant-worker": "giant-ant",
        "dire-ape": "dire-ape-gigantopithecus",
        "dire-boar": "dire-boar-daeodon",
        "dire-shark": "dire-shark-megalodon",
    }
    slug = SLUG_OVERRIDES.get(slug, slug)

    # Try exact match
    for subdir in SRD_DIR.iterdir():
        if not subdir.is_dir():
            continue
        candidate = subdir / f"{slug}.md"
        if candidate.exists():
            return candidate
    return None


def parse_statblock(path: Path) -> dict | None:
    """Parse a Pathfinder statblock from an Obsidian SRD markdown file."""
    text = path.read_text()

    # Extract the statblock section
    sb_match = re.search(r'```statblock\n(.*?)```', text, re.DOTALL)
    if not sb_match:
        return None

    sb = sb_match.group(1)
    data = {}

    def get(key, default=""):
        m = re.search(rf'^{key}:\s*(.+)$', sb, re.MULTILINE | re.IGNORECASE)
        return m.group(1).strip() if m else default

    def get_int(key, default=0):
        v = get(key, str(default))
        m = re.match(r'[+-]?\d+', v)
        return int(m.group()) if m else default

    data["name"] = get("name", path.stem.replace("-", " ").title())
    data["type"] = get("type", "animal")
    data["size"] = get("size", "Medium")
    data["cr"] = get("Monster_CR", "1")

    # Find pfsrd URL from source or construct one
    source = get("source", "")
    pfsrd_slug = path.stem
    data["pfsrd_url"] = f"https://www.d20pfsrd.com/bestiary/monster-listings/animals/{pfsrd_slug}/"

    # AC
    ac_line = get("AC", "10")
    ac_match = re.match(r'(\d+)', ac_line)
    data["ac"] = int(ac_match.group(1)) if ac_match else 10
    data["ac_breakdown"] = ac_line

    # HP
    data["hp"] = get_int("HP", 10)
    data["hd"] = get("hit_dice", "1d8")

    # Saves
    saves_line = get("saves", "")
    fort_m = re.search(r'Fort\s*([+-]?\d+)', saves_line)
    ref_m = re.search(r'Ref\s*([+-]?\d+)', saves_line)
    will_m = re.search(r'Will\s*([+-]?\d+)', saves_line)
    data["fort"] = int(fort_m.group(1)) if fort_m else 0
    data["ref"] = int(ref_m.group(1)) if ref_m else 0
    data["will"] = int(will_m.group(1)) if will_m else 0

    # Speed
    data["speed"] = get("speed", "30 ft.")

    # Melee
    data["melee"] = get("melee", "")

    # Special attacks
    data["special_attacks"] = get("special_attacks", "")

    # Space/Reach
    data["space"] = get("space", "5 ft.")
    data["reach"] = get("reach", "5 ft.")

    # CMB/CMD
    cmb_line = get("CMB", "0")
    cmb_m = re.match(r'([+-]?\d+)', cmb_line)
    data["cmb"] = int(cmb_m.group(1)) if cmb_m else 0
    data["cmb_full"] = cmb_line

    cmd_line = get("CMD", "10")
    cmd_m = re.match(r'(\d+)', cmd_line)
    data["cmd"] = int(cmd_m.group(1)) if cmd_m else 10
    data["cmd_full"] = cmd_line

    # Stats
    stats_line = get("pf1e_stats", "")
    if stats_line:
        # Format: [21, 17, 15, 2, 12, 6] or [14, 10, 17, None, 13, 11]
        # Replace None with 0, then extract numbers
        cleaned = stats_line.replace("None", "0").replace("null", "0")
        nums = re.findall(r'\d+', cleaned)
        if len(nums) >= 6:
            data["str"] = int(nums[0])
            data["dex"] = int(nums[1])
            data["con"] = int(nums[2])
            data["int"] = int(nums[3])
            data["wis"] = int(nums[4])
            data["cha"] = int(nums[5])

    data["bab"] = get_int("BAB", 0)
    data["feats"] = get("feats", "")
    data["skills"] = get("skills", "")

    # SQ
    data["sq"] = get("senses", "")

    # Special abilities (poison, disease, web, etc.)
    data["special_abilities"] = []
    # Find each "  - name: X\n    desc: Y" block under special_abilities:
    sa_section = re.search(r'special_abilities:\s*\n((?:  - .*\n(?:    .*\n)*)*)', sb)
    if sa_section:
        for m in re.finditer(r'  - name:\s*(.+)\n    desc:\s*(.+?)(?=\n  - |\nsources:|\ndesc_short:|\n[a-z]|\Z)', sa_section.group(1), re.DOTALL):
            name = m.group(1).strip()
            desc = m.group(2).strip().replace('\n    ', ' ').replace('\n', ' ')
            data["special_abilities"].append({"name": name, "desc": desc})

    return data


def mod(score: int) -> int:
    return (score - 10) // 2


def compute_augmented(base: dict) -> dict:
    """Compute Augment Summoning stats (+4 Str, +4 Con)."""
    aug = {}
    base_str = base.get("str", 10)
    base_con = base.get("con", 10)
    aug_str = base_str + 4
    aug_con = base_con + 4
    str_diff = mod(aug_str) - mod(base_str)  # typically +2
    con_diff = mod(aug_con) - mod(base_con)  # typically +2

    aug["note"] = "With Augment Summoning (+4 Str, +4 Con)"
    aug["Str"] = aug_str
    aug["Con"] = aug_con

    # HP: +con_diff per HD
    hd_str = base.get("hd", "1d8")
    hd_match = re.match(r'(\d+)', hd_str)
    n_hd = int(hd_match.group(1)) if hd_match else 1
    aug["HP"] = base["hp"] + (con_diff * n_hd)

    # Recalculate HD string
    old_hd_mod = re.search(r'([+-]\d+)', hd_str)
    old_mod = int(old_hd_mod.group(1)) if old_hd_mod else 0
    new_mod = old_mod + (con_diff * n_hd)
    hd_base = re.match(r'\d+d\d+', hd_str).group() if re.match(r'\d+d\d+', hd_str) else hd_str
    aug["HD"] = f"{hd_base}{'+' if new_mod >= 0 else ''}{new_mod}" if new_mod else hd_base

    # AC: unchanged (Str doesn't affect AC, Con doesn't affect AC)
    aug["AC"] = base["ac"]

    # Fort: +con_diff
    aug["Fort"] = base["fort"] + con_diff

    # Melee: adjust attack bonus (+str_diff) and damage (+str_diff for Str-based)
    melee = base["melee"]
    if melee:
        # Adjust each attack bonus: +N becomes +(N+str_diff)
        def adjust_bonus(m):
            old = int(m.group(1))
            new = old + str_diff
            return f"+{new}" if new >= 0 else str(new)

        # Adjust bonuses outside parens
        def adjust_melee(melee_str):
            result = []
            i = 0
            while i < len(melee_str):
                if melee_str[i] == '(':
                    # Find closing paren — adjust damage inside
                    j = melee_str.index(')', i)
                    paren = melee_str[i:j+1]
                    # Adjust damage modifier inside parens
                    def adj_dmg(m):
                        old = int(m.group(1))
                        new = old + str_diff
                        return f"+{new}" if new >= 0 else str(new)
                    paren = re.sub(r'(\d+d\d+)([+-])(\d+)', lambda m: f"{m.group(1)}{'+' if int(m.group(2)+m.group(3))+str_diff >= 0 else ''}{int(m.group(2)+m.group(3))+str_diff}", paren)
                    result.append(paren)
                    i = j + 1
                elif re.match(r'[+-]\d+', melee_str[i:]):
                    m = re.match(r'([+-]\d+)', melee_str[i:])
                    old = int(m.group(1))
                    new = old + str_diff
                    result.append(f"+{new}" if new >= 0 else str(new))
                    i += len(m.group())
                else:
                    result.append(melee_str[i])
                    i += 1
            return ''.join(result)

        aug["Melee"] = adjust_melee(melee)

    # CMB: +str_diff
    aug["CMB"] = base["cmb"] + str_diff
    # CMD: +str_diff + con_diff (both contribute)
    aug["CMD"] = base["cmd"] + str_diff + con_diff

    return aug


def apply_improved_critical(melee: str, feats: str) -> str:
    """Apply Improved Critical feat to melee line — doubles crit range.

    Parses "Improved Critical (weapon)" from feats, then appends /19-20
    (or adjusts existing crit range) to matching attacks in the melee string.
    """
    if not melee or not feats:
        return melee
    # Find all Improved Critical targets
    ic_weapons = re.findall(r'Improved Critical\s*\(([^)]+)\)', feats, re.IGNORECASE)

    # Handle bare "Improved Critical" without weapon qualifier (e.g., Triceratops SRD)
    if not ic_weapons and re.search(r'Improved Critical(?!\s*\()', feats, re.IGNORECASE):
        # Infer weapon from Weapon Focus feat, or first melee attack
        wf = re.findall(r'Weapon Focus\s*\(([^)]+)\)', feats, re.IGNORECASE)
        if wf:
            ic_weapons = [wf[0].strip()]
        else:
            # Use first weapon name from melee line
            first = re.match(r'(?:\d+\s+)?(\w+)', melee)
            if first:
                ic_weapons = [first.group(1)]

    if not ic_weapons:
        return melee

    ic_set = {w.strip().lower() for w in ic_weapons}

    # For each weapon, find the attack in the melee line and add crit range
    # Melee format: "gore +17 (2d10+12)" or "bite +20 (4d6+22/19-20)"
    def add_crit_range(m):
        full = m.group(0)
        weapon = m.group(1).strip().lower()
        # Normalize: "2 claws" -> "claw", "bite" -> "bite"
        weapon_base = re.sub(r'^\d+\s+', '', weapon).rstrip('s')
        if weapon_base not in ic_set:
            return full
        # Check if already has a crit range
        if re.search(r'/\d+-\d+', full):
            return full  # already has crit range, leave it
        # Add /19-20 before closing paren
        return full.replace(')', '/19-20)')

    # Match each attack: "weapon +N (damage)" or "N weapons +N (damage)"
    result = re.sub(
        r'([\w\s]+?)\s+[+-]\d+(?:/[+-]\d+)*\s+\([^)]+\)',
        add_crit_range, melee
    )
    return result


# ═══ FEAT & ABILITY PARSERS ═══

# Badge feat definitions: feat_name → tooltip template
BADGE_FEATS = {
    "Flyby Attack": "Move -> attack -> continue moving. No AoO from target.",
    "Spring Attack": "Move -> melee attack during move -> continue moving.",
    "Combat Reflexes": "X AoOs/round",  # X computed from Dex
    "Diehard": "Fights until -Con HP. Auto-stabilizes.",
}

# CMB feat definitions
CMB_FEATS = {
    "Improved Bull Rush": {"action": "push", "greater": "Greater Bull Rush",
                           "greater_note": "pushed foe provokes AoOs"},
    "Improved Overrun": {"action": "overrun", "greater": "Greater Overrun",
                         "greater_note": "overrun foe provokes AoOs"},
    "Improved Sunder": {"action": "sunder", "greater": None, "greater_note": None},
}


def parse_badges(feats: str, dex: int = 10) -> list[dict]:
    """Parse badge feats from feats string. Returns list of {name, tooltip}."""
    if not feats:
        return []
    badges = []
    for feat, tooltip in BADGE_FEATS.items():
        if feat in feats:
            tip = tooltip
            if feat == "Combat Reflexes":
                dex_mod = (dex - 10) // 2
                tip = f"{max(1, dex_mod)} AoOs/round"
            badges.append({"name": feat, "tooltip": tip})
    return badges


def parse_cmb_feats(feats: str, cmb: int, display_name: str = "") -> list[dict]:
    """Parse CMB-related feats. Returns list of {name, desc, greater}."""
    if not feats:
        return []
    results = []

    # Standard Improved/Greater CMB feats
    for imp_name, info in CMB_FEATS.items():
        if imp_name not in feats:
            continue
        has_greater = bool(info["greater"] and info["greater"] in feats)
        effective_cmb = cmb + 2  # +2 from Improved feat
        desc = f"CMB +{effective_cmb} {info['action']} (no AoO)"
        if has_greater:
            desc += f"; {info['greater_note']}"
        results.append({
            "name": imp_name,
            "desc": desc,
            "greater": has_greater,
        })

    # Awesome Blow (standalone)
    if "Awesome Blow" in feats:
        results.append({
            "name": "Awesome Blow",
            "desc": f"CMB +{cmb} -> 10ft knockback + prone",
            "greater": False,
        })

    return results


def parse_ability_flags(data: dict, display_name: str = "") -> dict:
    """Parse creature ability flags from special_attacks, feats, and special_abilities.

    Returns a dict of flag fields to merge into the creature entry.
    Only includes flags that are True / have data (omits False flags).
    """
    sa = data.get("special_attacks", "")
    feats = data.get("feats", "")
    abilities = data.get("special_abilities", [])
    sa_lower = sa.lower()
    feats_lower = feats.lower()
    name_lower = display_name.lower()

    # Build a combined abilities text for searching
    ab_text = " ".join(a.get("desc", "") + " " + a.get("name", "") for a in abilities).lower()

    flags = {}

    # Rend
    m = re.search(r'rend\s*\([^,]*,\s*(\d+d\d+[+-]?\d*)\)', sa, re.IGNORECASE)
    if m:
        flags["hasRend"] = True
        flags["rendDmg"] = m.group(1)

    # Death Roll
    m = re.search(r'death roll\s*\(([^)]+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasDeathRoll"] = True
        flags["deathRollDmg"] = m.group(1)

    # Gnaw
    if "gnaw" in sa_lower:
        flags["hasGnaw"] = True

    # Diehard
    if "diehard" in feats_lower:
        flags["hasDiehard"] = True

    # Powerful Charge
    m = re.search(r'powerful charge\s*\([^,]*,\s*([^)]+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasPowerfulCharge"] = True
        flags["powerfulChargeDmg"] = m.group(1)

    # Earth Mastery
    if "earth elemental" in name_lower or "earth mastery" in sa_lower or "earth mastery" in ab_text:
        flags["hasEarthMastery"] = True

    # Water Mastery
    if "water elemental" in name_lower or "water mastery" in sa_lower or "water mastery" in ab_text:
        flags["hasWaterMastery"] = True

    # Rage
    if "rage" in sa_lower or "rage" in ab_text:
        flags["hasRage"] = True

    # Bleeding Critical
    if "bleeding critical" in feats_lower:
        flags["hasBleedingCrit"] = True

    # Staggering Critical
    if "staggering critical" in feats_lower:
        flags["hasStaggeringCrit"] = True

    # Vital Strike
    if "improved vital strike" in feats_lower:
        flags["hasVitalStrike"] = True
        flags["vitalStrikeLevel"] = "improved"
    elif "vital strike" in feats_lower:
        flags["hasVitalStrike"] = True
        flags["vitalStrikeLevel"] = "normal"

    # Whirlwind
    m = re.search(r'whirlwind\s*\(DC\s*(\d+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasWhirlwind"] = True
        flags["whirlwindDC"] = int(m.group(1))
    elif "whirlwind" in sa_lower:
        flags["hasWhirlwind"] = True

    # Vortex
    m = re.search(r'vortex\s*\(DC\s*(\d+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasVortex"] = True
        flags["vortexDC"] = int(m.group(1))
    elif "vortex" in sa_lower:
        flags["hasVortex"] = True

    # Trample
    m = re.search(r'trample\s*\(([^,]+),\s*DC\s*(\d+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasTrample"] = True
        flags["trampleDmg"] = m.group(1).strip()
        flags["trampleDC"] = int(m.group(2))

    # Rock Throwing
    m = re.search(r'rock throwing\s*\((\d+)\s*ft\.\)', sa, re.IGNORECASE)
    if m:
        flags["hasRockThrowing"] = True
        flags["rockThrowingRange"] = f"{m.group(1)} ft."
    elif "rock throwing" in sa_lower or "rock throwing" in ab_text:
        flags["hasRockThrowing"] = True

    # Swallow Whole
    m = re.search(r'swallow whole\s*\(([^)]+)\)', sa, re.IGNORECASE)
    if m:
        flags["hasSwallowWhole"] = True
        flags["swallowWholeInfo"] = m.group(1)

    return flags


def build_combat_card(data: dict) -> dict:
    """Build a combat_card dict from parsed data."""
    return {
        "AC": data["ac"],
        "AC_breakdown": data.get("ac_breakdown", ""),
        "HP": data["hp"],
        "HD": data.get("hd", ""),
        "Fort": data["fort"],
        "Ref": data["ref"],
        "Will": data["will"],
        "Speed": data["speed"],
        "Melee": data["melee"],
        "CMB": data["cmb"],
        "CMB_full": data.get("cmb_full", ""),
        "CMD": data["cmd"],
        "CMD_full": data.get("cmd_full", ""),
        "Special_Attacks": data.get("special_attacks", ""),
        "Special_Qualities": data.get("sq", ""),
    }


def main():
    all_output = {}
    total = 0
    found = 0
    missing = []

    for sna_level, creatures in sorted(SNA_LISTS.items()):
        level_data = {"sna_level": sna_level, "creatures": []}

        for entry in creatures:
            display_name, slug, source = entry
            total += 1
            srd_path = find_srd_file(slug)

            if not srd_path:
                print(f"  MISS: {display_name} ({slug})")
                missing.append((sna_level, display_name, slug))
                continue

            data = parse_statblock(srd_path)
            if not data:
                print(f"  PARSE FAIL: {display_name} ({srd_path})")
                missing.append((sna_level, display_name, slug))
                continue

            found += 1

            # Apply Improved Critical to melee lines before building card
            feats = data.get("feats", "")
            data["melee"] = apply_improved_critical(data["melee"], feats)

            card = build_combat_card(data)
            aug = compute_augmented(data)

            # Apply Improved Critical to augmented melee too
            aug_melee = aug.get("Melee", card["Melee"])
            aug["Melee"] = apply_improved_critical(aug_melee, feats)

            # Parse new feat/ability fields
            badges = parse_badges(feats, data.get("dex", 10))
            cmb_feats = parse_cmb_feats(feats, data["cmb"], display_name)
            ability_flags = parse_ability_flags(data, display_name)

            is_alt = source != "core"
            creature_entry = {
                "name": display_name,
                "pfsrd_url": data["pfsrd_url"],
                "type": data["type"],
                "size": data["size"],
                "cr": data["cr"],
                "source": source,
                "is_alternate": is_alt,
                "special_abilities": data.get("special_abilities", []),
                "combat_card": card,
                "full_statblock": {
                    "Str": data.get("str", 10),
                    "Dex": data.get("dex", 10),
                    "Con": data.get("con", 10),
                    "Int": data.get("int", 2),
                    "Wis": data.get("wis", 10),
                    "Cha": data.get("cha", 2),
                    "BAB": data.get("bab", 0),
                    "Feats": data.get("feats", ""),
                    "Skills": data.get("skills", ""),
                    "Space": data.get("space", "5 ft."),
                    "Reach": data.get("reach", "5 ft."),
                },
                "augmented": {
                    "note": aug["note"],
                    "AC": aug["AC"],
                    "HP": aug["HP"],
                    "HD": aug["HD"],
                    "Fort": aug["Fort"],
                    "Melee": aug["Melee"],
                    "CMB": aug["CMB"],
                    "CMD": aug["CMD"],
                    "Str": aug["Str"],
                    "Con": aug["Con"],
                },
            }

            # Add optional fields only when present
            if badges:
                creature_entry["badges"] = badges
            if cmb_feats:
                creature_entry["cmbFeats"] = cmb_feats
            if ability_flags:
                creature_entry.update(ability_flags)

            level_data["creatures"].append(creature_entry)
            print(f"  OK: {display_name} (AC {data['ac']}, HP {data['hp']}, Str {data.get('str','?')})")

        all_output[sna_level] = level_data

    # Write output files
    for group_name, levels in [("1-3", [1,2,3]), ("4-6", [4,5,6]), ("7-9", [7,8,9])]:
        out = {
            "meta": {
                "title": f"SNA Bestiary Levels {group_name}",
                "source": "Pathfinder SRD Bestiary (Obsidian vault)",
                "generated_by": "build_bestiary.py",
                "note": "Stats from authoritative SRD stat blocks, NOT wild shape tables"
            },
            "levels": [all_output[l] for l in levels if l in all_output]
        }
        out_path = OUT_DIR / f"SNA-Bestiary-Levels-{group_name}.json"
        with open(out_path, "w") as f:
            json.dump(out, f, indent=2)
        print(f"\nWrote {out_path.name}")

    print(f"\nDone: {found}/{total} creatures found, {len(missing)} missing")
    if missing:
        print("\nMissing creatures (need manual entry or d20pfsrd fetch):")
        for lv, name, slug in missing:
            print(f"  SNA {lv}: {name} ({slug})")


if __name__ == "__main__":
    main()
