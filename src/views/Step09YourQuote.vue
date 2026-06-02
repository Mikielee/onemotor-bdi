<script setup>
/**
 * Step 9 — Your Quote.
 * Figma references:
 *   - Mobile layout (whole page):   4189-8932
 *   - Coverage expanded state:      4148-3290
 *   - Billing toggle annual/monthly: 4719-3438
 *
 * Step 9 has its own sticky footer (3-column: Back / mini-price / Buy now)
 * so it doesn't use the shared <StickyNext>; it renders the footer inline.
 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import { useQuote } from '../store/quote'
import { formatMoney, formatMoneySigned } from '../utils/money'

const { quote, mutable } = useQuote()
const router = useRouter()

const local = reactive({
  billingCycle: quote.quoteSelection?.billingCycle || 'annual',
  excess: quote.quoteSelection?.excess ?? 600,
  promoCode: quote.quoteSelection?.promoCode || '',
  appliedPromo: null,
  promoError: '',
  coverageExpanded: false,
  // Sticky-footer expand state (Figma 4754-5410). When true, shows the
  // Annual/Monthly toggle + mini-breakdown above the Back/Price/Buy row.
  stickyExpanded: false,
})

// Pricing model: base subtotal pre-GST, GST at 9%, annual mode gets a 3%
// "annual payment discount" (displayed as "Included" rather than a money
// value, to match Figma 4189-8932).
const baseSubtotal = 240.0
const gstRate = 0.09
const annualDiscountRate = 0.03

// Excess deltas from Figma 4189-8932. $600 is the default.
const excessOptions = [
  { value: 0,    label: '$0',     delta: 50,  kind: 'up' },
  { value: 500,  label: '$500',   delta: 10,  kind: 'up' },
  { value: 600,  label: '$600',   delta: 0,   kind: 'default' },
  { value: 800,  label: '$800',   delta: -20, kind: 'down' },
  { value: 1000, label: '$1,000', delta: -30, kind: 'down' },
  { value: 1500, label: '$1,500', delta: -50, kind: 'down' },
]

function deltaLabel(o) {
  if (o.kind === 'default') return 'Default'
  return `${formatMoneySigned(o.delta)}/yr`
}

function sync() {
  mutable.quoteSelection = {
    billingCycle: local.billingCycle,
    excess: local.excess,
    promoCode: local.appliedPromo ? local.appliedPromo.code : '',
  }
}

function setBilling(v) { local.billingCycle = v; sync() }
function setExcess(v) { local.excess = v; sync() }

// Medical expenses line appears if the customer picked the Personal Accident
// optional benefit on step 11.
const hasPersonalAccident = computed(() =>
  (quote.optionalBenefits || []).includes('personal-accident')
)
const medicalExpenses = computed(() => hasPersonalAccident.value ? 80.0 : 0)

const subtotalWithAdjust = computed(() => {
  const excessAdj = excessOptions.find((e) => e.value === local.excess)?.delta ?? 0
  return baseSubtotal + excessAdj + medicalExpenses.value
})
const gstAmount = computed(() => subtotalWithAdjust.value * gstRate)
const annualTotal = computed(() => {
  const t = subtotalWithAdjust.value + gstAmount.value
  // Annual mode applies the 3% discount; monthly mode doesn't.
  return local.billingCycle === 'annual' ? t * (1 - annualDiscountRate) : t
})
const monthlyValue = computed(() => annualTotal.value / 12)

const heroAmount = computed(() =>
  local.billingCycle === 'monthly' ? formatMoney(monthlyValue.value) : formatMoney(annualTotal.value)
)
const heroUnit = computed(() =>
  local.billingCycle === 'monthly' ? 'per month (incl. GST)' : 'per year (incl. GST)'
)

// Coverage rows — Figma 4148-3290. Each row has a label, a `value` that
// either shows a string ("Unlimited cover", "up to $5,000,000") or, when
// `included` is true, renders a green check icon instead.
const coverageRows = [
  { label: 'Injury or death to someone else', value: 'Unlimited cover' },
  { label: "Damage to other people's property", value: 'up to $5,000,000' },
  { label: 'Legal costs against criminal charges', value: 'up to $3,000' },
  { label: 'Towing after an accident', value: '$500 for overseas tow and $200 for local tow' },
  { label: 'Damage by fire', included: true },
  { label: 'Damage or loss to your car due to theft', included: true },
  { label: 'Damage to your car if someone else crashes into you', included: true },
  { label: "Damage to your car when it's your fault", included: true },
  { label: 'Damage by fallen trees, flood, storms or natural disaster', included: true },
  { label: 'Damage by vandals', included: true },
  { label: 'Damage to windscreen or windows', included: true },
]
const visibleCoverage = computed(() =>
  local.coverageExpanded ? coverageRows : coverageRows.slice(0, 5)
)

// Promo logic. Mock valid code: SAVEMORE -> $50 eCapitaVoucher (no premium impact).
function applyPromo() {
  const code = local.promoCode.trim()
  if (!code) return
  if (code.toLowerCase() === 'savemore') {
    local.appliedPromo = {
      code: 'SAVEMORE',
      benefit: 'Enjoy your $50 eCapitavoucher',
    }
    local.promoError = ''
    local.promoCode = ''
    sync()
  } else {
    local.promoError = 'This promo code is invalid or cannot be combined with other promo codes!'
  }
}
function removePromo() {
  local.appliedPromo = null
  local.promoError = ''
  sync()
}
function onPromoInput() { if (local.promoError) local.promoError = '' }

// Email quote — Figma shows a single cyan-outlined CTA. Editing/sent states
// keep the same flow as before, just behind that button.
const emailState = ref('idle') // 'idle' | 'editing' | 'sent'
const emailValue = ref(quote.contact?.email || '')

function startEmail() { emailState.value = 'editing' }
function submitEmail() {
  if (!emailValue.value) return
  emailState.value = 'sent'
}
function resetEmail() { emailState.value = 'idle' }

const carLine = computed(() => {
  const parts = []
  if (quote.carMake) parts.push(quote.carMake)
  if (quote.carModel) parts.push(quote.carModel)
  if (quote.carYear) parts.push(quote.carYear)
  return parts.length ? parts.join(' ') : 'Your car'
})

// Sticky footer.
function onBack() { router.back() }
function onBuy() { /* placeholder — flow ends here in the prototype */ }

// Mini-price on the sticky bar: green amount + " / year" inline, then
// "(incl. GST)" line below.
const stickyAmount = computed(() => formatMoney(
  local.billingCycle === 'monthly' ? monthlyValue.value : annualTotal.value
))
const stickyUnit = computed(() =>
  local.billingCycle === 'monthly' ? '/ month' : '/ year'
)
</script>

<template>
  <section class="step">
    <!-- Hero quote card -->
    <div class="quote-card">
      <div class="billing-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'annual' }"
          :aria-selected="local.billingCycle === 'annual'"
          @click="setBilling('annual')"
        >Annual</button>
        <button
          type="button"
          role="tab"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'monthly' }"
          :aria-selected="local.billingCycle === 'monthly'"
          @click="setBilling('monthly')"
        >Monthly</button>
      </div>

      <div class="price-block">
        <p class="price">{{ heroAmount }}</p>
        <p class="price-sub">{{ heroUnit }}</p>
        <p v-if="local.billingCycle === 'monthly'" class="price-total">
          Total: {{ formatMoney(annualTotal) }}
        </p>
      </div>

      <div class="breakdown">
        <div class="row">
          <span>Subtotal</span>
          <span>{{ formatMoney(subtotalWithAdjust - medicalExpenses) }}</span>
        </div>
        <div v-if="hasPersonalAccident" class="row">
          <span>Medical expenses</span>
          <span>{{ formatMoney(medicalExpenses) }}</span>
        </div>
        <div class="row">
          <span>GST (9%)</span>
          <span>{{ formatMoney(gstAmount) }}</span>
        </div>
        <div v-if="local.billingCycle === 'annual'" class="row green">
          <span>Annual payment 3% discount</span>
          <span>Included</span>
        </div>
        <div v-if="local.appliedPromo" class="row green">
          <span>Promo ({{ local.appliedPromo.code }})</span>
          <span>{{ local.appliedPromo.benefit }}</span>
        </div>
      </div>
    </div>

    <!-- Quote ID / Save & email -->
    <div class="meta-card">
      <p class="meta-id">Quote ID: P11254149R00</p>
      <div class="meta-body">
        <p><strong>Comprehensive Car Insurance</strong></p>
        <p>{{ carLine }}</p>
      </div>

      <button
        v-if="emailState === 'idle'"
        type="button"
        class="email-cta"
        @click="startEmail"
      >Save &amp; Email Quote</button>

      <div v-else-if="emailState === 'editing'" class="email-edit">
        <InputText
          v-model="emailValue"
          placeholder="your@email.com"
          class="email-input"
        />
        <button type="button" class="email-submit" @click="submitEmail">Email quote</button>
      </div>

      <div v-else class="email-sent">
        <i class="pi pi-check-circle" aria-hidden="true"></i>
        <span>Your quote has been sent to <strong>{{ emailValue }}</strong></span>
        <button type="button" class="email-undo" @click="resetEmail" aria-label="Edit again">
          <i class="pi pi-pencil"></i>
        </button>
      </div>
    </div>

    <!-- Choose your excess -->
    <div class="excess">
      <h2 class="h-sm">Choose your excess</h2>
      <p class="block-desc">
        The amount you pay towards a claim. A higher excess means a lower premium.
        <i class="pi pi-info-circle desc-info" aria-hidden="true"></i>
      </p>
      <div class="excess-grid">
        <button
          v-for="o in excessOptions"
          :key="o.value"
          type="button"
          class="excess-card"
          :class="{ 'is-selected': local.excess === o.value }"
          @click="setExcess(o.value)"
        >
          <span class="excess-amount">{{ o.label }}</span>
          <span class="excess-delta" :class="{
            'd-up': o.kind === 'up',
            'd-down': o.kind === 'down',
            'd-default': o.kind === 'default',
          }">{{ deltaLabel(o) }}</span>
        </button>
      </div>
    </div>

    <!-- Promotions -->
    <div class="promo">
      <h2 class="h-sm">Promotions</h2>

      <div v-if="local.appliedPromo" class="promo-applied">
        <i class="pi pi-check-circle" aria-hidden="true"></i>
        <div class="promo-applied-body">
          <p class="promo-applied-code">{{ local.appliedPromo.code }}</p>
          <p class="promo-applied-benefit">{{ local.appliedPromo.benefit }}</p>
        </div>
        <button type="button" class="promo-remove" aria-label="Remove promo" @click="removePromo">
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <template v-else>
        <div class="promo-row">
          <InputText
            v-model="local.promoCode"
            @update:model-value="onPromoInput"
            placeholder="Enter Promo Code"
            class="promo-input"
            :class="{ 'is-error': local.promoError }"
            @keyup.enter="applyPromo"
          />
          <button type="button" class="promo-apply" @click="applyPromo">Apply</button>
        </div>
        <p v-if="local.promoError" class="bdi-inline-error">{{ local.promoError }}</p>
      </template>
    </div>

    <!-- Coverage Details -->
    <div class="coverage">
      <h2 class="h-sm">Coverage Details</h2>
      <p class="block-desc">Included in your comprehensive plan</p>

      <div class="cov-table">
        <div
          v-for="(r, i) in visibleCoverage"
          :key="r.label"
          class="cov-row"
          :class="{ 'is-first': i === 0 }"
        >
          <div class="cov-label">
            <span>{{ r.label }}</span>
            <i class="pi pi-chevron-down cov-row-toggle" aria-hidden="true"></i>
          </div>
          <div class="cov-value" :class="{ 'is-check': r.included }">
            <i v-if="r.included" class="pi pi-check-circle cov-check" aria-hidden="true"></i>
            <span v-else>{{ r.value }}</span>
          </div>
        </div>

        <button type="button" class="cov-toggle" @click="local.coverageExpanded = !local.coverageExpanded">
          {{ local.coverageExpanded ? 'See less covers' : 'See more covers' }}
        </button>
      </div>

      <p class="cov-footnote">
        For more details, refer to our <a href="#">policy wording</a>.
      </p>
    </div>

    <!-- Step-9 sticky footer (Figma 4754-5410)
         Collapsed: handle + 3-col row (Back / mini-price / Buy now).
         Expanded: handle + Annual/Monthly toggle + mini-breakdown + 3-col row.
         The page footer's own border-top draws the hairline below the
         sticky in both states. -->
    <div class="sticky-footer" :class="{ 'is-expanded': local.stickyExpanded }">
      <button
        type="button"
        class="sticky-handle"
        :aria-label="local.stickyExpanded ? 'Hide price details' : 'Show price details'"
        :aria-expanded="local.stickyExpanded"
        @click="local.stickyExpanded = !local.stickyExpanded"
      >
        <i
          :class="local.stickyExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
          aria-hidden="true"
        ></i>
      </button>

      <!-- Expanded panel: Annual/Monthly toggle + mini breakdown -->
      <div v-if="local.stickyExpanded" class="sticky-expanded">
        <div class="billing-toggle" role="tablist" aria-label="Billing cycle">
          <button
            type="button"
            role="tab"
            class="bt-button"
            :class="{ 'is-on': local.billingCycle === 'annual' }"
            :aria-selected="local.billingCycle === 'annual'"
            @click="setBilling('annual')"
          >Annual</button>
          <button
            type="button"
            role="tab"
            class="bt-button"
            :class="{ 'is-on': local.billingCycle === 'monthly' }"
            :aria-selected="local.billingCycle === 'monthly'"
            @click="setBilling('monthly')"
          >Monthly</button>
        </div>

        <div class="sticky-breakdown">
          <p class="sb-title">Comprehensive</p>
          <div class="sb-row">
            <span>Subtotal</span><span>{{ formatMoney(baseSubtotal) }}</span>
          </div>
          <div v-if="hasPersonalAccident" class="sb-row">
            <span>Medical expenses</span><span>{{ formatMoney(medicalExpenses) }}</span>
          </div>
          <div v-if="local.billingCycle === 'annual'" class="sb-row sb-discount">
            <span>Annual payment 3% discount</span><span>Included</span>
          </div>
        </div>
      </div>

      <!-- Back / mini-price / Buy now row -->
      <div class="sticky-bar">
        <button type="button" class="sticky-back" aria-label="Go back" @click="onBack">
          <i class="pi pi-chevron-left" aria-hidden="true"></i>
        </button>

        <div class="sticky-price">
          <p class="sp-amount">
            <span class="sp-green">{{ stickyAmount }}</span>
            <span class="sp-unit">{{ stickyUnit }}</span>
          </p>
          <p class="sp-gst">(incl. GST)</p>
        </div>

        <button type="button" class="sticky-buy" @click="onBuy">Buy now</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.step {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* No padding-bottom: the sticky-footer's own padding owns that space,
     and it docks to the bottom via margin-top:auto so it sits flush above
     the page footer. */
}

.h-sm { font-size: 16px; font-weight: 900; color: var(--bdi-carbon); margin: 0; }
.block-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.desc-info {
  color: var(--bdi-carbon);
  font-size: 14px;
  margin-left: 4px;
  vertical-align: middle;
}

/* ============ Hero quote card ============ */
.quote-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 17px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.billing-toggle {
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: 999px;
  padding: 3px;
  display: flex;
  gap: 2px;
  height: 43px;
}
.bt-button {
  flex: 1;
  background: transparent;
  border: 0;
  border-radius: 999px;
  padding: 0 12px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 12px;
  line-height: 16.5px;
  color: var(--bdi-carbon);
  cursor: pointer;
  text-transform: capitalize;
}
.bt-button.is-on {
  background: var(--bdi-carbon);
  color: #fff;
  box-shadow: 0 1px 1.5px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.1);
}

.price-block { text-align: center; display: flex; flex-direction: column; gap: 4px; }
.price {
  margin: 0;
  font-size: 36px;
  font-weight: 900;
  color: var(--bdi-green);
  line-height: 1;
}
.price-sub {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.price-total {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
}

.breakdown { display: flex; flex-direction: column; gap: 8px; }
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.row.green { color: var(--bdi-green); }

/* ============ Quote ID / Save & email ============ */
.meta-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 17px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.meta-id { margin: 0; font-size: 16px; font-weight: 900; color: var(--bdi-carbon); }
.meta-body {
  border-left: 1px solid var(--bdi-grey-200);
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-body p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 16px;
}

.email-cta {
  background: #fff;
  border: 1px solid var(--bdi-cyan);
  color: var(--bdi-cyan);
  border-radius: var(--bdi-radius-card);
  padding: 8px;
  font-family: var(--bdi-font);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  min-height: 33px;
}
.email-cta:hover { background: rgba(0,142,170,0.05); }

.email-edit { display: flex; align-items: stretch; }
.email-edit :deep(.email-input) {
  flex: 1;
  border-color: var(--bdi-green);
  border-right: 0;
  border-radius: 8px 0 0 8px !important;
  min-height: 44px;
  font-size: 14px !important;
}
.email-submit {
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 0 8px 8px 0;
  padding: 0 16px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.email-sent {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--bdi-carbon);
}
.email-sent .pi-check-circle { color: var(--bdi-green); font-size: 18px; flex-shrink: 0; }
.email-sent strong { font-weight: 900; word-break: break-all; }
.email-undo {
  margin-left: auto;
  background: transparent;
  border: 0;
  color: var(--bdi-cyan);
  cursor: pointer;
  padding: 4px;
}

/* ============ Choose your excess ============ */
.excess { display: flex; flex-direction: column; gap: 8px; }
.excess-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.excess-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-family: var(--bdi-font);
  cursor: pointer;
}
.excess-card.is-selected { border-color: var(--bdi-green); }
.excess-amount { font-size: 16px; font-weight: 700; color: var(--bdi-carbon); }
.excess-delta { font-size: 12px; font-weight: 500; }
.d-up { color: var(--bdi-red); }
.d-down { color: var(--bdi-green); }
.d-default { color: var(--bdi-carbon); }

/* ============ Promotions ============ */
.promo { display: flex; flex-direction: column; gap: 24px; }
.promo-row { display: flex; align-items: stretch; }
.promo-row :deep(.promo-input) {
  flex: 1;
  border-color: var(--bdi-grey-300);
  border-right: 0;
  border-radius: 8px 0 0 8px !important;
  min-height: 48px;
  font-size: 16px !important;
}
.promo-row :deep(.promo-input.is-error) { border-color: var(--bdi-red); }
.promo-row :deep(.promo-input:focus-within),
.promo-row :deep(.promo-input.p-focus) { border-color: var(--bdi-green); }
.promo-apply {
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 0 8px 8px 0;
  padding: 12px 20px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  min-height: 48px;
}

.promo-applied {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 12px 14px;
}
.promo-applied .pi-check-circle { color: var(--bdi-green); font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.promo-applied-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.promo-applied-code { margin: 0; font-size: 14px; font-weight: 900; color: var(--bdi-carbon); }
.promo-applied-benefit { margin: 0; font-size: 12px; font-weight: 500; color: var(--bdi-carbon); }
.promo-remove {
  background: transparent;
  border: 0;
  color: var(--bdi-grey-600);
  cursor: pointer;
  padding: 4px;
}

/* ============ Coverage Details ============
   Figma 4148-3290 / 4189-9187: a 2-column table where the LEFT column
   (~200px) is white with the label + arrow-down icon, and the RIGHT
   column is Grey-100 with either text or a green check icon. */
.coverage { display: flex; flex-direction: column; gap: 8px; }
.cov-table { display: flex; flex-direction: column; }

.cov-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  /* Each row owns its top border; the first row's top border becomes the
     table's top edge via rounded corners on the row itself. */
  border-left: 1px solid var(--bdi-grey-200);
  border-right: 1px solid var(--bdi-grey-200);
}
.cov-row:first-child {
  border-top: 1px solid var(--bdi-grey-200);
  border-top-left-radius: var(--bdi-radius-card);
  border-top-right-radius: var(--bdi-radius-card);
}
.cov-row:first-child .cov-label { border-top-left-radius: var(--bdi-radius-card); }
.cov-row:first-child .cov-value { border-top-right-radius: var(--bdi-radius-card); }

.cov-label {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 20px;
}
.cov-label > span { flex: 1; }
.cov-row-toggle { color: var(--bdi-carbon); font-size: 12px; margin-top: 4px; }

.cov-value {
  background: var(--bdi-grey-100);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  text-align: center;
  line-height: 20px;
}
.cov-check { color: var(--bdi-green); font-size: 24px; }

.cov-toggle {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: 0 0 var(--bdi-radius-card) var(--bdi-radius-card);
  padding: 8px 16px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-cyan);
  cursor: pointer;
  text-align: center;
}

.cov-footnote {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 20px;
}
.cov-footnote a { color: var(--bdi-cyan); }

/* ============ Step-9 sticky footer (custom) ============
   Figma 4428-3354: 3-column layout with Back / mini-price / Buy now,
   white card with a top drop-shadow and an up-arrow handle on top edge.

   Layout note: stays in the normal document flow with `margin-top: auto`
   so it docks to the bottom of the .step flex container and sits FLUSH
   above the page footer (no gap). Same pattern as the shared StickyNext
   component — see its .sticky-cta rule. Don't use `position: sticky`
   here; that would dock to the viewport bottom and create a visible gap
   between the sticky bar and the page footer at the end of scroll. */
.sticky-footer {
  position: relative;
  margin: auto -16px 0 -16px;
  background: #fff;
  border-top-left-radius: var(--bdi-radius-card);
  border-top-right-radius: var(--bdi-radius-card);
  box-shadow: 0 -10px 7.5px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

/* Expanded panel sits above the bar row. */
.sticky-expanded {
  padding: 24px 16px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top-left-radius: var(--bdi-radius-card);
  border-top-right-radius: var(--bdi-radius-card);
}

/* Bar row (Back / mini-price / Buy now). When expanded, a 1px hairline
   separates the expanded panel from the bar row. When collapsed, the bar
   row sits flush against the page footer (which draws its own top border
   for the divider between sticky and footer). */
.sticky-bar {
  padding: 24px 16px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.sticky-footer.is-expanded .sticky-bar {
  padding-top: 16px;
  border-top: 1px solid var(--bdi-grey-200);
}

/* Mini Annual/Monthly toggle inside the expanded panel — same visual
   language as the in-card billing pill, just full-width. */
.sticky-expanded .billing-toggle {
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: 33554400px;
  height: 43px;
  padding: 3px;
  display: flex;
  gap: 2px;
}
.sticky-expanded .bt-button {
  flex: 1;
  border: 0;
  border-radius: 33554400px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 12px;
  line-height: 16.5px;
  text-transform: capitalize;
  color: var(--bdi-carbon);
  background: transparent;
  cursor: pointer;
}
.sticky-expanded .bt-button.is-on {
  background: var(--bdi-carbon);
  color: #fff;
  box-shadow: 0 1px 1.5px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* Mini breakdown card inside the expanded panel — Grey-100 fill, 8px
   radius, rows of label / value (14px 500 Carbon). Annual discount row
   shows the value text in green. */
.sticky-breakdown {
  background: var(--bdi-grey-100);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 16px;
}
.sb-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 16px;
}
.sb-discount { color: var(--bdi-green); }
.sb-discount span { color: var(--bdi-green); }

.sticky-handle {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bdi-carbon);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.sticky-handle .pi { font-size: 14px; }

.sticky-back,
.sticky-buy {
  flex: 0 0 70px;
  width: 70px;
  height: 48px;
  border-radius: var(--bdi-radius-card);
  cursor: pointer;
  font-family: var(--bdi-font);
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1);
}
.sticky-back {
  background: #fff;
  border: 1px solid var(--bdi-carbon);
  color: var(--bdi-carbon);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.sticky-back .pi { font-size: 16px; }
.sticky-buy {
  background: var(--bdi-green);
  border: 0;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 0 4px;
  line-height: 1.1;
}

.sticky-price {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.sp-amount {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.sp-green {
  color: var(--bdi-green);
  font-size: 22px;
  font-weight: 900;
  line-height: 28px;
}
.sp-unit {
  color: var(--bdi-carbon);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
.sp-gst {
  margin: 0;
  color: var(--bdi-carbon);
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
}
</style>
