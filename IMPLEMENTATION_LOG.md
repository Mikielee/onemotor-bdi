# BDI PrimeVue Prototype — Implementation Log

Reverse-chronological log of substantive changes made to the prototype. Each entry covers what changed, why, where the change lives, and the Figma node it came from so future work can pick up the thread.

---

## 2026-07-03 — Journey spec + catch-up entry for the June build-out (Steps 10.1–17)

### Journey spec introduced

New `journey-spec/` directory: one YAML contract per page (fields, validations,
prefill chains, conditions, exceptions, ACs), an open-decision registry
(`decisions.yaml`, OD-1..OD-9), and a KB id registry (`kb-registry.md`). This is
now the traceability layer between the Notion KB, Figma, and this codebase.
Rule going forward: **any change to fields/validations/routing in a view updates
its spec file in the same commit.** See `journey-spec/README.md`.

Alongside: Figma canvas refs added to the headers of Steps 1–8 (pulled from the
Notion story rows) and Step 14 (confirmed no Figma frame); KB ids in comments
canonicalized (`KB #7` → `KB-7`, `KB f1898394` → `KB-f1898394`); Step 10.1's
router meta placeholder `OMP-NEW` resolved to the real story **OMP-992**.

### Catch-up: what shipped between 2026-06-02 and 2026-07-03 (previously unlogged)

- **Step 9 — Your Quote (OMP-305)**: hero card with Single/Instalment toggle,
  excess picker with premium deltas, promo code (TEST → $50 eCapitavoucher),
  coverage table, save-and-email quote (3 states), inline expandable sticky bar.
  Premium framing per KB-11 (never "per year"). Figma 4189-8932 + 4148-3290.
- **Step 10.1 — Main Driver Confirmation (OMP-992, NEW page)**: captures main
  driver Full name + NRIC (the KB-1 gap), re-presents Step 6/7 answers as
  editable confirmations. Sits between Step 9 and Step 10; Buy now routes here.
  Figma 5269-3520.
- **Step 12 — Policyholder Details (OMP-651)**: full prefill chain when main
  driver = policyholder (name/NRIC/DOB/gender + contact + NCD); postal-code
  address autofill (block/street/building, unit manual). Postal code moved here
  from Step 8. Figma 4962-3081 / 5281:1683.
- **Step 13 — Vehicle Details (OMP-652)**: make/model/year prefilled from Step 3
  (root store single source of truth), VRM XOR chassis, optional current insurer,
  financing branch with TPO/TPFT warning. No odometer per KB-7. Figma 2131-1607.
- **Step 14 — Policy Summary (OMP-653)**: review cards showing all mandatory
  captured info (masked NRIC), three disclosure gates before the Payment CTA.
  No Figma frame — designed in-prototype from the DA-side layout.
- **Step 15 — Payment (OMP-654)**: Single (card/PayNow) vs Instalment (card +
  bank pick). Figma 5089-3139.
- **Step 16 — PayNow QR (OMP-655)** + **Step 17 — Confirmation (OMP-656)** +
  mock `/payment/gateway`. Step 17 designed in-prototype (Figma frame empty).
- **Sticky bar (BdiQuoteFooter + Step 9 inline)**: circular 40px notch per Figma
  5269-3520, individual benefit rows + promo row in the breakdown, and the
  three-piece viewport-bottom docking fix (flex-fill `.step`, grow spacer,
  `position: sticky`).
- **Demo autofill**: header "Car Insurance" chip fills the current page with a
  consistent valid persona on every step (see `useDemoAutofill.js`).
- **Docs**: `ARCHITECT.md` added (presenter-ready architecture walkthrough).

---

## 2026-06-02 — Vercel review pass: global validation, date field, design-system corrections, money formatting

Reviewer feedback against the live Vercel build (`onemotor-bdi-primevue.vercel.app`) drove a sweep of cross-cutting fixes. Each section below tracks one user-raised comment from the review and the global treatment it received.

### 1. Global error-state pattern (Figma node `4691-2`)

**Comment:** "Forgot error stages — when users haven't selected anything, some fields left empty, some fields invalidated, but click on grey next button, users should be auto-scrolled to the most top field with error state."

**What shipped (applies to every step):**
- New `useValidation` composable (`src/composables/useValidation.js`) exposing `showErrors`, `reveal()`, and `scrollToFirstError()`. Fields mark themselves with `data-error="true"` while invalid; `reveal()` flips `showErrors`, then smooth-scrolls + focuses the top-most such element in DOM order.
- New `FieldError.vue` component for the standard red caption (14px Museo Sans, Primary/Red `#DA291C` — values lifted straight from Figma node `4691-2`).
- `StickyNext.vue` rewritten: the Next button is no longer hard-disabled. It looks grey, but a click in the invalid state now emits `blocked` instead of silently doing nothing. New `.is-blocked` class added in `style.css` (grey background, `cursor: pointer`). Because the element is not `:disabled`, PrimeVue's primary hover-border and focus-ring tokens would paint green by default; `.is-blocked` re-points those CSS variables to Carbon so the blocked button never picks up the green affordance.
- Global `.is-error` rule in `style.css` paints the red border on any input/select/picker. Set to `!important` and additionally remaps PrimeVue's component-level CSS variables (`--p-select-border-color`, `--p-inputtext-border-color`, etc.) because PrimeVue v4 builds the border from theme tokens, so a plain `border-color` override loses.

**Wired field-by-field on steps 1, 2, 3, 4, 5, 6, 7, 8, 10.** Steps 9 (Your Quote) and 11 (Optional Benefits) have no required fields, so no gate. Per-step nuance worth noting:
- Step 3 only flags the next *actionable* missing field (brand/model stay disabled until their prerequisite is set).
- Step 2's end-date error only fires once the start date is set (the field is disabled before then).
- Step 8 validates format, not just presence (regex for email/phone/postal). PDPA consent gets its own error.
- Step 10's "add at least one household driver" surfaces as an error on the "Add a driver" CTA.

### 2. Date field rebuild (Figma node `4691-831`)

**Comment on step 2:** calendar icon should not be in a box; typing `21061989` should auto-format to `21/06/1989` in real time; the open calendar popup should have a green border.

**What shipped:**
- New `BdiDateField.vue` component, used everywhere we previously used PrimeVue's `<DatePicker>` for a date input.
- Calendar icon is inline (no boxed button).
- Numeric mask: `inputmode="numeric"` raises the digit keypad on mobile; `maskDigits()` inserts slashes live as the user types. Once 10 digits are present and the date is valid + in range, it commits to the model.
- Inline calendar popup wrapped in a `<div>` with a 1px `var(--bdi-green)` border, opens on field focus or icon click, closes on outside click or date selection.
- Border state machine matches the mockup: grey (default), green (focused or filled), red (`.is-error`). The popup border is always green.
- Currently used by step 2 (policy start/end) and step 6 (main driver DOB). Step 10 (additional driver DOB) is on the same component too.

**Known nuance** (flagged to user, no change requested): mid-type, `216` shows as `21/6` (no zero pad until the second month digit is typed). The fully-typed `21061989 → 21/06/1989` example from the brief works as expected.

### 3. Inactive (disabled) field colour (PrimeVue theme leak)

**Comment:** inactive fields looked "blue-ish" rather than grey.

**Root cause:** PrimeVue v4 Aura theme ships a *slate* (blue-tinted) palette: disabled bg `#e2e8f0`, default border `#cbd5e1`, hover `#94a3b8`. None of these are BDI tokens.

**Fix in `style.css`:** added a `body { ... }` block that remaps the form-field theme tokens to BDI neutral greys (`--p-form-field-*`, `--p-select-*`, `--p-inputtext-*`). Mounted on `body` rather than `:root` because PrimeVue injects its own `:root` token block after the app stylesheet, so a `:root` override loses; `body` sits below `<html>` and wins. Inactive fields now use:
- background: `--bdi-grey-200` (`#E4E4E4`)
- border: `--bdi-grey-300` (`#DADADA`)
- disabled text: `--bdi-grey-600` (`#858585`)

### 4. Active state design fixes (Figma node `4691-2315`)

**Comment on step 5:** selected band looked different from the mockup.

**Two issues, both fixed globally:**
1. Selected text was turning green — design system keeps selected text dark Carbon (`#333F48`). Removed `color: var(--bdi-green)` from `.is-selected` / `.is-on` rules on the step 4 yes/no, step 5 distance bands, step 10 yes/no, and step 10 chips.
2. Selected border looked ~2px because it was `1px border + 1px inset shadow`. Removed `box-shadow: 0 0 0 1px var(--bdi-green) inset` from every active state across all 11 steps. Active border is now a clean 1px green, consistent with the date field.

### 5. NCD follow-up questions on step 7 (Figma node `4708-3143`)

**Comment:** missing follow-up questions for NCD = 0% and NCD = 50%; error state should activate per field as well as on the whole form.

**What shipped on step 7:**
- New conditional fields, hidden until NCD value triggers them:
  - **NCD = 0%** → "NCD is 0% because" (New driver / No previous insurance / Claims in past year / I have NCD on another car).
  - **+ "I have NCD on another car"** → "What is your NCD on the other car?" (0–50%) and "NCD transferred from" (Current insurer / Previous insurer).
  - **NCD = 50%** → "How many years has the vehicle held the 50% No Claims Discount?" (1 / 2 / 3 or more).
- Switching the NCD value clears stale follow-up answers so the form can't carry over a hidden 0%-path answer into a 50% submission.
- Error copy updated to match the mockup verbatim ("Please select years of driving experience.", etc.). Each follow-up has its own `*Error` computed and `FieldError`, so it activates individually; the global `reveal()` reveals all of them at once.
- New store fields in `quote.js`: `ncdZeroReason`, `otherCarNcd`, `transferredFrom`, `fiftyYears`.

### 6. Global money formatter

**Comment:** all premium/dollar values should use `$#,###.##` (not `S$`, with commas, always 2 decimals).

**What shipped:**
- New `src/utils/money.js` exporting `formatMoney(n)` → `$1,234.50`, and `formatMoneySigned(n)` → `+$120.00` / `-$45.00` for deltas (`Intl.NumberFormat('en-SG')` under the hood).
- Step 9 rewritten to use the helpers for the hero price, breakdown rows (Premium / Excess adjustment / Total), and the six excess-chip deltas. Dropped the `S$` prefix.
- Step 11 optional-benefit prices moved from hard-coded strings (`'$8.11'`) to numeric source values formatted through `formatMoney()`.

---

## Files touched

| Type | Path |
|---|---|
| New | `src/composables/useValidation.js` |
| New | `src/components/FieldError.vue` |
| New | `src/components/BdiDateField.vue` |
| New | `src/utils/money.js` |
| Edited | `src/style.css` (error tokens, blocked button, PrimeVue theme remap) |
| Edited | `src/components/StickyNext.vue` (blocked-state click behaviour) |
| Edited | `src/store/quote.js` (NCD follow-up state) |
| Edited | `src/views/Step01CoverType.vue` |
| Edited | `src/views/Step02CoverStartDate.vue` |
| Edited | `src/views/Step03YearMakeModel.vue` |
| Edited | `src/views/Step04CarUsage.vue` |
| Edited | `src/views/Step05AnnualDistance.vue` |
| Edited | `src/views/Step06MainDriver.vue` |
| Edited | `src/views/Step07DrivingHistory.vue` |
| Edited | `src/views/Step08PolicyholderContact.vue` |
| Edited | `src/views/Step09YourQuote.vue` |
| Edited | `src/views/Step10AdditionalDrivers.vue` |
| Edited | `src/views/Step11OptionalBenefits.vue` |

Build clean throughout; no console errors at any point. All changes verified in the local preview (port 5198) before each section was closed out. Nothing pushed to Vercel yet — local-only until a deploy is triggered.

### Follow-up — Museo Sans adoption

After the initial review pass, the licensed Museo Sans font files were dropped into `04_Design/museosans-font/`. The prototype now self-hosts MuseoSans-300/500/700/900 from `public/fonts/`, with `@font-face` declarations in `style.css` and `--bdi-font` pointing at "Museo Sans". The Nunito Sans Google Fonts link in `index.html` was replaced with `<link rel="preload">` hints for 500 and 700 so the first paint doesn't flash a fallback. OTF format for now; can swap to WOFF2 later for a smaller initial payload (current total ~240 KB across four weights).
