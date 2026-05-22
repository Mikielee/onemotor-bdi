<script setup>
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const local = reactive({
  billingCycle: quote.quoteSelection?.billingCycle || 'annual',
  excess: quote.quoteSelection?.excess ?? 600,
  promoCode: quote.quoteSelection?.promoCode || '',
})

const basePrice = 416.0

function sync() {
  mutable.quoteSelection = {
    ...quote.quoteSelection,
    billingCycle: local.billingCycle,
    excess: local.excess,
    promoCode: local.promoCode,
  }
}

function setBilling(v) { local.billingCycle = v; sync() }
function setExcess(v) { local.excess = v; sync() }

const excessOptions = [
  { value: 0, label: '$0', delta: '+$50/yr', kind: 'up' },
  { value: 500, label: '$500', delta: '+$10/yr', kind: 'up' },
  { value: 600, label: '$600', delta: 'Default', kind: 'default' },
  { value: 800, label: '$800', delta: '-$20/yr', kind: 'down' },
  { value: 1000, label: '$1,000', delta: '-$30/yr', kind: 'down' },
  { value: 1500, label: '$1,500', delta: '-$50/yr', kind: 'down' },
]

const coverageRows = [
  { label: 'Injury or death to someone else', value: 'Unlimited cover' },
  { label: "Damage to other people's property", value: 'up to $5,000,000' },
  { label: 'Legal costs against criminal charges', value: 'up to $3,000' },
  { label: 'Towing after an accident', value: '$500 overseas / $200 local' },
  { label: 'Damage by fire', value: 'Included' },
]

const formattedPrice = computed(() => {
  // Mock: adjust by excess delta for display
  const map = { 0: 50, 500: 10, 600: 0, 800: -20, 1000: -30, 1500: -50 }
  const adj = map[local.excess] ?? 0
  const annual = basePrice + adj
  if (local.billingCycle === 'monthly') {
    return (annual / 12).toFixed(2)
  }
  return annual.toFixed(2)
})

const priceSuffix = computed(() => local.billingCycle === 'monthly' ? '/ month' : '/ year')

const canContinue = computed(() => Boolean(local.excess !== null))

const carLine = computed(() => {
  const parts = []
  if (quote.carMake) parts.push(quote.carMake)
  if (quote.carModel) parts.push(quote.carModel)
  if (quote.carYear) parts.push(quote.carYear)
  return parts.length ? parts.join(' ') : 'Your car'
})
</script>

<template>
  <section class="step">
    <div class="quote-card">
      <div class="billing-toggle">
        <button
          type="button"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'annual' }"
          @click="setBilling('annual')"
        >Annual</button>
        <button
          type="button"
          class="bt-button"
          :class="{ 'is-on': local.billingCycle === 'monthly' }"
          @click="setBilling('monthly')"
        >Monthly</button>
      </div>

      <div class="price-block">
        <p class="price">${{ formattedPrice }}</p>
        <p class="price-sub">{{ priceSuffix === '/ year' ? 'per year' : 'per month' }} (incl. GST)</p>
      </div>

      <div class="breakdown">
        <div class="row"><span>Subtotal</span><span>$240.00</span></div>
        <div class="row"><span>Medical expenses</span><span>$80.00</span></div>
        <div class="row"><span>NCD protector</span><span>$80.00</span></div>
        <div class="row"><span>GST (9%)</span><span>$36.00</span></div>
        <div class="row green"><span>Low mileage</span><span>- $20.00</span></div>
        <div class="row green"><span>Annual payment 3% discount</span><span>Included</span></div>
      </div>
    </div>

    <div class="meta-card">
      <p class="meta-id">Quote ID: P11254149R00</p>
      <div class="meta-body">
        <p>Comprehensive Car Insurance</p>
        <p>{{ carLine }}</p>
      </div>
      <button type="button" class="meta-action">Save &amp; Email Quote</button>
    </div>

    <div class="excess">
      <h2 class="bdi-section-title h-sm">Choose your excess</h2>
      <p class="excess-desc">The amount you pay towards a claim. A higher excess means a lower premium.</p>
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
          }">{{ o.delta }}</span>
        </button>
      </div>
    </div>

    <div class="coverage">
      <h2 class="bdi-section-title h-sm">Coverage Details</h2>
      <p class="coverage-sub">Included in your comprehensive plan</p>
      <div class="coverage-table">
        <div v-for="(r, idx) in coverageRows" :key="r.label" class="cov-row" :class="{ first: idx === 0, last: idx === coverageRows.length - 1 }">
          <div class="cov-label">{{ r.label }}</div>
          <div class="cov-value">{{ r.value }}</div>
        </div>
        <button type="button" class="cov-more">See more covers</button>
      </div>
      <p class="cov-footnote">
        For more details, refer to our <a href="#">policy wording</a>.
      </p>
    </div>

    <div class="promo">
      <h2 class="bdi-section-title h-sm">Promotions</h2>
      <div class="promo-row">
        <InputText
          v-model="local.promoCode"
          @update:model-value="sync"
          placeholder="Enter Promo Code"
          class="bdi-input promo-input"
        />
        <button type="button" class="promo-apply">Apply</button>
      </div>
    </div>

    <StickyNext :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 140px;
}

.h-sm { font-size: 16px; }

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
  font-size: 12px;
  color: var(--bdi-carbon);
  cursor: pointer;
  text-transform: capitalize;
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

.breakdown { display: flex; flex-direction: column; gap: 8px; }
.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.row.green { color: var(--bdi-green); }

.meta-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.meta-id {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--bdi-carbon);
}
.meta-body {
  border-left: 1px solid var(--bdi-grey-200);
  padding-left: 16px;
}
.meta-body p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.meta-action {
  background: #fff;
  border: 1px solid var(--bdi-cyan);
  border-radius: var(--bdi-radius-card);
  padding: 8px;
  color: var(--bdi-cyan);
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.excess { display: flex; flex-direction: column; gap: 8px; }
.excess-desc {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.excess-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
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
  min-height: 56px;
  font-family: var(--bdi-font);
  cursor: pointer;
}
.excess-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}
.excess-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.excess-delta {
  font-size: 12px;
  font-weight: 500;
}
.d-up { color: var(--bdi-red); }
.d-down { color: var(--bdi-green); }
.d-default { color: var(--bdi-grey-600); }

.coverage { display: flex; flex-direction: column; gap: 8px; }
.coverage-sub {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.coverage-table {
  border-radius: var(--bdi-radius-card);
  overflow: hidden;
  border: 1px solid var(--bdi-grey-200);
}
.cov-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--bdi-grey-200);
}
.cov-row:last-of-type { border-bottom: 0; }
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
.cov-more {
  width: 100%;
  background: #fff;
  border: 0;
  border-top: 1px solid var(--bdi-grey-200);
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

.promo { display: flex; flex-direction: column; gap: 12px; }
.promo-row {
  display: flex;
  align-items: stretch;
}
.promo-apply {
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 0 var(--bdi-radius-card) var(--bdi-radius-card) 0;
  padding: 12px 16px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}

.step :deep(.bdi-input.p-inputtext),
.step :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card) 0 0 var(--bdi-radius-card);
  padding: 12px 16px;
  font-size: 16px;
  color: var(--bdi-carbon);
  font-weight: 500;
  min-height: 48px;
  width: 100%;
  flex: 1;
}
.promo-row :deep(.promo-input.p-inputtext) {
  border-right: 0;
}
</style>
