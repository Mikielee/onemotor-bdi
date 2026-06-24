<script setup>
/**
 * Step 15 — Payment Options (OMP-654).
 * Figma BD mobile reference: 5089-3139 canvas → 5584:9517 default, 5584:9706
 * instalment state.
 *
 * Two cards:
 *   1. Select your payment option: Single (Save 3% badge) / Instalment.
 *      Mirrors Step 9's payment-term selection — if user already picked
 *      Single on Step 9 this lands selected here. Changing here updates
 *      the store so BdiQuoteFooter and the Step 9 quote stay in sync.
 *   2. Payment method.
 *        Single  → Credit card OR PayNow (two cards side-by-side)
 *        Instalment → Credit card only, plus required bank pick (UOB / DBS / OCBC)
 *
 * "Pay" routes:
 *   - PayNow → Step 16 (PayNow QR)
 *   - Credit card → Step 17 (simulated gateway success — real flow redirects
 *     to the gateway and webhooks the result)
 */
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()
const router = useRouter()

const local = reactive({
  paymentTerm: quote.quoteSelection?.paymentTerm ?? 'single',
  paymentMethod: quote.payment?.method ?? '',
  bank: quote.payment?.bank ?? '',
})

function sync() {
  mutable.quoteSelection = {
    ...mutable.quoteSelection,
    paymentTerm: local.paymentTerm,
  }
  mutable.payment = {
    method: local.paymentMethod,
    bank: local.bank,
  }
}

function setTerm(v) {
  local.paymentTerm = v
  // Instalment supports credit card only — drop a PayNow pick if user
  // had selected it under Single.
  if (v === 'instalment' && local.paymentMethod === 'paynow') {
    local.paymentMethod = ''
  }
  // Conversely, switching back to Single shouldn't strand the bank.
  if (v === 'single') local.bank = ''
  sync()
}

function setMethod(v) {
  local.paymentMethod = v
  // PayNow has no bank concept.
  if (v === 'paynow') local.bank = ''
  sync()
}

function setBank(v) {
  local.bank = v
  sync()
}

const isInstalment = computed(() => local.paymentTerm === 'instalment')

// Bank options for instalment plans — covers ~95% of SG car instalment
// volume per the OMP-654 brief.
const banks = [
  { value: 'uob', label: 'UOB' },
  { value: 'dbs', label: 'DBS' },
  { value: 'ocbc', label: 'OCBC' },
]

const canPay = computed(() => {
  if (!local.paymentMethod) return false
  if (isInstalment.value && !local.bank) return false
  return true
})

function onPay() {
  if (!canPay.value) return
  if (local.paymentMethod === 'paynow') router.push('/step/16')
  else router.push('/step/17')
}
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Payment</h1>

    <!-- Card 1 — payment term -->
    <article class="card">
      <h2 class="card-title">Select your payment option</h2>
      <div class="term-row">
        <button
          type="button"
          class="term-pill"
          :class="{ 'is-on': !isInstalment }"
          :aria-pressed="!isInstalment"
          @click="setTerm('single')"
        >
          <span class="term-label">Single</span>
          <span class="save-badge">Save 3%</span>
        </button>
        <button
          type="button"
          class="term-pill"
          :class="{ 'is-on': isInstalment }"
          :aria-pressed="isInstalment"
          @click="setTerm('instalment')"
        >
          <span class="term-label">Instalment</span>
        </button>
      </div>
    </article>

    <!-- Card 2 — payment method -->
    <article class="card">
      <h2 class="card-title">Payment method</h2>

      <p v-if="isInstalment" class="method-helper">
        Credit card only
        <span class="card-brands inline">
          <span class="brand brand-amex">AMEX</span>
          <span class="brand brand-mc">MC</span>
          <span class="brand brand-visa">VISA</span>
        </span>
      </p>

      <div v-if="!isInstalment" class="method-row">
        <button
          type="button"
          class="method-card"
          :class="{ 'is-on': local.paymentMethod === 'card' }"
          @click="setMethod('card')"
        >
          <span class="card-brands">
            <span class="brand brand-amex">AMEX</span>
            <span class="brand brand-mc">MC</span>
            <span class="brand brand-visa">VISA</span>
          </span>
        </button>
        <button
          type="button"
          class="method-card"
          :class="{ 'is-on': local.paymentMethod === 'paynow' }"
          @click="setMethod('paynow')"
        >
          <span class="paynow-logo">PAY<span class="paynow-now">NOW</span></span>
        </button>
      </div>

      <!-- Instalment path: bank picker. Selecting a bank auto-locks
           paymentMethod to card. -->
      <div v-else class="bank-row">
        <button
          v-for="b in banks"
          :key="b.value"
          type="button"
          class="bank-card"
          :class="{ 'is-on': local.bank === b.value }"
          @click="setBank(b.value); setMethod('card')"
        >
          <span :class="['bank-mark', `bank-${b.value}`]">{{ b.label }}</span>
        </button>
      </div>
    </article>

    <p class="secure-note">
      <i class="pi pi-lock" aria-hidden="true"></i>
      You'll be directed to our secure payment gateway.
    </p>

    <BdiQuoteFooter
      :disabled="!canPay"
      :intercept-next="true"
      next-label="Pay"
      @next="onPay"
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

/* Card — two of these on this page. Light shadow, 1px grey border. */
.card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.card-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.3;
}

/* Payment-term pills */
.term-row {
  display: flex;
  gap: 12px;
}
.term-pill {
  flex: 1 1 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 8px;
  padding: 16px;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.term-pill.is-on { border-color: var(--bdi-green); }
.term-label { line-height: 1; }
.save-badge {
  background: rgba(0, 154, 68, 0.12);
  color: var(--bdi-green);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 100px;
  line-height: 1;
}

/* Method cards on the Single path — two big tappable cards */
.method-row {
  display: flex;
  gap: 12px;
}
.method-card {
  flex: 1 1 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 8px;
  padding: 16px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.method-card.is-on { border-color: var(--bdi-green); }

/* Card brand placeholders. Inline text styled to feel like logos without
   the legal weight of real brand assets in a prototype. */
.card-brands {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.card-brands.inline { margin-left: 8px; }
.brand {
  display: inline-block;
  padding: 3px 6px;
  font-family: var(--bdi-font);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1;
  border-radius: 3px;
  color: #fff;
}
.brand-amex { background: #2E77BB; }
.brand-mc   { background: #EB001B; }
.brand-visa { background: #1A1F71; }

/* PayNow brand placeholder — purple wordmark. */
.paynow-logo {
  font-family: var(--bdi-font);
  font-size: 22px;
  font-weight: 900;
  color: #6F2C8E;
  letter-spacing: 0.02em;
}
.paynow-now { color: #C8133D; }

/* Instalment path */
.method-helper {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  display: flex;
  align-items: center;
  gap: 4px;
}
.bank-row {
  display: flex;
  gap: 12px;
}
.bank-card {
  flex: 1 1 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 8px;
  padding: 16px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bank-card.is-on { border-color: var(--bdi-green); }
.bank-mark {
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.03em;
}
.bank-uob { color: #D31145; }
.bank-dbs { color: #C8133D; }
.bank-ocbc { color: #D7141A; }

/* Lock + secure-gateway helper line */
.secure-note {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.4;
}
.secure-note .pi { font-size: 16px; }
</style>
