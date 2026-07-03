# KB Registry — canonical ids, Notion pages, citing code

Canonical format: `KB-<n>` for entries numbered in the MD mirror
(`01_Requirements/knowledge-base.md`), `KB-<hash8>` for Notion rows created after
the mirror's last sync (10 Jun 2026) that have no number yet. When the next KB sync
assigns them numbers, update this registry and the page specs — ids in specs and
code comments should then be migrated in one commit.

Notion KB data source: `e15575d2-5e3d-49fe-ace4-934a4dbfbb45`.

## Numbered entries (mirrored)

| Id | Item | Status | Pages | Cited in code |
|---|---|---|---|---|
| KB-1 | IDIT mandatory fields per role | 🔴 Conflict (vs KB-5) | P06, P10, P12 | — (spec-level; see OD-7) |
| KB-2 | Instalment needs one button per bank (IPP) | 🔵 In Design | P15 | — (see OD-8) |
| KB-3 | AF/NAF button options + rejection limits (AF 4+ / NAF 5+ reject) | 🟢 Confirmed | P07, P10 | Step07DrivingHistory.vue, Step10AdditionalDrivers.vue (chip arrays; blockers pending, OD-4) |
| KB-4 | NCD attached to policyholder, not additional drivers | 🟢 Confirmed | P07, P10, P12 | Step10AdditionalDrivers.vue header |
| KB-5 | COM for main + named drivers (up to 15% discount) | 🔴 Conflict (vs KB-1) | P06, P10 | — (see OD-7) |
| KB-6 | NCD 60% discount DA-only | 🟢 Confirmed (DA) | P07 | Step07DrivingHistory.vue (BD ncdOptions cap at 50%) |
| KB-7 | Drive Less Pay Less + odometer DA-only | 🟢 Confirmed (DA) | P05 | Step13VehicleDetails.vue, store/quote.js, Step05AnnualDistance.vue comment |
| KB-8 | NCD at renewal: policyholder + main driver | 🟢 Confirmed | P07, P10, P12 | — (spec-level) |
| KB-9 | Third-party covers cap car age at 15 years | 🟢 Confirmed | P01, P03, P13 | Step03YearMakeModel.vue (year filter + clear), Step13VehicleDetails.vue (helper banner) |
| KB-10 | Step 4 private-and-business skips commute question | 🟢 Confirmed | P04 | Step04CarUsage.vue |
| KB-11 | Premium display: never "per year"; GST as line item only; sticky mirrors card | 🟢 Confirmed | P09, P15, sticky bars | Step09YourQuote.vue, components/BdiQuoteFooter.vue, store/quote.js |

## Post-sync hash entries (Notion rows newer than the mirror)

| Id | Item | Status | Cited in code |
|---|---|---|---|
| KB-f1898394 | Single/Instalment naming; cover term flexes 7–18 months | 🟢 Confirmed (Sprint Review 12 Jun 2026) | Step09YourQuote.vue, store/quote.js, Step02CoverStartDate.vue (end-date min/max) |
| KB-98cd9339 | Marketing prefs relocation Step 8 vs Step 12 | 🟠 Pending (OD-3) | Step12PolicyholderDetails.vue, Step08PolicyholderContact.vue |
| KB-ef6fa273 | Step 14 inline-edit decision | 🟠 Pending (OD-2) | — (see step-14 spec) |

## Flags for the next KB sync

1. **Numbering drift**: KB-11's cross-reference says "KB #6 (Single/Instalment
   naming)" but mirror entry #6 is "NCD 60% DA-only". The Single/Instalment naming
   row is almost certainly KB-f1898394, created after the mirror sync. Resolve the
   numbering when the mirror is next synced from Notion.
2. **Latent KB-11 violation**: `components/StickyNext.vue` still contains the
   template string "per year (incl. GST)" in its price unit. It never renders today
   (no Step 1–8 page passes a `price` prop), but if a price is ever surfaced
   pre-quote this violates KB-11. Fix the string when StickyNext next changes.
3. **KB-1 occupation note**: IDIT needs occupation as non-mandatory in the driver
   section even though it is no longer a pricing factor. Prototype collects no
   occupation anywhere — confirm with IT whether the API defaults it.
