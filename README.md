# BDI PrimeVue Prototype

Mobile-first prototype of the Budget Direct Insurance car insurance quote flow, built with Vue 3 + Vite + PrimeVue v4 (Aura preset, BDI red token override).

## Source of truth

Figma file `M0iwRMwawqrDrMHl61p6je` (One Motor Design System). Page mapping lives in Notion: "User Story by Page" database. Steps 1–11 cover the full quote journey, OMP-87 through OMP-362.

Designs are pulled via the official Figma MCP API (`get_design_context`), not screenshots. Visuals and tokens flow directly from the design system.

## Local dev

```bash
npm install
npm run dev
```

Open the dev URL on a mobile viewport (375px) for the intended experience.

## Build

```bash
npm run build
```

## Deploy

Hosted on Vercel. `vercel.json` rewrites all paths to `/` so the SPA router can take over.

## Folder layout

```
src/
  components/
    AppHeader.vue
    AppFooter.vue
    StepIndicator.vue
    StickyNext.vue
  views/
    Step01CoverType.vue           # OMP-87
    Step02CoverStartDate.vue      # OMP-88
    Step03YearMakeModel.vue       # OMP-89
    Step04CarUsage.vue            # OMP-90
    Step05AnnualDistance.vue      # OMP-91
    Step06MainDriver.vue          # OMP-92
    Step07DrivingHistory.vue      # OMP-93
    Step08PolicyholderContact.vue # OMP-94
    Step09YourQuote.vue           # OMP-305
    Step10AdditionalDrivers.vue   # OMP-361
    Step11OptionalBenefits.vue    # OMP-362
  store/quote.js
  router/index.js
  style.css
  main.js
```

## Design tokens

| Token | Value | Use |
|---|---|---|
| `--bdi-red` | `#DA291C` | Primary CTA |
| `--bdi-carbon` | `#333F48` | Primary text |
| `--bdi-green` | `#009A44` | Selected state, active progress |
| `--bdi-cyan` | `#008EAA` | Links |
| `--bdi-grey-100` | `#F5F5F5` | Chip background |
| `--bdi-grey-200` | `#E4E4E4` | Borders |
| `--bdi-grey-300` | `#DADADA` | Input borders, inactive progress |
| `--bdi-grey-500` | `#999999` | Subtle borders |
| `--bdi-grey-600` | `#858585` | Secondary text |
| `--bdi-bg` | `#F7F7F7` | Page background |

Font: Nunito Sans (Google Fonts) as a stand-in for the licensed Museo Sans used in Figma.
