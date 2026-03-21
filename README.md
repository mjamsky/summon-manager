# SNA Combat Manager

Zero-latency tabletop combat tool for Pathfinder 1e Summon Nature's Ally. Pre-rolls all attacks so results are ready before your turn.

## Quick Start

```bash
cd summon-manager
python3 -m http.server 8787
# Open http://localhost:8787
```

## What It Does

- **Sorted roll table** — Attacks listed highest-to-lowest. Set reference AC when learned, threshold line appears instantly. No re-rolling.
- **Pre-rolled everything** — Crit confirmation, fumble checks, grab CMB, maintain grapple, rake attacks all computed in advance.
- **Buff math** — PF1e stacking rules. Global toggles + per-creature overrides (e.g., one leopard not flanking).
- **Spell-slot-first flow** — Pick slot → tier (1x/1d3/1d4+1) → creature (sorted by community tier) → SUMMON.
- **Casting queue** — SNA appears as "CASTING..." during full-round cast. Pre-rolls ready before manifestation.
- **Poison/grab/specials** — Full descriptions below attack table. Green when triggered, gray when missed.

## Bestiary

125 creatures (107 core + 18 AP alternates) from authoritative Pathfinder SRD stat blocks. **Not** wild shape tables.

```bash
# Rebuild from SRD source files
python3 build_bestiary.py
```

Source: Obsidian vault SRD at `~/Documents/Obsidian/Serpent's Skull/Assets/SRD/fantasy-bestiary/`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entire app (single file, no dependencies) |
| `build_bestiary.py` | Regenerates bestiary JSON from SRD vault files |
| `creature-ratings.json` | RPGBot community tier ratings (S/A/B/C) for SNA 1-6 |
| `statblocks/*.json` | Creature data (base + augmented stats, special abilities) |
| `SNA-Rules-Reference.md` | Summoning rules, feat details, action economy |
| `SNA-Quick-Lookup.md` | Per-level creature tables with best picks |

## Rules Implemented

- **Pounce** → automatic rake (no grapple needed)
- **Grapple rake** → requires starting turn already grappling + maintain CMB check
- **Grab** → only on attacks listing "plus grab" (lion: bite only; tiger: all attacks)
- **Grab CMB** → +4 bonus to start and maintain
- **Crit** → confirmation roll pre-computed, respects per-attack multiplier (x2/x3)
- **Fumble** → house rule: nat 1 → reroll → miss on reroll = crit fail
- **Buff stacking** → same type takes highest (morale, sacred), untyped stacks

## Backlog

**Architecture (do first):**
- CSS/JS separation — move all inline styles (31 instances) out of JS template literals into semantic CSS classes. JS outputs classes + data attributes, CSS handles all presentation. Enables media queries, theming, animations, and much easier iteration.
- State persistence — localStorage save/restore so closing the tab doesn't lose active summons mid-combat
- Effect damage rendering inline (not `alert()` popup)
- Dead creatures: collapse to single line, click to expand, REVIVE button to restore with HP input (for retcons/corrections)

**Features:**
- Items sidebar (wand charges, figurine activation, overrideable CL)
- Claude chat panel for between-turn strategy
- SNA 7-9 community tier ratings
- Versatile Summoning templates (Aerial/Aqueous/Chthonic/Dark/Fiery)
- Wild shape form management
- Constrict auto-damage on maintained grapple

## Origin

Built to address the finding from turn-time-analysis that Fennik's turns *feel* long due to multi-creature resolution, not decision time. This tool eliminates resolution delay.

Previous iteration: `~/Documents/Pathfinder/Summon Natures Ally/` (Python, stress-tested, bugs identified and fixed in this JS version).
