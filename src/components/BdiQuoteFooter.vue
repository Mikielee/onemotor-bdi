<script setup>
/**
 * BdiQuoteFooter — sticky footer with running premium + expandable
 * breakdown + Back/Next nav. Designed for Step 9 and every step after
 * (Step 10 drivers, Step 11 benefits, Step 12 policyholder, etc.) so the
 * customer always sees how their selections are moving the price.
 *
 * The expanded panel optionally shows the Single/Instalment toggle
 * (Step 9 only — payment term is locked from Step 10 onwards).
 *
 * All numbers come from useQuotePricing so the math stays consistent
 * across pages.
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuote } from '../store/quote'
import { useQuotePricing } from '../composables/useQuotePricing'
import { formatMoney } from '../utils/money'

const props = defineProps({
  showToggle: { type: Boolean, default: false },
  nextLabel: { type: String, default: 'Next' },
  disabled: { type: Boolean, default: false },
  interceptNext: { type: Boolean, default: false },
})

const emit = defineEmits(['blocked', 'next'])

const router = useRouter()
const route = useRoute()
const { mutable } = useQuote()
const pricing = useQuotePricing()

const expanded = ref(false)
const step = computed(() => route.meta?.step ?? 1)
const showBack = computed(() => step.value > 1)

function setPaymentTerm(v) {
  mutable.quoteSelection = {
    ...mutable.quoteSelection,
    paymentTerm: v,
  }
}

function onNext() {
  if (props.disabled) {
    emit('blocked')
    return
  }
  if (props.interceptNext) {
    emit('next')
    return
  }
  if (step.value < 17) router.push(`/step/${step.value + 1}`)
}

function onBack() {
  if (step.value > 1) router.push(`/step/${step.value - 1}`)
  else router.back()
}
</script>

<template>
  <div class="footer" :class="{ 'is-expanded': expanded }">
    <button
      type="button"
      class="handle"
      :aria-expanded="expanded"
      :aria-label="expanded ? 'Hide price details' : 'Show price details'"
      @click="expanded = !expanded"
    >
      <i :class="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" aria-hidden="true"></i>
    </button>

    <div v-if="expanded" class="expanded">
      <div v-if="showToggle" class="toggle" role="tablist" aria-label="Payment term">
        <button
          type="button"
          role="tab"
          class="tg-btn"
          :class="{ 'is-on': pricing.paymentTerm.value === 'single' }"
          :aria-selected="pricing.paymentTerm.value === 'single'"
          @click="setPaymentTerm('single')"
        >Single</button>
        <button
          type="button"
          role="tab"
          class="tg-btn"
          :class="{ 'is-on': pricing.paymentTerm.value === 'instalment' }"
          :aria-selected="pricing.paymentTerm.value === 'instalment'"
          @click="setPaymentTerm('instalment')"
        >Instalment</button>
      </div>

      <div class="breakdown">
        <p class="bd-title">Comprehensive</p>
        <div class="bd-row">
          <span>Subtotal</span>
          <span>{{ formatMoney(pricing.subtotalForDisplay.value) }}</span>
        </div>
        <div v-if="pricing.hasPersonalAccident.value" class="bd-row">
          <span>Medical expenses</span>
          <span>{{ formatMoney(pricing.medicalExpenses.value) }}</span>
        </div>
        <div v-if="pricing.driverCount.value > 0" class="bd-row">
          <span>Named drivers ({{ pricing.driverCount.value }})</span>
          <span>+{{ formatMoney(pricing.driverImpact.value) }}</span>
        </div>
        <div v-if="pricing.hasADP.value" class="bd-row">
          <span>Authorised Driver Plan</span>
          <span>+{{ formatMoney(pricing.adpImpact.value) }}</span>
        </div>
        <div v-if="pricing.otherBenefitsCount.value > 0" class="bd-row">
          <span>Optional benefits ({{ pricing.otherBenefitsCount.value }})</span>
          <span>+{{ formatMoney(pricing.otherBenefitsImpact.value) }}</span>
        </div>
        <div class="bd-row">
          <span>GST (9%)</span>
          <span>{{ formatMoney(pricing.gstAmount.value) }}</span>
        </div>
        <div v-if="pricing.isSingle.value" class="bd-row bd-discount">
          <span>Single payment 3% discount</span>
          <span>Included</span>
        </div>
      </div>
    </div>

    <div class="bar">
      <button
        v-if="showBack"
        type="button"
        class="back-btn"
        aria-label="Go back"
        @click="onBack"
      >
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>

      <div class="price">
        <p class="price-amt">
          <span class="price-green">{{ formatMoney(pricing.displayAmount.value) }}</span>
          <span class="price-unit">{{ pricing.displayUnit.value }}</span>
        </p>
      </div>

      <button
        type="button"
        class="next-btn"
        :class="{ 'is-blocked': disabled }"
        :aria-disabled="disabled ? 'true' : 'false'"
        @click="onNext"
      >{{ nextLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.footer {
  background: #fff;
  /* 24px top padding gives the floating circle notch (top: -20px) room
     to breathe so its lower half doesn't overlap the bar content. */
  padding: 24px 16px 16px 16px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 -10px 15px -3px rgba(0, 0, 0, 0.10);
  display: flex;
  flex-direction: column;
  margin: auto -16px 0 -16px;
  position: relative;
}

/* Circular chevron handle floats above the top edge of the footer per
   Figma 5269-3520. 40x40 white circle, soft shadow, no border. Doubles
   as the affordance for "tap to see breakdown". */
.handle {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: #fff;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bdi-carbon);
  padding: 0;
}
.handle .pi { font-size: 18px; font-weight: 700; }

.expanded {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Single/Instalment pill toggle inside the expanded panel — only renders
   when showToggle is true (Step 9). */
.toggle {
  display: inline-flex;
  background: var(--bdi-grey-100);
  border-radius: 100px;
  padding: 4px;
  align-self: flex-start;
}
.tg-btn {
  background: transparent;
  border: 0;
  padding: 8px 20px;
  border-radius: 100px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.tg-btn.is-on {
  background: var(--bdi-carbon);
  color: #fff;
}

.breakdown {
  background: var(--bdi-grey-100);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bd-title {
  margin: 0 0 4px 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.bd-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.bd-discount { color: var(--bdi-green); font-weight: 600; }

/* Bar: Back / price / Next. Always visible. */
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
}
.back-btn {
  flex: 0 0 56px;
  width: 56px;
  height: 48px;
  background: #fff;
  border: 1px solid var(--bdi-carbon);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bdi-carbon);
  cursor: pointer;
  padding: 0;
}
.back-btn:hover { background: var(--bdi-grey-100); }
.back-btn .pi { font-size: 16px; }

.price {
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
}
.price-amt {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}
.price-green {
  font-family: var(--bdi-font);
  font-size: 20px;
  font-weight: 900;
  color: var(--bdi-green);
}
.price-unit {
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}

.next-btn {
  flex: 0 0 auto;
  min-width: 96px;
  height: 48px;
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 0 24px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.next-btn:hover { filter: brightness(1.05); }
.next-btn.is-blocked {
  background: var(--bdi-grey-300);
  color: var(--bdi-grey-600);
  cursor: not-allowed;
}
</style>
