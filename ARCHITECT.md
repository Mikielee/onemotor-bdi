# Architecture — Budget Direct One Motor Prototype

A one-page reference for presenting how this prototype was built. Non-dev-friendly language, actual code paths.

Live: https://bdi-primevue.vercel.app
Repo: https://github.com/Mikielee/onemotor-bdi

---

## 1. What it is

A mobile-first Vue 3 prototype of the Budget Direct car insurance quote-and-buy journey. 17 steps plus a payment gateway plus a confirmation page, all wired with a working price engine, real prefill rules, and a demo autofill for stakeholder walkthroughs.

Not a mockup. It's real running code, deployed to Vercel, that mirrors the production data model closely enough that IDIT and IT can look at it and see the shape of what's being asked for.

---

## 2. Tech stack (and why)

| Piece | Choice | Why |
|---|---|---|
| UI framework | Vue 3 (Composition API) | Fast to learn, single-file components keep template + logic + style in one file per screen, works well with beginner developers |
| Build tool | Vite | Instant hot reload, zero config, fastest DX in the JS ecosystem |
| Component library | PrimeVue 4 | Battle-tested inputs (date pickers, selects, dropdowns) without having to build them from scratch |
| Routing | Vue Router | Step-based file routing — one file per step, path meta drives the step indicator |
| State | Custom reactive store (no Pinia/Vuex) | The journey has one linear state shape — the whole quote — so a single `reactive()` object is enough |
| Deploy | Vercel (auto-deploy from `main`) | Push to GitHub, get a fresh URL in ~30 seconds |

No TypeScript, no test framework, no lint config. This is a prototype, not production. Correctness comes from running it, not from types.

---

## 3. Folder map

```
src/
├── App.vue                   The shell: header + step indicator + routed content + app footer
├── main.js                   Entry point — mounts Vue, registers PrimeVue
├── style.css                 Global tokens (BD red, Museo Sans, spacing scale), .bdi-shell layout
│
├── router/
│   └── index.js              Every step's route + meta { step, group, omp, title }
│
├── store/
│   └── quote.js              THE ONE reactive object. Every step reads + writes here.
│
├── views/                    One .vue file per screen. All state lives locally + syncs to store.
│   ├── Step01CoverType.vue
│   ├── Step02CoverStartDate.vue
│   ├── ...
│   ├── Step09YourQuote.vue      ← running-price page, has its own inline sticky bar
│   ├── Step10_1MainDriverConfirm.vue  ← sub-step for main-driver identity
│   ├── ...
│   ├── Step17Confirmation.vue
│   └── PaymentGateway.vue    ← mock Stripe/Adyen-style card capture page
│
├── components/
│   ├── AppHeader.vue         ← "Car Insurance" chip = demo autofill trigger
│   ├── AppFooter.vue         Underwriter disclaimer, always at the very bottom
│   ├── StepIndicator.vue     "Your Car / Your Details / Your Quote / Finalise & Pay"
│   ├── BdiQuoteFooter.vue    ← Steps 10–17 sticky bar (Back / price / Next + expandable breakdown)
│   ├── StickyNext.vue        ← Steps 1–8 lighter sticky bar (Back + Next only, no price)
│   ├── BdiDateField.vue      DD/MM/YYYY input with min/max/invalid support
│   ├── BdiCheckIcon.vue      Green check SVG used in selected states
│   └── FieldError.vue        Red inline error, only shown after user clicks Next while invalid
│
├── composables/              Vue's "hooks" pattern — reusable stateful logic
│   ├── useQuotePricing.js    The pricing engine: subtotal, benefits, GST, single-discount, promo
│   ├── useValidation.js      showErrors flag — flipped when user first clicks disabled Next
│   └── useDemoAutofill.js    Each step registers a fill handler; header chip fires them
│
├── utils/                    Pure functions
│   ├── nric.js               SG NRIC/FIN checksum validator + postal-code stub lookup
│   └── money.js              formatMoney, formatMoneySigned
│
└── assets/                   Logo PNGs, payment brand marks (from /04_Design)
```

---

## 4. The data model — one source of truth

Every screen reads from and writes to the same reactive object in [`src/store/quote.js`](src/store/quote.js):

```js
const state = reactive({
  coverType: null,                 // Step 1
  coverStartDate: null,            // Step 2
  coverEndDate: null,
  carYear, carMake, carModel,      // Step 3
  carUsage: { usage, commute, offPeak },   // Step 4
  annualDistance,                  // Step 5
  mainDriver: { name, nric, dob, gender, maritalStatus, isPolicyholder },  // Steps 6 + 10.1
  drivingHistory: { yearsLicensed, atFaultClaims, notAtFaultClaims,
                    certificateOfMerit, ncd, ncdZeroReason, otherCarNcd, transferredFrom },  // Step 7
  contact: { preferredName, email, phone, marketingChannels, consentPdpa },  // Step 8
  quoteSelection: { paymentTerm, excess, promoCode, appliedPromo },  // Step 9
  hasAdditionalDrivers, hasOutsideDrivers, additionalDrivers: [], authorisedDriverPlan,  // Step 10
  optionalBenefits: [],            // Step 11
  policyholder: { fullName, nric, dob, gender, email, phone, ncd,
                  address, carDetails, marketingChannels },   // Step 12 + 13
  payment: { method, bank },       // Step 15
})
```

**Why a single flat object works here**: the journey is linear. You never edit Step 4 while looking at Step 12. Every mutation goes through the store, so any component reading from it sees the latest value.

**How each step touches it**:
1. `setup()` reads its slice into a local `reactive({...})` — so typing doesn't fire store updates on every keystroke.
2. A `sync()` function writes the local values back to the store on blur / commit.
3. Prefill happens on mount: the local `reactive` picks up whatever the store already has, so navigating back to a page shows what you typed.

Example from Step 12 (Policyholder Details):

```js
const local = reactive({
  fullName: quote.policyholder?.fullName || prefilledFullName.value,
  nric: quote.policyholder?.nric || prefilledNric.value,
  // ...
})
function sync() { mutable.policyholder = { ...quote.policyholder, ...local } }
```

`prefilledFullName` is a computed that reads from `quote.mainDriver.name` when the customer said "main driver = policyholder" on Step 6. This is the **prefill chain**: field values captured earlier flow downstream so the customer never types the same thing twice.

---

## 5. The journey model — 17 steps, 4 groups

The route file [`src/router/index.js`](src/router/index.js) is the source of truth for what step means what, and which group it belongs to. Each route carries `meta`:

```js
{
  path: '/step/12',
  component: () => import('../views/Step12PolicyholderDetails.vue'),
  meta: { step: 12, group: 3, omp: 'OMP-651', title: 'Policyholder Additional Details' },
}
```

- **`step`**: number the sticky bar and step indicator read
- **`group`**: 0 = Your Car, 1 = Your Details, 2 = Your Quote, 3 = Finalise & Pay
- **`omp`**: the Notion user-story ID this screen implements — traceability back to requirements
- **`title`**: shown in `<title>` tag + browser history

Sub-step `/step/10.1` is a special case — inserted between Step 9 and Step 10 to capture main-driver Name + NRIC without renumbering everything downstream. Router meta keeps its `step: 10` so the step indicator doesn't flicker.

---

## 6. The pricing engine

One composable, [`src/composables/useQuotePricing.js`](src/composables/useQuotePricing.js), owns all the math. Every component that shows a price — Step 9's hero card, the BdiQuoteFooter breakdown, Step 14's summary, Step 17's confirmation — pulls from the same composable, so numbers can't drift.

```
base subtotal $240
 + excess adjustment (–$50 to +$50 depending on chosen excess)
 + medical expenses ($80 if Personal Accident benefit picked)
 + $50 per named driver
 + $200 Authorised Driver Plan (if outside-household drivers = Yes)
 + $8.11 per optional benefit (NCD Protector, Roadside, etc.)
 ───
 subtotal with adjustments
 + 9% GST
 ×  0.97  if Single payment (3% discount)
 = annual total
 ÷ 12    if Instalment (per-month display)
```

Promo code `TEST` gives a $50 eCapitavoucher (gift, not a price cut) so it's shown as an info row, not applied to the math.

---

## 7. Sticky bar — the non-obvious layout

This one deserves its own section because it took three attempts to get right.

**Requirement**: the price + Next button must always be visible at the phone's bottom edge, whether the page content is short (Step 10 has two Yes/No chips) or long (Step 13 has 8 form fields).

**Wrong attempt 1** — `margin-top: auto` in a flex column. Fails on short pages when the parent `.step` isn't `flex: 1` — the auto resolves to 0 and the bar sits at the end of content instead of the viewport bottom.

**Wrong attempt 2** — `position: sticky; bottom: 0`. Fails on short pages because sticky only activates when the element would scroll past the viewport bottom. On short content, its natural position is already inside the viewport, so sticky stays dormant.

**Right answer** — three pieces working together, defined across three files:

1. **`style.css`**: `.bdi-main > section.step { flex: 1 0 auto }` — every step page now fills the available height inside the shell.
2. **`BdiQuoteFooter.vue` / `Step09YourQuote.vue`**: a flex-grow spacer above the bar with `flex: 1 0 36px` — grows to claim empty vertical space on short pages, collapses to a 36px min-height on long pages (preserving the notch breathing room).
3. **The bar itself**: `position: sticky; bottom: 0; z-index: 20` — pins it during scroll on long pages.

Combined: bar sits at viewport bottom on short pages (via spacer), stays pinned during scroll on long pages (via sticky), with 36px of breathing room above the circular notch in both states.

---

## 8. Demo autofill — the sprint-review superpower

Every step registers a fill handler in `setup()`:

```js
const { register } = useDemoAutofill()
register(() => {
  local.usage = 'private-only'
  local.commute = 'regular'
  local.offPeak = false
  sync()
})
```

The header's `Car Insurance` chip fires all currently-registered handlers. Because handlers auto-clean up on component unmount (via Vue's `onUnmounted`), only the mounted page's handler is in the set at any moment — so clicking the chip only fills the current page.

The persona is documented in the commit message of [`fcf6860`](https://github.com/Mikielee/onemotor-bdi/commit/fcf6860): Comprehensive cover, 2022 Toyota Corolla Altis, Tan Wei Liang (main driver = policyholder), Lim Mei Ling (1 household driver), NCD 0% because held on another car, promo `TEST`, 41-21 Icon Residence (postal 078878), Single + Credit card. The PaymentGateway autofill even derives the card number from the policyholder's NRIC tail so two stakeholders comparing demos see different digits.

Fields that would be prefilled from earlier steps by the normal journey logic (DOB at Step 12 when main driver = policyholder, etc.) are left to that logic — the demo handler only fills what the customer would normally type themselves.

---

## 9. Build → deploy loop

```
Edit locally
  ↓
git commit -m "..."
  ↓
git push origin main
  ↓
Vercel receives webhook
  ↓
Vercel runs `vite build`
  ↓
~30 seconds later, live at https://bdi-primevue.vercel.app
```

No staging environment, no build queue, no manual promote. `main` is production. If it works locally, it goes live.

For team members: they don't need to run anything locally. They just watch the Vercel URL — it always shows the latest push.

---

## 10. Where this connects to the rest of the project

- **Notion Requirements Knowledge Base**: every screen has an `omp:` field in router meta pointing back to its user story (OMP-87, OMP-88, ...). When Notion changes, we know which page to update.
- **Figma**: each Vue file's header comment cites the Figma node reference (e.g. `4189-8932` for Step 9's hero). When the designer ships a new frame, we know which .vue file to edit.
- **DA prototype**: the sibling `/06_Prototype/da-primevue/` uses the same architecture but DirectAsia branding. Behaviour patterns (sticky bar, StickyNext) are ported between them; visual styles are not.
- **Requirements KB rules**: KB #7 (no odometer on BD), KB #9 (15-year cap for TPO/TPFT), KB #11 (cover term 7–18 months, avoid "per year" copy) are enforced in the code and documented at the top of each affected component.

---

## Presenter's script — a 90-second walkthrough

Use this if you're demoing the architecture (not the flow) to non-devs.

> "The whole prototype is one folder. One data model — the customer's answers — sits in a single reactive object. Every screen reads from it and writes back to it, so when they navigate back their answers are still there.
>
> The 17 steps are just 17 Vue files, one per screen. The router file lists them all with a step number, a group, and a link back to the Notion user story it implements — so traceability is baked in.
>
> Pricing is one composable — call it a shared brain — that any component that shows a price pulls from. That's why the number in the hero card and the sticky bar and the summary can never disagree.
>
> The sticky bar was three tries. The first two failed on either short or scrolling pages. The final answer is a flex spacer plus position: sticky — together they cover both cases.
>
> The Car Insurance chip in the header is a demo autofill. Every screen registers a fill handler for its own fields. One click fills the page. It's what makes the sprint review flow.
>
> We push to GitHub, Vercel builds it in 30 seconds, and everyone sees the update at the same URL. There's no staging, no promote step. Main branch IS production."

---

## Appendix — commits worth citing in a presentation

| Commit | Story it tells |
|---|---|
| [`eb2d9f3`](https://github.com/Mikielee/onemotor-bdi/commit/eb2d9f3) | The demo-autofill plumbing (composable + header wiring, no per-step handlers yet) |
| [`fcf6860`](https://github.com/Mikielee/onemotor-bdi/commit/fcf6860) | All 18 step handlers wired in one commit — full persona in the commit body |
| [`62d2a0d`](https://github.com/Mikielee/onemotor-bdi/commit/62d2a0d) | Promo persistence + breakdown showing individual benefits — fixed a latent bug where promo silently dropped after Step 9 |
| [`c0a68bd`](https://github.com/Mikielee/onemotor-bdi/commit/c0a68bd) | The final sticky-bar fix — flex spacer + sticky, root-caused in the commit body |
| [`86e1a58`](https://github.com/Mikielee/onemotor-bdi/commit/86e1a58) | Step 10.1 sub-step for main-driver identity — closed the gap where Name + NRIC weren't collected anywhere pre-Step 12 |
