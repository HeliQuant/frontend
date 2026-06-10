# HeliQuant — Design System & Screen Specs ("THE NIGHT GARAGE")

> The HeliQuant instantiation of the universal *Representational UI Doctrine*
> (`C:\Users\hansg\FE-Universal-Guide\FE-UNIVERSAL-GUIDE.md`). The doctrine is the method;
> this file is the chosen knobs + per-screen briefs. Deliberately the **inverse of Aval**:
> Aval = light-mode "Liquid Capital" brutalism → HeliQuant = **dark-mode automotive
> brutalism**. Same method, opposite surface, different metaphor family (engine, not liquid).

---

## 1. Product in one line

An autonomous multi-desk AI trading firm that **validates edges before risking capital**:
desks ingest market telemetry, debate, a PM decides (ENTER only on a validated edge —
otherwise ABSTAIN), every decision sealed on-chain on Mantle. The discipline IS the product:
it publishes what doesn't work, crash-tests its own winners, and retires decayed edges.

## 2. Chosen aesthetic — "NIGHT GARAGE" (Brutalist / Automotive, dark)

A race-engineering workshop at night. Pitch-black shop floor, carbon panels, one electric
chartreuse livery accent (the brand's), bone ink for text/borders, hazard-stripe seams,
racing-sticker badges with hard offset shadows. The firm is presented as **an engine**:
desks are intake, debate is compression, the PM decision is the spark, the on-chain seal is
the exhaust. ABSTAIN = the gearbox holding **N** (neutral) — restraint made physical.

**Why automotive fits (not decoration):** the logo IS a 6-blade rotor/turbine; a trading
firm's loop IS a 4-stroke cycle; edge validation IS a dyno run; rejecting a fake backtest IS
a crash test; the on-chain ledger IS the black box. Every metaphor maps to a real process.

## 3. Design tokens

### Color (solid blocks; gradients only as faint atmosphere/vignette)
| Token | Hex | Use |
|---|---|---|
| `pitch` | `#0B0B0B` | page base — the night shop floor |
| `carbon` | `#161614` | panel surface |
| `carbon2` | `#1E1E1B` | raised panel / inset |
| `bone` | `#F2EFE6` | INK on dark: text, 2px borders, plates |
| `chartreuse` | `#C9F24B` | THE accent — livery, spark, validated, CTA |
| `steel` | `#8B8B80` | muted text / secondary labels |
| `signal` | `#FF5A1F` | rare alert: risk, rejected, crash, loss only |

Status semantics: chartreuse = validated/live/spark · signal = rejected/risk/crash ·
bone = structure/neutral · steel = muted. **N (neutral gear) is bone, never red** —
abstain is discipline, not danger.

### Type triad (next/font)
- **Saira Extra Condensed** (`--font-display`) — GIANT condensed motorsport display.
  Headlines, gear letters, hero values. (Racing-livery native; NOT Aval's Anton.)
- **Saira** (`--font-sans`) — body / reading.
- **IBM Plex Mono** (`--font-mono`) — ALL figures, telemetry, addresses, axis labels.

### Depth & motif
- 2px `bone` borders; hard offset shadows `6px 6px 0 #C9F24B` (key objects) /
  `4px 4px 0 rgba(242,239,230,.9)` (plates). Chunky press-down buttons.
- **Hazard stripe** (45° chartreuse/pitch) as section seams — the signature motif.
- Carbon dot-grid texture on panels; tachometer arcs; brand marks as **stickers on bone
  plates** (the black+chartreuse logos read on dark only when mounted on a plate — like
  racing stickers on a toolbox).
- Pit-wall **marquee ticker** as the secondary signature band.

## 4. Motion system

| Intent | Keyframes |
|---|---|
| Entrance | `slamIn` (headline slam), `riseIn` (staggered panels), `needleSweep` (tach needle sweeps to value) |
| Continuous | `rotorSpin` (turbine idle, slow), `needleBreathe` (±1.5° jitter), `marquee` (pit wall), `sparkPulse`, `stripeScroll` (hazard seam), `blink` (telemetry cursor) |
| Flow | `pistonLoop` (4-stroke cylinders), `exhaustPuff` (seal → chain), `lapFeed` (black-box rows) |
| Interaction | hover lift + shadow collapse press, gear snap (N→1 on validated), FLIP drill-ins |

Physics easings (overshoot+settle), stagger 40–80ms, transform/opacity only,
one transform-owner per element. No blanket reduced-motion killer.

## 5. Asset inventory (`public/brand/`)

- `logo.png` — full mark (rotor ring + chartreuse eagle core), transparent. Hero / OG.
- `sixblade.png` / `sixblade-chartreuse.png` / `sixblade-bone.png` — rotor mark; the
  chartreuse variant is the spinning turbine on dark; bone = subtle watermarks.
- `eagle1.png`, `eagle2.png` — falcon heads (eagle2 has candlesticks) for sticker plates.
- `logo-bone-ink.png` — full mark with bone ink (dark-bg legible variant).
- Treatment rule: on dark, either use a recolored variant OR mount the original on a
  `bone` plate with a hard shadow (sticker). Never place the black original raw on pitch.

## 6. Landing IA + per-section briefs (each its own metaphor)

### 6.1 HERO — "THE ENGINE BAY"
```
PROCESS:     the firm idling at readiness; regime read; disciplined neutral
CORE OBJECT: a giant TACHOMETER (arc) + the rotor-turbine (brand) at its hub + a GEAR INDICATOR
RELATIONSHIP:needle position = regime-classifier confidence; gear N = abstain / 1 = ENTER
METAPHOR:    night-garage instrument cluster
ENCODING:    needle angle = 82.6% (regime OOS acc), redline zone = forced-trade territory we refuse
CONTINUOUS:  rotor idle-spins; needle breathes; pit-wall ticker marquees (real stats)
MICRO-BEAT:  on load — needle sweeps from 0 to 82.6% with overshoot; headline slams
TRANSITION:  scroll → hazard seam into the engine cycle
ASSETS:      sixblade-chartreuse (turbine), logo on bone plate (nav)
COPY:        "MOST BOTS REDLINE. OURS HOLDS GEAR." + one line: edge-validated or neutral
```

### 6.2 THE ENGINE CYCLE — the org loop (4-stroke)
```
PROCESS:     one decision cycle: desks ingest → debate → PM decision → on-chain seal
CORE OBJECT: four CYLINDERS firing in sequence (INTAKE/COMPRESSION/COMBUSTION/EXHAUST)
RELATIONSHIP:market telemetry → stances → spark or no-spark → sealed record
METAPHOR:    engine cutaway / ECU diagnostic screen
ENCODING:    cylinder stage lights as the loop advances; COMBUSTION sparks chartreuse on
             ENTER, stays dark with gear N on ABSTAIN (the honest default today)
CONTINUOUS:  piston loop cycles; stage label ticks; live desk list scrolls
MICRO-BEAT:  the no-spark beat — combustion chamber stays dark, gear indicator stamps N
ASSETS:      desk names as engraved plates; real decision feed (latest: MNT ABSTAIN)
COPY:        "INTAKE · COMPRESSION · COMBUSTION · EXHAUST" + desk roster
```

### 6.3 THE DYNO ROOM — edge lab
```
PROCESS:     every strategy must pass the dynamometer before touching capital
CORE OBJECT: a TORQUE CURVE on the dyno screen (the once-validated OI edge, +28.9% OOS)
RELATIONSHIP:24 hypotheses in → 1 validated → later DECAYED → honestly retired
METAPHOR:    dyno test cell; scrapped engines shelf for the 23 rejects
ENCODING:    curve = real equity path; counters: 24 tested / 23 rejected / 1 validated→retired
CONTINUOUS:  dyno trace draws + redraws; rejects shelf flickers their failure reason
MICRO-BEAT:  "DECAYED — RETIRED BY THE LAB" stamp slams onto the curve (honesty flex)
COPY:        "THE DYNO DOESN'T LIE. 24 IN. 23 SCRAPPED. THE ONE THAT PASSED? RETIRED WHEN IT DECAYED."
```

### 6.4 THE CRASH TEST — the rejected +96%
```
PROCESS:     we crash-test our own winners; +96% OOS / 95.6% win died on the slippage wall
CORE OBJECT: the +96.0% figure driven into a WALL labeled "mETH SLIPPAGE −73 bps"
METAPHOR:    crash-test lab (signal-orange, the only section allowed to bleed signal color)
ENCODING:    before-wall = paper equity; after-wall = REJECTED stamp + −73 bps debris
MICRO-BEAT:  impact: the figure crumples, REJECTED stamp pops with shake
COPY:        "WE CRASH-TEST OUR OWN WINNERS." + the one-line story
```

### 6.5 THE BLACK BOX — on-chain ledger
```
PROCESS:     every decision (incl. ABSTAIN) sealed on Mantle — tamper-proof flight recorder
CORE OBJECT: lap-telemetry rows + the anchor plaque (tx 0xa052ee03…de69b53 · block 39402623)
METAPHOR:    flight recorder / pit-wall lap board
ENCODING:    rows = real decisions feed (Supabase); chartreuse dot = sealed on-chain
CONTINUOUS:  rows tick in; cursor blinks
MICRO-BEAT:  row arrives → seal dot stamps
COPY:        "THE BLACK BOX SURVIVES THE CRASH. OURS IS PUBLIC."
```

### 6.6 THE GARAGE — the stack
```
PROCESS:     the machinery that runs 24/7 (cloud org, edge lab, executor, contracts, relayer)
CORE OBJECT: a PARTS WALL — each subsystem an engraved part tag hanging on the board
METAPHOR:    tool wall / parts inventory
ENCODING:    tag size = subsystem weight; chartreuse edge = live now (Railway cloud)
COPY:        part numbers as repo names; "RUNS WHILE YOU SLEEP" line
```

Footer: license-plate plaque "HELIQUANT · MANTLE TURING TEST 2026" on a hazard seam.

### 6.7 /whales — "THE TIMING TOWER" (F1 pit wall)
```
PROCESS:     tracking other drivers on the track (smart-money wallets on Mantle DEX)
CORE OBJECT: an F1 TIMING TOWER — each whale = a driver row in the standings
RELATIONSHIP:ranked by composite rank_score; gap-to-leader = score delta
METAPHOR:    vertical timing tower + per-row telemetry (research: F1 TCDS/pit-wall patterns —
             position, gap, tire-compound chips, purple fastest)
ENCODING:    row position = rank; bar length = net DEX volume; chip color = bias
             (accumulating=chartreuse / distributing=signal / neutral=bone); buys|sells =
             sector counts; "last pit stop" = last_seen
CONTINUOUS:  leader row spark; tower rows stagger in
HONESTY:     plate states what this IS: pit-wall CONTEXT, not alpha (these are DEX churners;
             the live firm tracks Hyperliquid top-PnL whales per-asset in the cloud)
COPY:        terse mono; no cards — rows encode data in geometry
```

### 6.8 /assets — "THE DYNO BAYS" (test cells per asset)
```
PROCESS:     per-asset character read + edge history — what the lab measured per machine
CORE OBJECT: each asset = an ENGINE ON A TEST STAND (a dyno bay), gauges + verdict plate
METAPHOR:    a row of garage test bays (NOT cards: each bay = gauges + stamped verdict)
ENCODING:    pattern gauge (return-autocorrelation: <0.05 = efficient -> "follow flow");
             carry line (live funding-carry read); verdict stamp (RETIRED / FEE-EATEN /
             REJECTED / PROBATION / NO VENUE)
HONESTY:     replaces the STALE page (MNT 69%/+1.36% in-sample — superseded). Every bay
             tells the current truth: all majors EFFICIENT, MNT edge decayed->retired, BTC
             fee-eaten (7 rounds), mETH thin-liquidity (the crash test), HYPE carry best in
             backtest but thin today, registry EMPTY -> firm in N.
```

### 6.9 /firms/heliquant — "THE HOMOLOGATION PAPERS" (racing license)
```
PROCESS:     the firm's verifiable identity + the rules it races under
CORE OBJECT: a stamped RACING LICENSE: chassis plate (ERC-8004 identity), scrutineering
             stamps (6 deployed contracts -> Mantlescan), crew roster (9 desks), license
             conditions (the gates), service history (real milestones)
METAPHOR:    homologation document as riveted metal plates — not cards, STAMPS
ENCODING:    every address real (lib/contracts CONTRACTS), every milestone real
HONESTY:     replaces the STALE firm page (V5 77.78%/+1.23% + fake strategy roster = the
             SCRUBBED metrics — must never reappear). License conditions ARE the honesty
             rules: validate-or-abstain, publish failures, seal every decision.
```

## 7. Honesty rules (non-negotiable, carried from the firm)

Every figure on the page is real and verified: 82.6% regime OOS · +28.9% OOS ledger (the
edge later decayed → page SAYS so) · +96.0%/95.6% REJECTED at −73 bps · tx
`0xa052ee03…de69b53` block `39402623` · registry currently EMPTY → the hero gear shows
**N**. No invented metrics, ever. The restraint is the brand.

## 8. Tech & conventions

Next.js 16 App Router + TS + Tailwind v4 (`@theme` tokens in `globals.css`) + `motion` for
imperative beats + CSS keyframes for continuous loops. Fonts via `next/font`. Verify:
`pnpm build`, serve with `pnpm exec next start -p <port>`, screenshot via `.qa/capture.mjs`.
Old "Antimetal/Observatory" tokens stay until app pages are migrated (additive tokens; no
breakage). App pages (`/app`, `/whales`, `/assets`, `/firms/heliquant`, `/jobs/new`) get the
garage language in the next pass — each with its OWN metaphor (cockpit, telemetry pit, parts
catalog…), per doctrine Law 3.
