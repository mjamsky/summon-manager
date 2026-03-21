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
SNA_LISTS = {
    1: [
        ("Dire Rat", "dire-rat"), ("Dog", "dog"), ("Dolphin", "dolphin"),
        ("Eagle", "eagle"), ("Fire Beetle", "fire-beetle"),
        ("Giant Centipede", "giant-centipede"), ("Mite", "mite"),
        ("Poisonous Frog", "poisonous-frog"), ("Pony", "pony"),
        ("Stirge", "stirge"), ("Viper", "viper"),
    ],
    2: [
        ("Giant Ant (Worker)", "giant-ant-worker"),
        ("Small Air Elemental", "small-air-elemental"),
        ("Small Earth Elemental", "small-earth-elemental"),
        ("Small Fire Elemental", "small-fire-elemental"),
        ("Small Water Elemental", "small-water-elemental"),
        ("Giant Frog", "giant-frog"), ("Giant Spider", "giant-spider"),
        ("Goblin Dog", "goblin-dog"), ("Horse", "horse"),
        ("Hyena", "hyena"), ("Octopus", "octopus"),
        ("Squid", "squid"), ("Wolf", "wolf"),
    ],
    3: [
        ("Giant Ant (Soldier)", "giant-ant-soldier"), ("Ape", "ape"),
        ("Aurochs", "aurochs"), ("Boar", "boar"), ("Cheetah", "cheetah"),
        ("Constrictor Snake", "constrictor-snake"), ("Crocodile", "crocodile"),
        ("Dire Bat", "dire-bat"), ("Electric Eel", "electric-eel"),
        ("Giant Crab", "giant-crab"), ("Leopard", "leopard"),
        ("Monitor Lizard", "monitor-lizard"), ("Shark", "shark"),
        ("Wolverine", "wolverine"),
    ],
    4: [
        ("Bison", "bison"), ("Deinonychus", "deinonychus"),
        ("Dire Ape", "dire-ape"), ("Dire Boar", "dire-boar"),
        ("Dire Wolf", "dire-wolf"),
        ("Medium Air Elemental", "medium-air-elemental"),
        ("Medium Earth Elemental", "medium-earth-elemental"),
        ("Medium Fire Elemental", "medium-fire-elemental"),
        ("Medium Water Elemental", "medium-water-elemental"),
        ("Giant Scorpion", "giant-scorpion"),
        ("Giant Stag Beetle", "giant-stag-beetle"),
        ("Giant Wasp", "giant-wasp"), ("Griffon", "griffon"),
        ("Grizzly Bear", "grizzly-bear"), ("Lion", "lion"),
        ("Mephit", "mephit"), ("Owlbear", "owlbear"),
        ("Pteranodon", "pteranodon"), ("Rhinoceros", "rhinoceros"),
        ("Satyr", "satyr"), ("Tiger", "tiger"),
    ],
    5: [
        ("Ankylosaurus", "ankylosaurus"), ("Cyclops", "cyclops"),
        ("Dire Lion", "dire-lion-spotted-lion"),
        ("Large Air Elemental", "large-air-elemental"),
        ("Large Earth Elemental", "large-earth-elemental"),
        ("Large Fire Elemental", "large-fire-elemental"),
        ("Large Water Elemental", "large-water-elemental"),
        ("Ettin", "ettin"), ("Giant Moray Eel", "giant-moray-eel"),
        ("Girallon", "girallon"), ("Manticore", "manticore"),
        ("Orca", "orca"), ("Woolly Rhinoceros", "woolly-rhinoceros"),
    ],
    6: [
        ("Bulette", "bulette"), ("Dire Bear", "dire-bear-cave-bear"),
        ("Dire Tiger", "dire-tiger-smilodon"),
        ("Elasmosaurus", "elasmosaurus"),
        ("Huge Air Elemental", "huge-air-elemental"),
        ("Huge Earth Elemental", "huge-earth-elemental"),
        ("Huge Fire Elemental", "huge-fire-elemental"),
        ("Huge Water Elemental", "huge-water-elemental"),
        ("Elephant", "elephant"),
        ("Giant Octopus", "giant-octopus"),
        ("Hill Giant", "hill-giant"),
        ("Stegosaurus", "stegosaurus"),
        ("Stone Giant", "stone-giant"),
        ("Triceratops", "triceratops"),
    ],
}


def find_srd_file(slug: str) -> Path | None:
    """Find a creature file in the SRD bestiary by slug."""
    # Try exact match first
    for subdir in SRD_DIR.iterdir():
        if not subdir.is_dir():
            continue
        candidate = subdir / f"{slug}.md"
        if candidate.exists():
            return candidate
    # Try without suffix variations
    base = slug.split("-")[0]
    for subdir in SRD_DIR.iterdir():
        if not subdir.is_dir():
            continue
        for f in subdir.iterdir():
            if f.stem.startswith(slug[:8]) and f.suffix == ".md":
                return f
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
        # Format: [21, 17, 15, 2, 12, 6]
        nums = re.findall(r'\d+', stats_line)
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

        for display_name, slug in creatures:
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
            card = build_combat_card(data)
            aug = compute_augmented(data)

            creature_entry = {
                "name": display_name,
                "pfsrd_url": data["pfsrd_url"],
                "type": data["type"],
                "size": data["size"],
                "cr": data["cr"],
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
                    "Melee": aug.get("Melee", card["Melee"]),
                    "CMB": aug["CMB"],
                    "CMD": aug["CMD"],
                    "Str": aug["Str"],
                    "Con": aug["Con"],
                },
            }

            level_data["creatures"].append(creature_entry)
            print(f"  OK: {display_name} (AC {data['ac']}, HP {data['hp']}, Str {data.get('str','?')})")

        all_output[sna_level] = level_data

    # Write output files
    for group_name, levels in [("1-3", [1,2,3]), ("4-6", [4,5,6])]:
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
