<script setup>
/**
 * Step 14 — Policy Summary. NEW page (no Figma yet — designed in-prototype
 * applying /impeccable product-register laws and the BD design system).
 *
 * Two-tier visual hierarchy:
 *   1. Elevated hero card with the three facts that define the policy:
 *      cover type, vehicle, policy period. Subtle green "Quote secured"
 *      badge above the title; quote ID below a hairline rule. One card
 *      total — avoids the wall-of-identical-cards anti-pattern.
 *   2. Flat detail sections, separated by 1px hairlines (no nested cards).
 *      Each section is a flowing sentence rather than a label/value stack,
 *      with a small cyan "Edit" link at the right that routes back to the
 *      originating step.
 *
 * A confirmation checkbox gates the sticky footer's "Proceed to payment"
 * button. The footer is BdiQuoteFooter so the running price stays visible.
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import BdiCheckIcon from '../components/BdiCheckIcon.vue'
import { useQuote } from '../store/quote'

const { quote } = useQuote()
const router = useRouter()

const confirmed = ref(false)

function editTo(step) {
  router.push(`/step/${step}`)
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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

const vehicleHeadline = computed(() => {
  const parts = [quote.carMake, quote.carModel, quote.carYear].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Vehicle to be confirmed'
})

const periodLabel = computed(() => {
  const start = quote.coverStartDate
  const end = quote.coverEndDate
  if (!start) return 'Cover dates to be confirmed'
  return `${formatDate(start)} to ${formatDate(end)}`
})

const mainDriverSentence = computed(() => {
  const md = quote.mainDriver || {}
  const dh = quote.drivingHistory || {}
  const parts = []
  if (md.gender) parts.push(md.gender === 'male' ? 'Male' : 'Female')
  if (md.dob) parts.push(`born ${formatDate(md.dob)}`)
  if (md.maritalStatus) parts.push(capitalise(md.maritalStatus))
  if (dh.yearsLicensed != null) {
    parts.push(`licensed for ${dh.yearsLicensed} year${dh.yearsLicensed === 1 ? '' : 's'}`)
  }
  if (dh.ncd != null) parts.push(`${dh.ncd}% NCD at renewal`)
  if (dh.certificateOfMerit === true) parts.push('Certificate of Merit')
  return parts.length ? parts.join(' · ') : 'Main driver details not yet captured'
})

const additionalDrivers = computed(() => {
  const list = quote.additionalDrivers || []
  return list.map((d) => ({
    name: d.name || 'Unnamed driver',
    sub: [
      d.gender === 'male' ? 'Male' : d.gender === 'female' ? 'Female' : '',
      d.dob ? `born ${formatDate(d.dob)}` : '',
    ].filter(Boolean).join(' · '),
  }))
})

const authorisedDriverPlanLabel = computed(() => {
  if (quote.hasOutsideDrivers === true) return 'Included (+$200.00)'
  if (quote.hasOutsideDrivers === false) return 'Not included'
  return 'Not yet chosen'
})

const carSentence = computed(() => {
  const cd = quote.policyholder?.carDetails || {}
  const parts = []
  if (cd.registrationNumber) parts.push(`VRM ${cd.registrationNumber}`)
  else if (cd.chassisNumber) parts.push(`Chassis ${cd.chassisNumber}`)
  if (cd.currentInsurer && cd.currentInsurer !== 'None') {
    parts.push(`Currently insured with ${cd.currentInsurer}`)
  } else if (cd.currentInsurer === 'None') {
    parts.push('No current insurer')
  }
  if (cd.financing === true && cd.financialInstitution) {
    parts.push(`Financed by ${cd.financialInstitution}`)
  } else if (cd.financing === false) {
    parts.push('Not financed')
  }
  return parts.length ? parts.join(' · ') : 'Vehicle details not yet captured'
})

const BENEFIT_LABELS = {
  'ncd-protector': 'NCD Protector',
  'roadside-assistance': '24-hour Roadside Assistance',
  'any-workshop': 'Any Workshop',
  'new-for-old': 'New for Old Replacement Car',
  'medical-expenses': 'Medical Expenses',
  'overseas-emergency': 'Overseas Emergency / Repatriation',
  'personal-accident': 'Personal Accident',
  'transport-allowance': 'Transport Allowance',
  'windscreen-cover': 'Windscreen Cover',
  'ev-addon': 'EV Add-on Pack',
}
const benefitsSentence = computed(() => {
  const list = (quote.optionalBenefits || []).map((id) => BENEFIT_LABELS[id] || id)
  return list.length ? list.join(' · ') : 'Standard cover only — no add-ons'
})

const excessLabel = computed(() => {
  const e = quote.quoteSelection?.excess ?? 600
  return e === 600 ? '$600 (default)' : `$${e.toLocaleString()}`
})

const policyholderSentence = computed(() => {
  const ph = quote.policyholder || {}
  const a = ph.address || {}
  const parts = []
  if (ph.fullName) parts.push(ph.fullName)
  if (ph.nric) parts.push(`NRIC ${maskNric(ph.nric)}`)
  const addressLine = [a.block, a.street, a.unit ? `#${a.unit}` : ''].filter(Boolean).join(' ')
  if (addressLine) parts.push(addressLine)
  if (ph.email) parts.push(ph.email)
  if (ph.phone) parts.push(`+65 ${ph.phone}`)
  return parts.length ? parts.join(' · ') : 'Policyholder details not yet captured'
})

const paymentTermLabel = computed(() => {
  const term = quote.quoteSelection?.paymentTerm ?? 'single'
  return term === 'single'
    ? 'Single payment (3% discount applied)'
    : 'Instalment (monthly)'
})

// Sticky footer is intercepted so we can navigate to /step/15 instead of
// the default /step/15 — same route, but explicit so future routing logic
// (e.g. PayNow direct path) is easy to slot in.
function onProceed() {
  router.push('/step/15')
}
</script>

<template>
  <section class="step">
    <p class="page-eyebrow">Step 14 of 17</p>
    <h1 class="page-title">Almost there. One last look.</h1>
    <p class="page-lede">
      Take a moment to check the details below. Tap <em>Edit</em> on any
      section if something needs to change.
    </p>

    <!-- Elevated hero card -->
    <article class="hero">
      <div class="hero-badge">
        <BdiCheckIcon :size="18" />
        <span>Quote secured</span>
      </div>
      <h2 class="hero-cover">{{ coverTypeLabel }} cover</h2>
      <p class="hero-line">{{ vehicleHeadline }}</p>
      <p class="hero-line">{{ periodLabel }}</p>
      <hr class="hero-rule" />
      <p class="hero-quote-id">Quote ID · P11254149R00</p>
    </article>

    <!-- Detail sections, flat with hairlines between -->
    <div class="details">

      <section class="row">
        <div class="row-head">
          <h3>Main driver</h3>
          <button type="button" class="edit-link" @click="editTo(6)">Edit</button>
        </div>
        <p class="row-body">{{ mainDriverSentence }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Additional drivers</h3>
          <button type="button" class="edit-link" @click="editTo(10)">Edit</button>
        </div>
        <p v-if="additionalDrivers.length === 0" class="row-body row-body-muted">
          Just you — no household drivers added.
        </p>
        <div v-else class="row-body driver-list">
          <p v-for="(d, i) in additionalDrivers" :key="i">
            <strong>{{ d.name }}</strong>
            <span v-if="d.sub"> · {{ d.sub }}</span>
          </p>
        </div>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Authorised Driver Plan</h3>
          <button type="button" class="edit-link" @click="editTo(10)">Edit</button>
        </div>
        <p class="row-body">{{ authorisedDriverPlanLabel }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Your car</h3>
          <button type="button" class="edit-link" @click="editTo(13)">Edit</button>
        </div>
        <p class="row-body">{{ carSentence }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Optional benefits</h3>
          <button type="button" class="edit-link" @click="editTo(11)">Edit</button>
        </div>
        <p class="row-body">{{ benefitsSentence }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Excess</h3>
          <button type="button" class="edit-link" @click="editTo(9)">Edit</button>
        </div>
        <p class="row-body">{{ excessLabel }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Policyholder</h3>
          <button type="button" class="edit-link" @click="editTo(12)">Edit</button>
        </div>
        <p class="row-body">{{ policyholderSentence }}</p>
      </section>

      <section class="row">
        <div class="row-head">
          <h3>Payment terms</h3>
          <button type="button" class="edit-link" @click="editTo(9)">Edit</button>
        </div>
        <p class="row-body">{{ paymentTermLabel }}</p>
      </section>

    </div>

    <!-- Confirmation gate -->
    <button
      type="button"
      class="confirm-row"
      :class="{ 'is-on': confirmed }"
      :aria-pressed="confirmed"
      @click="confirmed = !confirmed"
    >
      <span class="confirm-box" :class="{ 'is-on': confirmed }">
        <BdiCheckIcon v-if="confirmed" :size="20" />
      </span>
      <span class="confirm-text">
        I confirm the details above are correct and I accept the
        <a href="#" class="policy-link" @click.stop>policy wording</a>.
      </span>
    </button>

    <BdiQuoteFooter
      :disabled="!confirmed"
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
  gap: 24px;
}

/* Page header — eyebrow + h1 + lede. Sets a calmer top hierarchy than the
   chunky section titles other steps use. */
.page-eyebrow {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bdi-grey-600);
}
.page-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--bdi-carbon);
}
.page-lede {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-grey-600);
  line-height: 1.5;
  max-width: 60ch;
}
.page-lede em {
  font-style: normal;
  font-weight: 700;
  color: var(--bdi-cyan);
}

/* Hero card — the only elevated surface on this page. Restrained colour:
   white card, grey-200 border, subtle shadow, green only on the badge. */
.hero {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--bdi-font);
  font-size: 13px;
  font-weight: 700;
  color: var(--bdi-green);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.hero-cover {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--bdi-carbon);
}
.hero-line {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.45;
}
.hero-rule {
  border: 0;
  border-top: 1px solid var(--bdi-grey-200);
  margin: 12px 0 0 0;
}
.hero-quote-id {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 600;
  color: var(--bdi-grey-600);
  letter-spacing: 0.02em;
}

/* Detail sections — flat. No nested cards. Hairlines between rows. */
.details {
  display: flex;
  flex-direction: column;
}
.row {
  padding: 16px 0;
  border-bottom: 1px solid var(--bdi-grey-200);
}
.row:first-child { padding-top: 0; }
.row:last-child { border-bottom: 0; padding-bottom: 0; }

.row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.row-head h3 {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.edit-link {
  background: transparent;
  border: 0;
  padding: 4px 6px;
  margin: -4px -6px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-cyan);
  cursor: pointer;
}
.edit-link:hover {
  text-decoration: underline;
}
.row-body {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.row-body-muted {
  color: var(--bdi-grey-600);
  font-weight: 400;
}
.driver-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.driver-list p { margin: 0; }
.driver-list strong { font-weight: 700; }

/* Confirmation gate — large tappable area. Acts as both a UI affordance
   and the explicit consent checkpoint before payment. */
.confirm-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  font-family: var(--bdi-font);
}
.confirm-row.is-on { border-color: var(--bdi-green); }
.confirm-box {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid var(--bdi-grey-600);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.confirm-box.is-on { border-color: var(--bdi-green); }
.confirm-text {
  flex: 1 1 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.45;
}
.policy-link {
  color: var(--bdi-cyan);
  text-decoration: underline;
  font-weight: 600;
}
</style>
