# Journey Spec — the contract between requirements and code

One YAML file per page of the BD quote-and-buy journey. This is the machine-readable
layer that links Notion KB rules → Figma nodes → Vue code, so that:

- "What must be filled before step X can proceed?" is a lookup, not code archaeology
- A KB decision change can be traced to the exact pages and files it touches
- Figma-vs-prototype review can diff against a written contract instead of memory
- Pending business decisions have a landing place (see `decisions.yaml`)

## The rule that keeps this alive

**Any change to fields, validations, prefill, conditions, or routing in a view must
update that page's spec file in the same commit.** A spec that drifts from code is
worse than no spec. The same-commit rule is also recorded in the project CLAUDE.md.

## Files

| File | What it is |
|---|---|
| `pages/step-NN.yaml` | One spec per journey page (17 steps + step-10-1 + payment-gateway) |
| `decisions.yaml` | Open-decision registry (OD-n ids). Pending business calls + what each affects |
| `kb-registry.md` | Canonical KB ids → Notion pages → citing code files |

## Page spec schema

```yaml
page: 12                      # step number (10.1 allowed)
route: /step/12
title: Policyholder Additional Details
brand: BD                     # BD | DA | All — DA specs land later, schema is shared
omp: OMP-651                  # Notion user story (router meta must match)
figma:
  canvas: "4962-3081"         # design canvas node (null = not designed in Figma)
  mobile: "5281:1683"         # mobile mock node used for the build
code: src/views/Step12PolicyholderDetails.vue
kb: [KB-1, KB-98cd9339]       # canonical ids, see kb-registry.md
footer: BdiQuoteFooter        # StickyNext | BdiQuoteFooter | inline | none

fields:
  - id: fullName              # store path or local field id
    label: Full name (as per NRIC)
    store: policyholder.fullName
    required: true
    validation: non-empty
    prefill: { from: mainDriver.name, when: mainDriver.isPolicyholder }
    notes: optional free text

conditions:                   # progressive reveal / branching, in plain english
  - when: ...
    then: ...

effects:                      # what answers here change elsewhere (cross-step)
  - ...

exceptions:                   # UW blocks, error paths, IDIT scenarios
  - ...

open-decisions: [OD-1]        # ids into decisions.yaml

demo-autofill: one line describing what the header-chip demo fills on this page

acceptance-criteria:
  - "Given ..., when ..., then ..."
```

Only `page`, `route`, `title`, `brand`, `omp`, `code`, `fields` are mandatory;
omit empty sections rather than writing `[]`.

## How the loops use this

- **Story pipeline** (`/story-sync OMP-xxx`, planned): pulls the Notion story, the KB
  rows and the Figma node, three-way diffs against this spec + the view code, and
  emits an updated spec + US/Reqs/AC draft + discrepancy checklist.
- **Decision impact scan** (planned, extends knowledge-base-sync): after a KB triage,
  grep these files for the touched KB-/OD- ids to list affected pages and code.
  Use a word-boundary pattern — `grep -lE "KB-9([^0-9]|$)"` — because plain
  `grep "KB-9"` also matches `KB-98cd9339`.
- **Drift watch** (planned): Figma `last_modified_at` changes flag the page spec for
  re-review.

## Conventions

- KB ids are canonical: `KB-<n>` for numbered mirror entries, `KB-<hash8>` for Notion
  rows created after the last MD sync. Registry: `kb-registry.md`.
- OD ids never get reused. When a decision lands, set `status: decided`, record the
  outcome, and only move to `implemented` when the code + spec both reflect it.
- Prototype-only shortcuts (mock gateway, demo autofill, stubbed postal lookup) are
  labelled `prototype-only` in notes so nobody mistakes them for requirements.
