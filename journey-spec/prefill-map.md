# Prefill Map — every field, where it's born, where it flows

The single answer to "what can we prefill at later steps?" across the whole BD
journey, factoring the main-driver-is/isn't-policyholder branch. Sourced from
the page specs (`pages/*.yaml`), the IDIT per-role field table (KB-1), and
Mikie's color-coded Figma reference (3 Jul 2026).

**Logged in the Requirements KB as KB-12** ("Prefill logic — cross-step field
carry-over", Notion `39271919-1ce8-81b2`, Confirmed 3 Jul 2026). This file is
the machine-readable source of truth that KB row points at — keep them in step.

## Color legend (matches the Figma reference)

| Color | Meaning | Born at |
|---|---|---|
| 🟢 green | Main-driver personal (DOB, gender, marital) | Step 6 (pre-quote) |
| 🟠 orange | Driving history + NCD (licence yrs, AF, NAF, CoM, NCD) | Step 7 (pre-quote) |
| 🔵 blue | Identity capture (Full name, NRIC/FIN) | Step 10.1 (post-quote) |
| 🩷 pink | Contact (preferred name, email, mobile, marketing) | Step 8 (pre-quote) |

## Master flow table

| Field | Born | Flows to (prefill / display) | Scenario-dependent? |
|---|---|---|---|
| Cover type | S1 | S3 year-range filter (KB-9) · S13 banner + financing warning · S14, S17 display | no |
| Cover start/end date | S2 | S14 policy duration · S17 cover period | no |
| Year / Make / Model | S3 | **S13 prefill (editable, writes back to the same store keys)** · S9 meta card · S14, S17 display | no |
| Usage / commute / off-peak | S4 | S14 car-details card | no |
| Annual distance band | S5 | S14 mileage row | no |
| Is policyholder? | S6 | **THE branch** — controls S12 prefill + S14 card layout | it IS the branch |
| 🟢 DOB, gender, marital | S6 | S10.1 prefill (always, editable) · S12 DOB+gender prefill **only when MD=PH** · S14 cards | yes |
| 🟠 Licence yrs, AF, NAF, CoM | S7 | S10.1 prefill (always, editable) · S14 driving-history card | no (main-driver data either way) |
| 🟠 NCD (+ 0% reason chain) | S7 | **S12 NCD prefill ALWAYS** — Step 7 asks the POLICYHOLDER's NCD (KB-4/KB-8), so it carries over even when MD≠PH | no — deliberate |
| 🩷 Preferred name | S8 | nothing today. Do NOT prefill S12 full name from it (Figma note: "prefill is not recommended" — preferred ≠ legal name) | see OD-10 |
| 🩷 Email, mobile | S8 | S9 email-quote input · **S12 prefill (current implementation)** · S14 contact rows · S17 documents-sent line | OD-10: when MD≠PH, is the pre-quote contact really the policyholder's? |
| 🩷 Marketing channels | S8 | S12 channel picker prefill (duplication pending OD-3) | no |
| Payment term, excess, promo | S9 | S15 term mirror (two-way) · sticky bars · S14 promo row · S17 paid line | no |
| 🔵 Full name, NRIC | S10.1 | **S12 prefill only when MD=PH** · S14 cards (NRIC masked to last 4) | yes |
| Additional drivers[] | S10 | S14 named-driver cards + household plan card | no |
| Optional benefits | S11 | sticky breakdown rows · S14 benefits card | no |
| Policyholder identity + address | S12 | S14 policyholder card · S17 greeting + email | born here (or prefilled, see above) |
| VRM/chassis, insurer, financing | S13 | S14 car-details card (VRM row) | no |
| Payment method + bank | S15 | S17 method line | no |

## Step 12 scenario matrix (the page the branch actually changes)

| Field on Step 12 | MD = PH | MD ≠ PH |
|---|---|---|
| Full name | 🔵 prefilled from S10.1 | empty — manual. Never from preferred name |
| NRIC/FIN | 🔵 prefilled from S10.1 | empty — manual |
| DOB | 🟢 prefilled from S6 | empty — manual |
| Gender | 🟢 prefilled from S6 | empty — manual |
| Email / Mobile | 🩷 prefilled from S8 | 🩷 prefilled from S8 today — **OD-10 open**: the pre-quote "you" may be the main driver, not the policyholder |
| NCD at renewal | 🟠 prefilled from S7 | 🟠 prefilled from S7 (policyholder-owned, KB-4/KB-8) |
| Postal + address | manual (postal lookup autofills block/street/building) | same |
| Marketing channels | 🩷 prefilled from S8 (OD-3) | same |

Step 10.1 is scenario-independent: it always describes the main driver, so its
prefills (🟢 from S6, 🟠 from S7) apply in both scenarios.

## Cross-check vs the IDIT per-role field table (KB-1)

| IDIT requires | Collected at | Status |
|---|---|---|
| Main driver: gender, full name, NRIC, DOB, marital, driving exp, COM, AF, NAF | S6 + S7 + S10.1 | ✅ all collected. **Figma 10.1 frame is missing the COM field — the prototype has it (code ahead of design; relay to designer)** |
| Named driver: gender, full name, NRIC, DOB, marital, driving exp, AF, NAF | S10 per-driver form | ✅ collected. COM deliberately omitted pending the KB-1 vs KB-5 conflict (OD-7) |
| Policyholder: gender, preferred name, full name, DOB, NRIC, mobile, email, MKT flags, postal | S8 (preferred name, email, mobile, MKT) + S12 (rest) | ⚠️ gender is collected on S12 only when prefilled from S6; when MD≠PH it's a manual S12 field — present either way. Occupation: not collected anywhere (KB-1 note: no longer a pricing factor; IDIT to make non-mandatory) |

## Refresh persistence (3 Jul 2026)

Both prototypes now persist the quote store to sessionStorage. A mid-journey
browser refresh no longer wipes the answers, which used to make every prefill
look broken in demos (the "empty year on the vehicle page" report was exactly
this). New tab = clean journey. Verified live on both dev servers.

## DA equivalents

DA has no 10.1 sub-step: main-driver identity (name/NRIC/DOB/gender) is
captured on DA's Step 12 combined page, bound directly to the same store keys.
DA's vehicle page (Step 13) prefills year/make/model from its Step 3 the same
way BD does (verified live 3 Jul 2026: Toyota / RAV4 / 2025 arrive prefilled
via SPA navigation). Full DA page specs land with the DA journey-spec backfill
(planned; schema already supports `brand: DA`).
