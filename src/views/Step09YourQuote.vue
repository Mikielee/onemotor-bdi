<script setup>
import { computed, reactive, ref } from 'vue'
import InputText from 'primevue/inputtext'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'
import { formatMoney, formatMoneySigned } from '../utils/money'

const { quote, mutable } = useQuote()

const local = reactive({
  billingCycle: quote.quoteSelection?.billingCycle || 'annual',
  excess: quote.quoteSelection?.excess ?? 600,
  promoCode: quote.quoteSelection?.promoCode || '',
  appliedPromo: null,
  promoError: '',
  coverageExpanded: false,
})

const basePrice = 1024.0

// Excess → annual premium delta. $600 is default → no change.
// All other values change the final annual premium.
const excessOptions = [
  { value: 0,    label: '$0',     delta: 120,  kind: 'up'   },
  { value: 500,  label: '$500',   delta: 30,   kind: 'up'   },
  { value: 600,  label: '$600',   delta: 0,    kind: 'default' },
  { value: 800,  label: '$800',   delta: -45,  kind: 'down' },
  { value: 1000, label: '$1,000', delta: -75,  kind: 'down' },
  { value: 1500, label: '$1,500', delta: -135, kind: 'down' },
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

const annualPremium = computed(() => {
  const excessAdj = excessOptions.find(e => e.value === local.excess)?.delta ?? 0
  const promoDiscount = local.appliedPromo ? local.appliedPromo.discount : 0
  return basePrice + excessAdj - promoDiscount
})

const displayPrice = computed(() => {
  const annual = annualPremium.value
  const value = local.billingCycle === 'monthly' ? annual / 12 : annual
  return formatMoney(value)
})

const currentDelta = computed(() =>
  excessOptions.find((e) => e.value === local.excess)?.delta ?? 0
)

const priceUnit = computed(() => local.billingCycle === 'monthly' ? 'per month' : 'per year')

// Coverage rows — Figma 4148-3290 (Comprehensive cover summary).
// Note: collapsed default shows 5; expanded shows all 11.
const coverageRows = [
  { label: 'Injury or death to someone else', value: 'Unlimited cover' },
  { label: "Damage to other people's property", value: 'up to $5,000,000' },
  { label: 'Legal costs against criminal charges', value: 'up to $3,000' },
  { label: 'Towing after an accident', value: '$500 overseas / $200 local' },
  { label: 'Damage by fire', value: 'Included' },
  { label: 'Damage or loss to your car due to theft', value: 'Included' },
  { label: 'Damage to your car if someone else crashes into you', value: 'Included' },
  { label: "Damage to your car when it's your fault", value: 'Included' },
  { label: 'Damage by fallen trees, flood, storms or natural disaster', value: 'Included' },
  { label: 'Damage by vandals', value: 'Included' },
  { label: 'Damage to windscreen or windows', value: 'Included' },
]
const visibleCoverage = computed(() =>
  local.coverageExpanded ? coverageRows : coverageRows.slice(0, 5)
)

// Promo logic. Mock valid code: SAVEMORE (case insensitive) gives $50 eCapitaVoucher (no premium reduction).
function applyPromo() {
  const code = local.promoCode.trim()
  if (!code) return
  if (code.toLowerCase() === 'savemore') {
    local.appliedPromo = {
      code: 'SAVEMORE',
      benefit: 'Enjoy your $50 eCapitavoucher',
      discount: 0,
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

function onPromoInput() {
  if (local.promoError) local.promoError = ''
}

// Save & email quote flow — Figma 4280-2679.
const emailState = ref('link') // 'link' | 'editing' | 'sent'
const emailValue = ref(quote.contact?.email || 'you@example.com')

function startEmail() { emailState.value = 'editing' }
function submitEmail() {
  if (!emailValue.value) return
  emailState.value = 'sent'
}
function resetEmail() {
  emailState.value = 'link'
}

const carLine = computed(() => {
  const parts = []
  if (quote.carYear) parts.push(quote.carYear)
  if (quote.carMake) parts.push(quote.carMake)
  if (quote.carModel) parts.push(quote.carModel)
  return parts.length ? parts.join(' ') : 'Your car'
})
</script>

<template>
  <section class="step">
    <div class="quote-card">
      <div class="billing-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'annual' }"
          @click="setBilling('annual')"
        >Annual</button>
        <button
          type="button"
          role="tab"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'monthly' }"
          @click="setBilling('monthly')"
        >Monthly</button>
      </div>

      <div class="price-block">
        <p class="price">{{ displayPrice }}</p>
        <p class="price-sub">{{ priceUnit }} (incl. GST)</p>
      </div>

      <div class="breakdown">
        <div class="row"><span>Premium</span><span>{{ formatMoney(basePrice) }}</span></div>
        <div class="row" v-if="local.excess !== 600">
          <span>Excess adjustment ({{ excessOptions.find(e => e.value === local.excess)?.label }})</span>
          <span :class="{ green: currentDelta < 0 }">{{ formatMoneySigned(currentDelta) }}</span>
        </div>
        <div class="row" v-if="local.appliedPromo">
          <span>Promo ({{ local.appliedPromo.code }})</span>
          <span class="green">{{ local.appliedPromo.benefit }}</span>
        </div>
        <div class="row total"><span>Total</span><span>{{ formatMoney(annualPremium) }}</span></div>
      </div>
    </div>

    <div class="meta-card">
      <p class="meta-id">Quote ID: P11254149R00</p>
      <div class="meta-body">
        <p><strong>Comprehensive Car Insurance</strong></p>
        <p>{{ carLine }}</p>
      </div>

      <div class="email-action">
        <button v-if="emailState === 'link'" type="button" class="email-link" @click="startEmail">
          Save and email quote
        </button>

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
    </div>

    <div class="excess">
      <h2 class="h-sm">Choose your excess</h2>
      <p class="block-desc">The amount you pay towards a claim. A higher excess means a lower premium.</p>
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

    <div class="coverage">
      <h2 class="h-sm">Coverage Details</h2>
      <p class="block-desc">Included in your comprehensive plan</p>
      <div class="coverage-table">
        <div v-for="r in visibleCoverage" :key="r.label" class="cov-row">
          <div class="cov-label">{{ r.label }}</div>
          <div class="cov-value">{{ r.value }}</div>
        </div>
        <button type="button" class="cov-toggle" @click="local.coverageExpanded = !local.coverageExpanded">
          {{ local.coverageExpanded ? 'See less covers' : 'See more covers' }}
        </button>
      </div>
      <p class="cov-footnote">
        For more details, refer to our <a href="#">policy wording</a>.
      </p>
    </div>

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
        <p v-if="local.promoError" class="bdi-inline-error">
          {{ local.promoError }}
        </p>
      </template>
    </div>

    <StickyNext label="Buy now" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.h-sm { font-size: 16px; font-weight: 900; color: var(--bdi-carbon); margin: 0; }
.block-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}

.quote-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
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
}
.bt-button {
  flex: 1;
  background: transparent;
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 13px;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.bt-button.is-on {
  background: var(--bdi-carbon);
  color: #fff;
}

.price-block { text-align: center; }
.price {
  margin: 0;
  font-size: 36px;
  font-weight: 900;
  color: var(--bdi-green);
  line-height: 1.1;
}
.price-sub {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}

.breakdown { display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid var(--bdi-grey-200); }
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.row .green { color: var(--bdi-green); }
.row.total { font-weight: 900; padding-top: 6px; border-top: 1px solid var(--bdi-grey-200); margin-top: 4px; }

.meta-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.meta-id { margin: 0; font-size: 14px; font-weight: 900; color: var(--bdi-carbon); }
.meta-body {
  border-left: 3px solid var(--bdi-green);
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-body p { margin: 0; font-size: 14px; font-weight: 500; color: var(--bdi-carbon); line-height: 1.4; }

.email-action { padding-top: 4px; }
.email-link {
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--bdi-cyan);
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}
.email-link:hover { text-decoration: underline; }

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

.excess { display: flex; flex-direction: column; gap: 8px; }
.excess-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.excess-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  font-family: var(--bdi-font);
  cursor: pointer;
}
.excess-card.is-selected {
  border-color: var(--bdi-green);}
.excess-amount { font-size: 16px; font-weight: 700; color: var(--bdi-carbon); }
.excess-delta { font-size: 12px; font-weight: 500; }
.d-up { color: var(--bdi-red); }
.d-down { color: var(--bdi-green); }
.d-default { color: var(--bdi-grey-600); }

.coverage { display: flex; flex-direction: column; gap: 8px; }
.coverage-table {
  border-radius: var(--bdi-radius-card);
  overflow: hidden;
  border: 1px solid var(--bdi-grey-200);
}
.cov-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--bdi-grey-200);
}
.cov-label {
  background: #fff;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.cov-value {
  background: var(--bdi-grey-100);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  text-align: center;
  line-height: 1.4;
}
.cov-toggle {
  width: 100%;
  background: #fff;
  border: 0;
  padding: 12px 16px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-cyan);
  cursor: pointer;
}
.cov-footnote {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.cov-footnote a { color: var(--bdi-cyan); }

.promo { display: flex; flex-direction: column; gap: 8px; }
.promo-row { display: flex; align-items: stretch; }
.promo-row :deep(.promo-input) {
  flex: 1;
  border-color: var(--bdi-grey-300);
  border-right: 0;
  border-radius: 8px 0 0 8px !important;
  min-height: 48px;
  font-size: 16px !important;
}
.promo-row :deep(.promo-input.is-error) {
  border-color: var(--bdi-red);
}
.promo-row :deep(.promo-input:focus-within),
.promo-row :deep(.promo-input.p-focus) {
  border-color: var(--bdi-green);
}
.promo-apply {
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 0 8px 8px 0;
  padding: 0 20px;
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
</style>
