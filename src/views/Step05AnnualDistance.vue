<script setup>
import { computed, reactive } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Sprint-review demo: 8,000–12,000 km band.
const { register } = useDemoAutofill()
register(() => {
  local.band = '8000-12000'
  mutable.annualDistance = '8000-12000'
})

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

    <div class="callout">
      <i class="pi pi-info-circle callout-icon" aria-hidden="true"></i>
      <p class="callout-text">
        A <strong>15 km</strong> daily commute each way, like Tampines to the CBD, with your weekend trips, is about <strong>9,000 km</strong> a year.
      </p>
    </div>

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
  font-weight: 600;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease;
  font-family: var(--bdi-font);
}
.distance-card:hover { border-color: var(--bdi-grey-500); }
.distance-card.is-selected { border-color: var(--bdi-green); }
.distance-card.is-error { border-color: var(--bdi-red); }

/* Info callout — boxed grey card per Figma 3994:19086 (matches the
   Step 4 disclaimer treatment: bdi-grey-200 bg, 1px #D6D3D1 border). */
.callout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  background: var(--bdi-grey-200);
  border: 1px solid #D6D3D1;
  border-radius: var(--bdi-radius-card);
  padding: 16px;
}
.callout-icon {
  color: var(--bdi-carbon);
  flex-shrink: 0;
  font-size: 20px;
  margin-top: 2px;
}
.callout-text {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.callout-text strong { font-weight: 700; }
</style>
