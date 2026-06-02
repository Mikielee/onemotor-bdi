<script setup>
import { computed, reactive } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Figma OMP-91 / 4691-2315: 4 bands, single selection. En-dash range format
// per the mock-up, and bands cover the full 0-∞ km space with no gaps.
// (Drive Less, Pay Less opt-in is DirectAsia only and isn't shown on BDI.)
const options = [
  { value: 'under-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000–12,000km' },
  { value: '12001-18000', label: '12,001–18,000km' },
  { value: 'over-18000', label: 'Over 18,000km' },
]

const local = reactive({
  band: quote.annualDistance || null,
})

function select(value) {
  local.band = value
  mutable.annualDistance = value
}

const canContinue = computed(() => Boolean(local.band))
const bandError = computed(() => showErrors.value && !local.band)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How far do you drive in a year?</h1>

    <div
      class="distance-grid"
      role="radiogroup"
      aria-label="Annual distance"
      :data-error="bandError ? 'true' : null"
    >
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.band === o.value"
        class="distance-card"
        :class="{ 'is-selected': local.band === o.value, 'is-error': bandError }"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>

    <FieldError :show="bandError" message="Please select how far you drive in a year." />

    <p class="callout">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <span>
        Most Singapore drivers cover under 8,000km a year. As a rough guide,
        <strong>22km a day = 154km a week = around 8,000km a year</strong>.
      </span>
    </p>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.distance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* Bands match Figma 4691-2315: medium weight (500), Carbon text, 1px border.
   Active/selected = green border, text stays Carbon. */
.distance-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px 12px;
  min-height: 58px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease;
  font-family: var(--bdi-font);
}
.distance-card:hover { border-color: var(--bdi-grey-500); }
.distance-card.is-selected { border-color: var(--bdi-green); }
.distance-card.is-error { border-color: var(--bdi-red); }

/* Info callout under the bands — pattern is shared with step 10. */
.callout {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 0;
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bdi-carbon);
}
.callout .pi {
  color: var(--bdi-cyan);
  flex-shrink: 0;
  margin-top: 1px;
}
.callout strong { font-weight: 700; }
</style>
