# Pathfinder App — Design Language Decisions

> Living document. Updated as decisions are made.
> Last updated: 2026-03-23

---

## Scope & Priority

1. **Now (SNA Combat Manager):** Twilight Stone only, applied globally. Single-file app, fully offline.
2. **Soon (maybe):** Surface variants as functional differentiation (summon cards vs spell cards, group identity). Not user-chosen — automatic based on entity type.
3. **Later (full app):** User-selectable themes via theme switcher.

---

## Surface & Depth

**Base theme: Twilight Stone**
- Shell: `#3a3530`
- Inner gradient: `#403a32` → `#36302a`
- Neumorphic depth model:
  - **Layer 1 — Outer shell:** raised plateau (light catch upper-left, deep shadow lower-right)
  - **Layer 2 — Inner card:** recessed/concave (inset shadows)
  - **Layer 3 — Troughs:** HP bar, stat wells, form inputs (inset, darkest functional)
  - **Layer 4 — Inlaid windows:** special abilities, deepest fill (`#282320`), strong inset shadow
  - Physical metaphor: background → raised slab → carved-in content → inlaid detail
- **Implementation:** CSS-only depth on existing HTML elements. No structural changes needed — `box-shadow` (normal + inset) on existing `.ccard`, `.hpbar`, `.ability-section`, inputs, etc.
- Subtle fractal noise texture at very low opacity for mineral grain — **small PNG as data-uri** (128×128 or 256×256), applied via `background-image`. No SVG filters.
- Top-edge highlight suggests beveled stone
- **Dock/card-grid separation:** deferred until base theme is in place, then explored.

**Surface variants** (for creature type / summon source differentiation):
- **Sunbaked Sand** — warmer, golden, fine-grit noise, hotter top highlight
- **Fertile Soil** — cool-green tint, softest neumorphism, muted/grounded
- **Ember & Ash** — near-black warm red undertone, bottom-edge ember glow
- **Verdant Oasis** — deep green-black, upper-left radial (dappled canopy light)

These shift the analogous range slice while maintaining the same depth model. Kept as reference for future variant work.

**First variant use case:** Spell cards get a subtle surface tint shift from Twilight Stone (e.g. Ember & Ash or similar) to visually distinguish them from creature cards while staying in the warm analogous range. Exact tint TBD during implementation.

**Theme switcher** planned for full app theming (user preference, not per-card). Not in scope for SNA Combat Manager.

---

## Typography

**Headings / Creature names:** Vollkorn (regular case, not small caps)
- Sturdy humanist serif, warm on the twilight stone surface
- More compact than Cormorant/Alegreya at same size — handles long names (Medium Water Elemental)
- Also used for: section labels, CTA/primary button text

**Display / backup:** Cormorant (higher contrast Garamond lineage)
- Reserved for splash screens, character sheet headers, detail views where there's room to breathe

**Body / labels:** Alegreya Sans (humanist sans, warm, calligraphic rhythm)
- Attack names, stat labels, badge text, speed lines, footer, metadata
- Secondary button text, tray labels
- `font-feature-settings: 'smcp'` where supported (nice-to-have, not a dependency)

**Attack table numbers:** Vollkorn with `font-feature-settings: 'tnum' 1`
- Tabular figures for column alignment without monospace
- Gives numbers more weight/presence than Alegreya Sans — reads as "data with gravity"

**Monospace exception:** Retained for form inputs and dropdown lists only (data-entry contexts where column alignment matters). Not used on cards, labels, or any visible UI surface. The coding aesthetic doesn't fit the stone surface.

**Font delivery:** All fonts self-hosted as base64 data-uri in the `<style>` block. No CDN dependency — the app must work fully offline (double-click to open, email to share).
> **Future options:** If file size becomes a concern, fonts could move to a `fonts/` directory (breaks single-file) or back to Google Fonts CDN (requires internet). Data-uri is the right default for a portable single-file tool.

**`tnum` verification:** Vollkorn tabular figures must be tested at 12-14px in the attack table. If column alignment breaks, fall back to monospace for roll table numbers only.

**Separator:** Space / slash / space (`14 / 19`, `CRIT / 24`, `4 / 8`). No styled spans, no special characters.

---

## Color System

### Philosophy
Analogous range: **verdant green → gold/amber → ember/fire**
All UI colors stay within this warm spectrum. No cool blues, no saturated neon. The palette should feel like it belongs on the stone surface.

### Text Hierarchy (4-tier)
| Tier | Hex | Contrast | Use |
|------|-----|----------|-----|
| Primary | `#ede0c4` | ~8.5:1 | Creature names, HP numbers, stat values, key data |
| Body | `#c0ae8e` | ~5.2:1 AA ✓ | Attack names, special ability text, descriptions |
| Label | `#a09078` | ~3.6:1 AA large ✓ | Section headers, stat labels (AC, Init, CMD) |
| Muted | `#8a7e68` | ~2.8:1 | Tertiary info: card IDs, speed lines, "5 attacks · 4 hits" |

### HP State Ramp (exclusive — no other UI element shares these)
| State | Color Zone | Notes |
|-------|-----------|-------|
| Healthy (>50%) | Olive-green (`#6b7a3a` → `#8a9a4a`) | Muted sage, not neon |
| Bloodied (25-50%) | Gold/amber | Warning without alarm |
| Critical (<25%) | Warm red-brown | Pulsing animation at critical |

### Attack Table States

**No AC mode** (flat presentation, user interprets):
| State | Treatment | Color |
|-------|-----------|-------|
| Normal roll | Default warm text | `#d4c4a0` |
| Nat 20 threat (CRIT / ##) | Warm gold shift | `#d4a040` |
| Nat 1 (MISS / ##) | Cool muted | `#8a6a5a` |
| Damage on threat | Shown as single / double (4 / 8) | |
| Damage on nat 1 | Dashed out | |

**AC mode** (resolved outcomes):
| State | Treatment | Color |
|-------|-----------|-------|
| Hit | Soft olive-green | `#c8d8a0` |
| Miss | **Muted** (not red!) | `#7a7060`, damage faded |
| Confirmed crit | Gold + subtle glow animation | `#ecc868` |
| Unconfirmed crit | Hit color + CRIT tag | `#c8d8a0` + `#d4a040` tag |
| Fumble | Warm red-brown | `#b86848` |
| Nat 1 safe (no fumble) | Muted like miss + tag | `#7a7060` |

Key insight: **misses are muted, not red.** They're irrelevant noise — your eye should land on hits and crits, not misses.

### Toggle System
**One warm ramp, differentiated by intensity — not per-toggle hues.** Categories reflect mechanical nature (what kind of thing is this?), not duration (how long it lasts). Lifecycle (one-shot auto-off, persistent) is handled in code logic, not visual language.

| Group | Meaning | Toggles | Off State | On State |
|-------|---------|---------|-----------|----------|
| Situational | Positional/environmental — "what's true on the board" | Flank, Earth Mastery, Water Mastery | Muted outline (shared) | Quietest — subtle fill shift |
| State | Creature is in a different mode — changes available actions | Grapple | Muted outline (shared) | Medium intensity, bold weight |
| Decision | Pre-attack commitment — "what am I choosing this action" | Pounce, Powerful Charge, Power Attack, Lunge | Muted outline (shared) | Brightest — gold with slight outer glow |

Off state is identical across all three groups.

### Special Ability Pips
Distinct **shapes** + desaturated warm colors. Two channels of differentiation (shape survives without color).

**Implementation:** JS emits semantic markup (`<span class="pip pip-grab"></span>`), CSS handles shape and color via `clip-path: polygon()`. All visual decisions live in the stylesheet.

| Pip | Shape | Color | `clip-path` |
|-----|-------|-------|-------------|
| Grab | Half-circle | `#a89060` (amber-tan) | `polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)` |
| Poison | Triangle | `#7a8a50` (sage-olive) | `polygon(50% 0%, 100% 100%, 0% 100%)` |
| Trip | Diamond | `#b08848` (warm amber) | `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` |
| Burn | Star | `#a86040` (warm red-brown) | `polygon(50% 5%, 65% 35%, 98% 40%, 73% 63%, 80% 95%, 50% 78%, 20% 95%, 27% 63%, 2% 40%, 35% 35%)` |
| Disease | Square | `#908040` (olive) | none (default shape) |
| Stun | Hexagon | `#c0b898` (lightest warm) | `polygon(50% 0%, 87% 25%, 87% 75%, 50% 100%, 13% 75%, 13% 25%)` |

Color distinction can be ramped up via saturation, shading, or glow if needed — shapes provide baseline accessibility.

### Color Budget Goal
Reduce from ~62 unique hex values in current code to a structured token system. Eventual two-layer setup: **primitives** (the actual hex values) and **semantics** (what they mean in context).

---

## Icons

**Primary set:** Game-icons.net (CC BY 3.0, monochrome silhouettes)

| Icon | Game-icons name | Use |
|------|----------------|-----|
| Attack column | `rolling-dices` | Table header for attack rolls |
| Damage column | `pointy-sword` | Table header for damage |
| AC | `chest-armor` | Armor class label |
| HP | `heart-plus` | Hit points label |
| Rounds / countdown | `cycle` (arrows) | Round counter in dock, duration on cards |
| Sum / tally column | `tally-mark-5` | Table header for running total |

**Shaped pips** for special abilities (see Pips table above) — CSS `clip-path` shapes, not SVG or game-icons.

**Fallback rule:** If any icon doesn't read at combat sizes (10-12px on 280px cards), degrade to text. Icons are an enhancement, not a dependency.

---

## Grid, Spacing & Breakpoints

### Card Sizing
Cards are **fixed-width at 280px**. They are physical objects on the stone surface, not fluid containers. Card internals (attack tables, toggle rows, HP bars) are designed for a known width.

Grid uses `repeat(auto-fill, 280px)` with `justify-content: center`. Cards are centered in the viewport, not left-aligned — dead space distributes evenly as "table surface."

### Spacing System
Base unit: **4px**. Six-step scale as CSS variables:

```css
--sp-1: 4px;   /* tightest: within components (pip gaps, inline spacing) */
--sp-2: 8px;   /* default: between related elements (toggle gap, chip gap) */
--sp-3: 12px;  /* card internal padding, section margins */
--sp-4: 16px;  /* grid gap between cards, major internal spacing */
--sp-5: 24px;  /* major section breaks */
--sp-6: 32px;  /* largest: page-level margins (rare) */
```

| Context | Variable | Current ad-hoc |
|---------|----------|---------------|
| Card padding | `--sp-3` (12px) | 10px-12px |
| Grid gap | `--sp-4` (16px) | 16px |
| Body padding | `--sp-2` (8px) | 8px |
| Toggle/chip gap | `--sp-2` (8px) | 3-6px varies |
| Section margin inside card | `--sp-3` (12px) | 4-8px varies |
| Between rows in attack table | `--sp-1` (4px) | 2px padding |

Everything maps onto the scale. To adjust density globally, shift which variable a context uses (e.g. card padding from `--sp-3` to `--sp-4`) — all internals follow.

### Target Viewports

| Device | Width | Cards | Primary use |
|--------|-------|-------|-------------|
| iPad Mini portrait | 768px | 2 | Common at table |
| MacBook Pro half-width | ~960px | 3 | Common at table |
| iPad Mini landscape | 1024px | 3 | Common at table |
| MacBook Pro full | ~1920px | 6 | Occasional |

### Breakpoints (simplified)

Two primary breakpoints, one safety net:

**≤480px (phone — safety net):**
- Single column, card stays 280px centered (not stretched to 100%)
- Body padding `--sp-2`
- Tighten touch targets slightly

**≤768px (iPad portrait / narrow windows):**
- 2-column layout
- Tighten body padding and card internals one step
- Touch-friendly targets (min 36px)

**>768px (default):**
- Auto-fill at 280px, standard spacing
- All spacing at default scale values

Cards never change width across breakpoints. Only spacing, padding, and touch target sizes adjust. The grid handles column count automatically.

---

## Rule Lines

**Four types, clear hierarchy:**

| Type | CSS | Use |
|------|-----|-----|
| Inset groove | `height:2px; background:#221e18; box-shadow:0 1px 0 rgba(255,235,200,0.06)` | Major section breaks (stats→attacks, attacks→footer) |
| Dotted | `border-top:1px dotted #544c40` | Between attack rows — more textural than solid at equal weight |
| Groove + ember | Groove with colored gradient center | Signature break — color-variable per context. Strongest divider. |
| Ember glow | `linear-gradient(90deg, transparent, rgba(200,140,50,0.5)..., transparent); box-shadow glow` | AC threshold line specifically |

**Available in library (optional):**
- Solid 1px (`#544c40`) — generic row separator
- Gradient fade — subtle section headers, works at card widths but fails across wide layouts
- Colored glow variants (red-brown for danger, green for positive)
- No double groove

**Groove + ember for dock/tray:** Potential use as the visual connector between dock slab and tray panel, carrying the tray's accent color. To be explored in dev.

---

## Components

### Inlaid Windows
- Fourth depth layer — `#282320`, strong inset shadow, same noise at lower opacity
- Single-line abilities: Vollkorn name only
- Multi-line abilities: Vollkorn name + Alegreya Sans detail text

### Button Hierarchy (3-tier, all mixed case)
| Tier | Font | Style | Use |
|------|------|-------|-----|
| Secondary | Alegreya Sans | Ghost outline, muted | Safe/reversible (Clear, Dismiss) |
| Primary | Vollkorn | Warm gold fill | Important actions (Re-Roll All, Import) |
| CTA | Vollkorn | Olive-green solid | Most consequential action (Next Round, Summon) |

Disabled state: same shape + color family, lower opacity. No new colors.

### Dock & Tray System

Notch shape is decided: **rounded keystone** — SVG path in `notch_shape_variations.html` (48px top → 28px bottom, rounded corners on all four points). Implement as part of the visual rework.

Target behavior (both phases):
- Dock is a **continuous stone slab** — no floating tabs
- **Rounded-keystone notches** cut into the top edge, revealing tray surface beneath *(Phase 2)*
  - Wider at top (dock edge), tapering inward toward bottom
  - Rounded corners on all four points
  - Sized for comfortable touch targets (iPad/tablet use)
- **Chevron** etched inside each tab/notch — points upward
  - Inactive: muted stone color (`#3a3228`)
  - Active: lights up to match tray's left accent bar color + subtle glow
- **Tray label** (Alegreya Sans, small caps where supported) sits below each notch on dock surface
- Clicking notch OR label toggles the tray
- **Tray panel** slides up from behind/below the dock
  - Same depth as inlaid windows (darkest level)
  - Strong top inset shadow — emerges from cavity underneath dock
  - Left accent bar carries tray identity color
- Round counter and AC target in **inset wells** on the dock
- **Summon gets no special treatment** — same visual language as all trays
- **Groove + ember** at dock/tray junction — potential unifier (to explore in dev)
- **Dock/card-grid visual separation** — explore after base theme lands

### Group Identity
Group differentiation uses the **groove + glow** rule line system on the card edge (top border), not floating pill badges. No text labels.

- Five warm color stops along the green → gold → ember ramp for creature groups
- Card top border gets a groove+glow treatment in the group's assigned color
- Group identity reads at a glance from scanning card edges — pattern matching, not reading labels
- The `.gpill` pill system and `.group-bar` summary bar are removed (summary bar was dead code)

### Dead Creatures
Dead cards stay visible (collapsed/dimmed) as a safety net against HP mistyping. Current rotated-sideways treatment is fine — restyle into the warm palette but keep the same interaction. Dismissed creatures are a deliberate action, dead is just a state.

### Buff/Augment Pills
- Inset shadow (matches toggle/well depth language)
- Active global buffs: warm border
- Local-only buffs (per-creature, not global): dashed border in green
- Inactive: fully muted
- Add button (+): circular, same depth treatment

### Shimmer / Animation System
Two shimmer variants, both using `background-clip: text` with a sweeping gradient. Same mechanism, different character.

**Glint** (generic — active specials, maintain text, any "this is live" indicator):
- Base color → narrow white/bright specular peak → base color
- Reads as light catching a stone edge. Subtle.
- `background: linear-gradient(90deg, currentColor, rgba(255,245,220,0.9) 50%, currentColor)`

**Crit shimmer** (confirmed critical hits only):
- Warm red-brown base → sharp white specular spike → red-brown
- Narrow white peak (48-52%) reads as impact/specular, not color change
- `background: linear-gradient(90deg, #a86040, #ffffff 48%, #ffffff 52%, #a86040)`
- Hotter, more violent version of the glint. Signifies "extra blood spilled."

Other animations (HP pulse at critical, tray slide) use the same warm palette but are standard CSS transitions, not the shimmer system.

### Stat Block Popover

Replaces the inline stat block expand. Creature name tap opens a centered popover over a dark scrim. Grid stays stable underneath — no layout shift.

**Trigger:** Creature name on card (`.ccard-name`). All other card interactions (toggles, HP tap, buffs, dismiss) unchanged.
**Dismiss:** Scrim click, × button, or Escape key.
**Sizing:** Max-width ~460-520px, internal scroll if needed. Must be usable on iPad without excessive scrolling.

**Structure (top to bottom):**

1. **Header** — creature name (Vollkorn 700 24px, primary color), tags row (N / Gargantuan / Animal as small pills: `background: #2a2620; border: 1px solid #4a4438; color: #a09078; font-size: 10px`), CR + XP right-aligned
2. **Groove+ember divider** — signature break between header and body
3. **Hero stats** — HP and AC in side-by-side inset wells (Layer 3 depth), Init/Senses/Perception cluster alongside as inline label+value
4. **Saves** — Fort/Ref/Will as three centered blocks (label: Alegreya Sans 10px muted, value: Vollkorn 600 15px primary)
5. **Section bands** — full-width dark strips for OFFENSE, STATISTICS, ECOLOGY. Extend to popover edges via negative margin. Vollkorn 600 11px label color, letter-spacing 0.12em. `background: linear-gradient(90deg, #2a2520, #322c26 30%, #322c26 70%, #2a2520); border-top: 1px solid #4a4438; border-bottom: 1px solid #1a1610`
6. **Offense** — Speed (bold-keyword-then-value), Space/Reach, melee attacks as rows (name + bonus + damage + pips right-aligned, dotted dividers between rows), special attacks in inlaid windows (Layer 4 depth)
7. **Statistics** — ability scores in 6-column grid of inset wells, BAB/CMB/CMD inline, Feats/Skills/SQ as bold-keyword-then-value
8. **Ecology** — Environment · Organization · Treasure, single flowing line with middle-dot separators
9. **Footer** — SRD link right-aligned ("View on d20pfsrd.com ↗")

**Surface treatment:** Twilight Stone, slightly warmer inner gradient than cards (`linear-gradient(165deg, #423c34, #38322c)`). Same noise texture. Heavier outer shadow: `box-shadow: -6px -6px 14px rgba(255,235,200,0.06), 6px 6px 24px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.4)`

**Typography:** Vollkorn 700 24px for creature name. Vollkorn 600 for section bands and stat numbers (`tnum`). Alegreya Sans for everything else (body, labels, metadata). Bold-keyword pattern: Alegreya Sans 700 primary for keyword, 400 body for value.

**Reference mockup:** `popover_in_context_v2.html` — visual guideline, not canon. Open in browser to view.

**Data source:** `B[name].data` — same bestiary JSON the combat cards use, just displaying more fields.

**Implementation notes:**
- Section band negative margins (`margin: 10px -20px; padding: 3px 20px`) depend on popover padding. Use a CSS variable for the padding to keep in sync.
- Scrim must prevent background scroll (touch and wheel).
- Numpad popup and stat popover should not overlap — close numpad if stat popover opens.

---

## Distribution / Portability

The app is a single HTML file with all CSS, JS, and fonts (data-uri) inlined. No build step, no server, no network dependency.

- **Local use:** double-click `index.html` or serve via `python3 -m http.server 8787`
- **Sharing:** email the file, recipient double-clicks to open
- **Caveat:** `localStorage` persistence is quirky on `file://` origins — some browsers isolate per-file, others share. App is fully functional without persistence; state just won't survive a page close for the recipient. Running the python server fixes this.

---

## Open Questions (for dev/testing)

- [ ] Full color token map (primitives + semantics)
- [ ] Surface variant ↔ creature type mapping
- [ ] Spell card surface variant — exact tint TBD
- [ ] Theme switcher ↔ surface variant interaction (full app scope)
- [ ] Component spacing and grid system (needs real content at real widths)
- [ ] Dock notch touch testing on iPad (shape decided, verify tap targets)
- [ ] Dock/card-grid visual separation
- [ ] Pip color distinguishability verification (needs real screen testing)
- [ ] Icon readability at final sizes (game-icons → text fallback decisions)
- [ ] Vollkorn `tnum` at 12-14px in attack table columns
- [ ] Group edge-glow: exact warm color stops for 5 groups

---

## Rework Plan

Each phase produces a fully working app. No half-finished visual states — every phase is "done" before the next starts. Complete mechanics work in the other session first; this rework comes after.

### Phase 1 — Foundation (tokens + fonts + noise)
The invisible infrastructure that everything else builds on.

- [ ] Define `:root` CSS variables: spacing scale (`--sp-1` through `--sp-6`), text hierarchy (primary/body/label/muted), surface colors (shell/card/trough/inlaid), HP ramp, attack states
- [ ] Generate noise texture PNG, embed as data-uri
- [ ] Download Vollkorn + Alegreya Sans woff2, embed as `@font-face` data-uri
- [ ] Swap Google Fonts `<link>` for embedded `@font-face`
- [ ] Replace `font-family` declarations: Cinzel → Vollkorn, monospace → Alegreya Sans (except form inputs)
- [ ] Set `font-feature-settings: 'tnum' 1` on roll table numbers, verify column alignment
- [ ] Apply spacing variables to body padding, grid gap, card padding (mechanical swap, don't redesign layout yet)

**Test:** app looks different (warm fonts, warm text colors) but everything works identically. No layout shifts.

### Phase 2 — Surface & Depth
The stone comes alive.

- [ ] Swap base palette: cool blue-gray → Twilight Stone (shell, card, trough, inlaid window backgrounds)
- [ ] Apply noise texture to body and card backgrounds
- [ ] Neumorphic shadows on cards (Layer 2: light catch upper-left, deep shadow lower-right)
- [ ] Inset shadows on troughs: HP bar, form inputs, dock wells
- [ ] Inlaid window treatment on `.ability-section` (Layer 4: darkest fill, strong inset)
- [ ] Top-edge highlight on cards (beveled stone feel)
- [ ] Update `.hpfill` colors to olive-green/gold-amber/warm red-brown ramp
- [ ] Update HP pulse animation to warm palette

**Test:** app feels like carved stone. All interactive elements still work. Colors are warm throughout.

### Phase 3 — Attack Table & Roll States
The core UX — where you spend 90% of combat time.

- [ ] Swap hit/miss/crit colors to design language values (olive-green hit, muted miss, gold crit, warm red-brown fumble)
- [ ] Update AC threshold line to ember glow rule line
- [ ] Replace dotted row separators with design language dotted rule
- [ ] Implement glint shimmer (replace green/gold shimmer on active specials + maintain)
- [ ] Implement crit shimmer (replace red shimmer on confirmed crits)
- [ ] Update running total column colors
- [ ] Update roll summary / total damage styling

**Test:** roll some creatures, toggle AC on/off, verify all states read correctly. Crits shimmer red-brown, active specials glint.

### Phase 4 — Toggles & Pips
Mechanical differentiation system.

- [ ] Unify all toggle off-states (single muted outline style)
- [ ] Implement three toggle intensity levels: situational (subtle fill), state (medium + bold), decision (gold + glow)
- [ ] Restyle buff chips to warm palette with inset shadows
- [ ] Replace circle pip SVGs in `IC` object with semantic `<span class="pip pip-*">` markup
- [ ] Add `clip-path` CSS for all six pip shapes
- [ ] Update legend colors to match new pip colors
- [ ] Restyle feat badges and tactical badges into warm palette

**Test:** summon creatures with grab/trip/poison, toggle flank/pounce/grapple/PA, verify visual distinction between toggle categories.

### Phase 5 — Dock & Trays
The command center.

- [ ] Restyle dock as continuous stone slab (background, noise, top-edge highlight)
- [ ] Replace flat tabs with rounded keystone notch SVGs
- [ ] Add chevron indicators (inactive: muted stone, active: tray accent color + glow)
- [ ] Restyle tray panels: inlaid window depth, strong top inset shadow, left accent bar
- [ ] Round counter and AC target as inset wells
- [ ] Apply groove + ember rule line at dock/tray junction
- [ ] Restyle buttons: 3-tier hierarchy (ghost secondary, warm gold primary, olive-green CTA)
- [ ] Tray labels in Alegreya Sans small-caps

**Test:** cycle through all trays, summon creatures, adjust AC, verify touch targets on iPad.

### Phase 6 — Cards & Groups
Card identity and differentiation.

- [ ] Remove `.gpill` pill system and `.group-bar` dead CSS
- [ ] Implement groove + glow top border for group identity (5 warm color stops)
- [ ] Restyle creature card: apply full depth model, rule line hierarchy, spacing system
- [ ] Restyle spell cards with surface variant tint
- [ ] Dead creature treatment: collapsed/dimmed in warm palette (keep rotated layout)
- [ ] Restyle dismissed tray entries
- [ ] Update numpad popup to warm palette + depth model
- [ ] Update buff-add popup to warm palette

**Test:** summon multiple groups, add spell cards, kill a creature, dismiss one. Visual hierarchy reads clearly.

### Phase 7 — Stat Block Popover
New component, built on the design language.

- [ ] Build popover HTML structure (scrim + centered panel + internal sections)
- [ ] Wire creature name tap → popover open, remove inline stat block expand
- [ ] Implement all sections: header, hero stats, saves, section bands, offense, statistics, ecology, footer
- [ ] Apply depth model: inset wells for stats, inlaid windows for special attacks, section bands with negative margins
- [ ] Groove + ember divider below header
- [ ] Scrim scroll prevention (touch + wheel)
- [ ] Numpad/popover mutual exclusion
- [ ] iPad scroll testing (long stat blocks like Dire Crocodile)

**Test:** tap creature names across different creatures (small stat blocks, huge stat blocks), verify dismiss methods, verify no layout shift underneath.

### Phase 8 — Polish & Verification
Cross-cutting concerns.

- [ ] Audit all remaining hardcoded hex values → replace with CSS variables
- [ ] Verify breakpoints: iPad Mini portrait/landscape, MacBook half/full
- [ ] Verify all dropdowns use consistent styling (some may still be OS-native `<select>`)
- [ ] Touch target audit on iPad (min 36px on all interactive elements)
- [ ] Pip color distinguishability check on real screen
- [ ] Icon readability check at final sizes
- [ ] Remove any dead CSS from pre-rework styles
- [ ] Dock/card-grid visual separation exploration

---

## Reference Influences

**Borrowed from print stat blocks:**
- Section header bands as hard visual breaks (PF1e/2e)
- Bold-keyword-then-value pattern for stat lines

**Deliberately avoided:**
- Cinzel (MtG/5e.tools association)
- Cream/tan parchment (classic D&D cliché — went dark inverse instead)
- Per-toggle rainbow colors (cognitive overload — unified warm ramp by intensity instead)
- Saturated neon for HP/hit/miss (breaks the warm surface)
- Red for misses (they should fade, not scream)
- All-caps button text
- Floating tabs on the dock (etched notches instead)
- Monospace fonts on the surface (exception: form inputs/dropdowns for alignment)
- Complex game-icons at column-header sizes (don't read at 10-12px — use text fallback)
- Group pill text badges (groove+glow card edge instead)
- CDN font loading (breaks offline/portable use)
- SVG noise filters (overengineered for low-opacity grain — PNG data-uri instead)
- Multiple shimmer color variants (two variants only: glint + crit)
