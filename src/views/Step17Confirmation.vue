<script setup>
/**
 * Step 17 — Confirmation / Thank You (OMP-656).
 * Figma is empty (🔴 marker), so designed in-prototype applying impeccable
 * product-register laws and the BD design system. The page lands the
 * customer after any of the three payment paths converge: PayNow QR,
 * Single-card gateway, or Instalment-card gateway.
 *
 * Avoids the SaaS-cliché "Thank you!" template by leading with the
 * thing the customer actually needs to know (they're covered, from when)
 * and follows with a small "what to do next" block. One elevated hero
 * card; flat detail rows below, same hierarchy idea as Step 14.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BdiCheckIcon from '../components/BdiCheckIcon.vue'
import { useQuote } from '../store/quote'
import { useQuotePricing } from '../composables/useQuotePricing'
import { formatMoney } from '../utils/money'

const router = useRouter()
const { quote } = useQuote()
const pricing = useQuotePricing()

const policyId = ref('')
const issuedAt = ref('')

onMounted(() => {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  policyId.value = `BDI-${datePart}-${rand}`
  issuedAt.value = now.toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
})

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const coverTypeLabel = computed(() => ({
  'third-party': 'Third-party',
  'third-party-fire-theft': 'Third-party Fire & Theft',
  'comprehensive': 'Comprehensive',
})[quote.coverType] || 'Comprehensive')

const vehicleLine = computed(() => {
  const parts = [quote.carMake, quote.carModel, quote.carYear].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Your car'
})

const periodLine = computed(() => {
  const start = quote.coverStartDate
  const end = quote.coverEndDate
  if (!start) return ''
  return `${formatDate(start)} to ${formatDate(end)}`
})

const startDateOnly = computed(() => formatDate(quote.coverStartDate) || 'shortly')

const policyholderName = computed(() => {
  const ph = quote.policyholder?.fullName
  const md = quote.mainDriver?.isPolicyholder ? ph : ph
  return (ph || md || 'there').split(' ')[0]
})

const policyholderEmail = computed(
  () => quote.policyholder?.email || quote.contact?.email || 'your email',
)

const amountLabel = computed(() => formatMoney(pricing.displayAmount.value))
const termLabel = computed(() =>
  pricing.paymentTerm.value === 'instalment' ? 'per month' : 'paid in full',
)

const paymentMethodLabel = computed(() => {
  const m = quote.payment?.method
  if (m === 'paynow') return 'PayNow'
  const map = { uob: 'UOB', dbs: 'DBS', ocbc: 'OCBC' }
  const bank = map[quote.payment?.bank]
  return bank ? `Credit card · ${bank}` : 'Credit card'
})

function downloadPolicy() {
  // Placeholder — production hits the policy-doc generator.
  alert('Policy PDF download — wired up in production. For prototype this is a no-op.')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <section class="step">
    <!-- Hero: green tick + headline. One celebratory moment. -->
    <header class="hero">
      <div class="check-wrap">
        <BdiCheckIcon :size="56" />
      </div>
      <p class="hero-eyebrow">You're covered, {{ policyholderName }}.</p>
      <h1 class="hero-title">{{ coverTypeLabel }} cover starts {{ startDateOnly }}.</h1>
      <p class="hero-lede">
        We've sent your policy documents and payment receipt to
        <strong>{{ policyholderEmail }}</strong>.
        Keep them somewhere safe.
      </p>
    </header>

    <!-- Policy mini-card. Essentials only. -->
    <article class="policy-card">
      <dl class="rows">
        <div class="row">
          <dt>Policy number</dt>
          <dd>{{ policyId || '—' }}</dd>
        </div>
        <div class="row">
          <dt>Vehicle</dt>
          <dd>{{ vehicleLine }}</dd>
        </div>
        <div class="row">
          <dt>Cover period</dt>
          <dd>{{ periodLine }}</dd>
        </div>
        <div class="row">
          <dt>Paid</dt>
          <dd>{{ amountLabel }} · {{ termLabel }}</dd>
        </div>
        <div class="row">
          <dt>Method</dt>
          <dd>{{ paymentMethodLabel }}</dd>
        </div>
        <div class="row">
          <dt>Issued</dt>
          <dd>{{ issuedAt || '—' }}</dd>
        </div>
      </dl>
    </article>

    <!-- What's next: three small steps, scannable. -->
    <section class="next">
      <h2 class="next-title">A few small things to do</h2>
      <ol class="next-list">
        <li>
          <strong>Check your email.</strong>
          The policy and Certificate of Insurance are in your inbox.
          Forward the Certificate to LTA if your vehicle is financed.
        </li>
        <li>
          <strong>Save our 24-hour claims line:</strong>
          <a href="tel:+6562218688" class="phone">+65 6221 8688</a>.
          Add it to your phone now so it's there when you need it.
        </li>
        <li>
          <strong>Drive carefully.</strong>
          Your No Claim Discount grows by 10% each claim-free year, up to 50%.
        </li>
      </ol>
    </section>

    <!-- CTAs -->
    <div class="cta-row">
      <button type="button" class="primary-btn" @click="downloadPolicy">
        <i class="pi pi-download" aria-hidden="true"></i>
        Download policy PDF
      </button>
      <button type="button" class="ghost-btn" @click="goHome">
        Back to home
      </button>
    </div>

    <p class="help">
      Need a hand? Email
      <a href="mailto:hello@budgetdirect.com.sg" class="link">hello@budgetdirect.com.sg</a>
      or call us on the line above.
    </p>
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero — restrained: green check + dark headline + grey lede. */
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}
.check-wrap {
  margin-bottom: 4px;
}
.hero-eyebrow {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bdi-green);
}
.hero-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--bdi-carbon);
}
.hero-lede {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
  max-width: 60ch;
}
.hero-lede strong {
  font-weight: 700;
  word-break: break-all;
}

/* Policy mini-card. White, subtle border + light shadow. */
.policy-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06);
}
.rows {
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
  word-break: break-word;
}

/* Next-steps block. Flat, no card, ordered list. */
.next {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.next-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.next-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.55;
}
.next-list strong { font-weight: 700; }
.phone {
  color: var(--bdi-cyan);
  text-decoration: underline;
  font-weight: 700;
}

.cta-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.primary-btn:hover { filter: brightness(1.05); }
.primary-btn .pi { font-size: 14px; }

.ghost-btn {
  background: transparent;
  border: 0;
  padding: 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-cyan);
  cursor: pointer;
}
.ghost-btn:hover { text-decoration: underline; }

.help {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.5;
}
.help .link {
  color: var(--bdi-cyan);
  text-decoration: underline;
  font-weight: 600;
}
</style>
