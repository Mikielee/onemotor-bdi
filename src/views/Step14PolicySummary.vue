<script setup>
/**
 * Step 14 — Review your custom cover (Policy Summary).
 * Rebuilt to match the DA-side layout (cards grouped by topic, each with
 * an edit affordance, driver rows, plan cards with green-check status,
 * selected-benefits list) but in BD styling — Museo Sans, BD red brand,
 * BD green for status, no yellow.
 *
 * Adds the three disclosure gates that need to be ticked before payment:
 *   1. Terms & Conditions
 *   2. Duty of Disclosure
 *   3. Underwriting Declaration
 * All three required → BdiQuoteFooter "Proceed to payment" enables.
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import BdiCheckIcon from '../components/BdiCheckIcon.vue'
import { useQuote } from '../store/quote'

const { quote } = useQuote()
const router = useRouter()

const acceptedTerms = ref(false)
const acceptedDuty = ref(false)
const acceptedUnderwriting = ref(false)

const allDisclosuresAccepted = computed(
  () => acceptedTerms.value && acceptedDuty.value && acceptedUnderwriting.value,
)

function editTo(step) {
  router.push(`/step/${step}`)
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function capitalise(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function maskNric(nric) {
  if (!nric || nric.length < 5) return nric || '—'
  return `····${nric.slice(-4)}`
}

const coverTypeLabel = computed(() => ({
  'third-party': 'Third-party',
  'third-party-fire-theft': 'Third-party Fire & Theft',
  'comprehensive': 'Comprehensive',
})[quote.coverType] || '—')

const quoteId = 'P11254149R00'

const policyDuration = computed(() => {
  const start = quote.coverStartDate
  const end = quote.coverEndDate
  if (!start || !end) return 'Cover dates to be confirmed'
  return `${formatDate(start)} – ${formatDate(end)}`
})

const promoApplied = computed(() => quote.quoteSelection?.appliedPromo || null)

// Car-details section. BD-only — no odometer per KB #7. Mileage = annual
// distance band from Step 5.
const usageLabel = computed(() => {
  const u = quote.carUsage?.usage
  if (u === 'private-only') return 'Private only'
  if (u === 'private-business') return 'Private and business'
  return '—'
})
const offPeakLabel = computed(() => {
  const v = quote.carUsage?.offPeak
  if (v === true) return 'Yes'
  if (v === false) return 'No'
  return '—'
})
const mileageLabel = computed(() => ({
  'under-8000': 'Less than 8,000 km',
  '8000-12000': '8,000 – 12,000 km',
  '12001-18000': '12,001 – 18,000 km',
  'over-18000': 'Over 18,000 km',
})[quote.annualDistance] || '—')

// Person rows — when main driver IS policyholder, show a combined row;
// otherwise show them separately.
const mainDriverIsPolicyholder = computed(
  () => quote.mainDriver?.isPolicyholder === true,
)

const policyholderName = computed(
  () => quote.policyholder?.fullName || 'Policyholder',
)
const policyholderDob = computed(
  () => formatDate(quote.policyholder?.dob),
)
const mainDriverName = computed(
  () => mainDriverIsPolicyholder.value
    ? policyholderName.value
    : quote.mainDriver?.name || 'Main driver',
)
const mainDriverDob = computed(
  () => formatDate(mainDriverIsPolicyholder.value
    ? quote.policyholder?.dob
    : quote.mainDriver?.dob),
)

const namedDrivers = computed(() =>
  (quote.additionalDrivers || []).map((d) => ({
    name: d.name || 'Unnamed driver',
    dob: formatDate(d.dob),
  })),
)

// Plan cards — only render the ones the customer actually has.
const hasHouseholdPlan = computed(() => namedDrivers.value.length > 0)
const hasAuthorisedPlan = computed(() => quote.authorisedDriverPlan === true)

const BENEFIT_LABELS = {
  'ncd-protector': 'NCD Protector',
  'roadside-assistance': '24-hour Roadside Assistance',
  'any-workshop': 'Any Workshop',
  'new-for-old': 'New for Old Replacement Car',
  'medical-expenses': 'Medical Expenses',
  'overseas-emergency': 'Overseas Emergency Allowance / Repatriation',
  'personal-accident': 'Personal Accident',
  'transport-allowance': 'Transport Allowance / Loss of Use',
  'windscreen-cover': 'Windscreen Cover Add-on',
  'ev-addon': 'EV Add-on Pack',
}
const selectedBenefits = computed(() =>
  (quote.optionalBenefits || []).map((id) => BENEFIT_LABELS[id] || id),
)

function onProceed() {
  if (!allDisclosuresAccepted.value) return
  router.push('/step/15')
}
</script>

<template>
  <section class="step">
    <h1 class="page-title">Review your custom cover</h1>
    <p class="page-lede">
      Everything looks great. Take a moment to verify your details before
      we finalise your policy.
    </p>

    <!-- Policy details -->
    <article class="card">
      <header class="card-head">
        <h2>Policy details</h2>
        <button type="button" class="edit-btn" aria-label="Edit policy details" @click="editTo(1)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </header>
      <dl class="card-rows">
        <div class="row">
          <dt>Quote ID</dt>
          <dd>{{ quoteId }}</dd>
        </div>
        <div class="row">
          <dt>Policy type</dt>
          <dd>{{ coverTypeLabel }} cover</dd>
        </div>
        <div class="row">
          <dt>Policy duration</dt>
          <dd>{{ policyDuration }}</dd>
        </div>
        <div v-if="promoApplied" class="row">
          <dt>Promo</dt>
          <dd>{{ promoApplied.code }} — {{ promoApplied.benefit }}</dd>
        </div>
      </dl>
    </article>

    <!-- Car details -->
    <article class="card">
      <header class="card-head">
        <h2>Car details</h2>
        <button type="button" class="edit-btn" aria-label="Edit car details" @click="editTo(13)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </header>
      <dl class="card-rows">
        <div class="row">
          <dt>Car brand</dt>
          <dd>{{ quote.carMake || '—' }}</dd>
        </div>
        <div class="row">
          <dt>Car model</dt>
          <dd>{{ quote.carModel || '—' }}</dd>
        </div>
        <div class="row">
          <dt>Year of registration</dt>
          <dd>{{ quote.carYear || '—' }}</dd>
        </div>
        <div class="row">
          <dt>Vehicle registration number</dt>
          <dd>{{ quote.policyholder?.carDetails?.registrationNumber
            || quote.policyholder?.carDetails?.chassisNumber
            || '—' }}</dd>
        </div>
        <div class="row">
          <dt>Car usage</dt>
          <dd>{{ usageLabel }}</dd>
        </div>
        <div class="row">
          <dt>Off-peak car</dt>
          <dd>{{ offPeakLabel }}</dd>
        </div>
        <div class="row">
          <dt>Annual mileage</dt>
          <dd>{{ mileageLabel }}</dd>
        </div>
      </dl>
    </article>

    <!-- Drivers -->
    <template v-if="mainDriverIsPolicyholder">
      <h3 class="block-heading">Policyholder &amp; Main driver</h3>
      <article class="person-card">
        <div class="person-info">
          <p class="person-name">{{ policyholderName }}</p>
          <p class="person-meta">{{ policyholderDob }}</p>
        </div>
        <button type="button" class="edit-btn" aria-label="Edit policyholder" @click="editTo(12)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </article>
    </template>
    <template v-else>
      <h3 class="block-heading">Policyholder</h3>
      <article class="person-card">
        <div class="person-info">
          <p class="person-name">{{ policyholderName }}</p>
          <p class="person-meta">{{ policyholderDob }}</p>
        </div>
        <button type="button" class="edit-btn" aria-label="Edit policyholder" @click="editTo(12)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </article>

      <h3 class="block-heading">Main driver</h3>
      <article class="person-card">
        <div class="person-info">
          <p class="person-name">{{ mainDriverName }}</p>
          <p class="person-meta">{{ mainDriverDob }}</p>
        </div>
        <button type="button" class="edit-btn" aria-label="Edit main driver" @click="editTo(6)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </article>
    </template>

    <template v-if="namedDrivers.length > 0">
      <h3 class="block-heading">Named drivers</h3>
      <article
        v-for="(d, i) in namedDrivers"
        :key="i"
        class="person-card"
      >
        <div class="person-info">
          <p class="person-name">{{ d.name }}</p>
          <p class="person-meta">{{ d.dob }}</p>
        </div>
        <button type="button" class="edit-btn" aria-label="Edit named driver" @click="editTo(10)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </article>
    </template>

    <!-- Plan cards. Only render the ones the customer actually has. -->
    <article v-if="hasHouseholdPlan" class="plan-card">
      <BdiCheckIcon :size="20" />
      <div class="plan-body">
        <p class="plan-title">Household driver plan</p>
        <p class="plan-text">
          The named household drivers listed above are covered to drive
          this car under your policy.
        </p>
      </div>
    </article>

    <article v-if="hasAuthorisedPlan" class="plan-card">
      <BdiCheckIcon :size="20" />
      <div class="plan-body">
        <p class="plan-title">Authorised Driver Plan</p>
        <p class="plan-text">
          Any licensed driver you authorise to use this car is covered,
          subject to the policy exclusions noted at Step 10.
        </p>
      </div>
    </article>

    <!-- Selected benefits -->
    <template v-if="selectedBenefits.length > 0">
      <h3 class="block-heading">Selected benefits</h3>
      <article class="card benefit-list">
        <div v-for="(b, i) in selectedBenefits" :key="i" class="benefit-row">
          <BdiCheckIcon :size="18" />
          <span class="benefit-name">{{ b }}</span>
        </div>
      </article>
    </template>

    <!-- Disclosure / consent gates -->
    <section class="disclosures">
      <h3 class="block-heading">Before we finalise</h3>
      <p class="disclosure-intro">
        Please review and accept the following before proceeding to payment.
      </p>

      <button
        type="button"
        class="disc-row"
        :class="{ 'is-on': acceptedTerms }"
        :aria-pressed="acceptedTerms"
        @click="acceptedTerms = !acceptedTerms"
      >
        <span class="disc-box" :class="{ 'is-on': acceptedTerms }">
          <BdiCheckIcon v-if="acceptedTerms" :size="18" />
        </span>
        <span class="disc-text">
          I have read and agree to the
          <a href="#" class="doc-link" @click.stop>Terms &amp; Conditions</a>
          and
          <a href="#" class="doc-link" @click.stop>Policy Wording</a>.
        </span>
      </button>

      <button
        type="button"
        class="disc-row"
        :class="{ 'is-on': acceptedDuty }"
        :aria-pressed="acceptedDuty"
        @click="acceptedDuty = !acceptedDuty"
      >
        <span class="disc-box" :class="{ 'is-on': acceptedDuty }">
          <BdiCheckIcon v-if="acceptedDuty" :size="18" />
        </span>
        <span class="disc-text">
          <strong>Duty of disclosure.</strong>
          I confirm the information I have provided is true, complete and
          accurate. I understand that if any of it is incorrect or
          incomplete, my policy may be cancelled or a claim may be
          declined.
        </span>
      </button>

      <button
        type="button"
        class="disc-row"
        :class="{ 'is-on': acceptedUnderwriting }"
        :aria-pressed="acceptedUnderwriting"
        @click="acceptedUnderwriting = !acceptedUnderwriting"
      >
        <span class="disc-box" :class="{ 'is-on': acceptedUnderwriting }">
          <BdiCheckIcon v-if="acceptedUnderwriting" :size="18" />
        </span>
        <span class="disc-text">
          <strong>Underwriting declaration.</strong>
          Neither I nor any driver to be insured has had insurance
          cancelled, declined or had special terms imposed, nor any
          undisclosed convictions, undisclosed at-fault claims, or
          driving licence currently disqualified, suspended, or endorsed.
        </span>
      </button>
    </section>

    <BdiQuoteFooter
      :disabled="!allDisclosuresAccepted"
      :intercept-next="true"
      next-label="Proceed to payment"
      @next="onProceed"
    />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 24px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.2;
}
.page-lede {
  margin: 0 0 8px 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
  max-width: 60ch;
}

.block-heading {
  margin: 8px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.25;
}

/* White card with light grey border. The DA mock used a 4px coloured
   left stripe; replaced with a uniform 1px border to keep the visual
   uniform without the side-stripe affordance. */
.card {
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-head h2 {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
}

/* Edit affordance — small circular icon button. */
.edit-btn {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: var(--bdi-grey-100);
  color: var(--bdi-carbon);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.edit-btn:hover { background: var(--bdi-grey-200); }
.edit-btn .pi { font-size: 12px; }

.card-rows {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.row dt {
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}
.row dd {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.3;
}

/* Person rows — flat white card with name + dob + edit affordance. */
.person-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 16px 20px;
}
.person-info { flex: 1 1 0; display: flex; flex-direction: column; gap: 2px; }
.person-name {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.3;
}
.person-meta {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.3;
}

/* Plan card — green check on the left, bold title, description below. */
.plan-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 16px 20px;
}
.plan-body { flex: 1 1 0; display: flex; flex-direction: column; gap: 4px; }
.plan-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.plan-text {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.45;
}

/* Selected benefits — uses .card shell. */
.benefit-list {
  gap: 12px;
}
.benefit-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.benefit-name {
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  line-height: 1.3;
}

/* Disclosures — three tappable rows, each a checkbox+text. All required. */
.disclosures {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.disclosure-intro {
  margin: 0 0 4px 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.4;
}
.disc-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  font-family: var(--bdi-font);
}
.disc-row.is-on { border-color: var(--bdi-green); }
.disc-box {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid var(--bdi-grey-600);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.disc-box.is-on { border-color: var(--bdi-green); }
.disc-text {
  flex: 1 1 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.disc-text strong { font-weight: 700; }
.doc-link {
  color: var(--bdi-cyan);
  text-decoration: underline;
  font-weight: 600;
}
</style>
