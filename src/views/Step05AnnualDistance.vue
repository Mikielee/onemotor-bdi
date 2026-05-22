<script setup>
import { computed, reactive, watch } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

// Figma OMP-91 note: Drive Less, Pay Less is DirectAsia only.
// BDI does not show the opt-in — 4 bands, single selection.
const options = [
  { value: 'under-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000 to 12,000km' },
  { value: '12000-18000', label: '12,000 to 18,000km' },
  { value: 'over-18000', label: 'More than 18,000km' },
]

const local = reactive({
  band: quote.annualDistance || null,
  showError: false,
})

function select(value) {
  local.band = value
  local.showError = false
  mutable.annualDistance = value
}

const canContinue = computed(() => Boolean(local.band))

watch(canContinue, (v) => { if (v) local.showError = false })
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How far do you drive in a year?</h1>

    <p class="hint">
      Most Singapore drivers cover under 8,000km a year. As a rough guide,
      <strong>22km a day = 154km a week = around 8,000km a year</strong>.
    </p>

    <div class="distance-grid" role="radiogroup" aria-label="Annual distance">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.band === o.value"
        class="distance-card"
        :class="{ 'is-selected': local.band === o.value }"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>

    <p v-if="local.showError" class="bdi-inline-error" role="alert">
      Please select a mileage band to continue.
    </p>

    <StickyNext :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bdi-grey-600);
}
.hint strong {
  color: var(--bdi-carbon);
  font-weight: 700;
}

.distance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.distance-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px 12px;
  min-height: 58px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
  transition: border-color 120ms ease, box-shadow 120ms ease, color 120ms ease;
  font-family: var(--bdi-font);
}
.distance-card:hover { border-color: var(--bdi-grey-500); }
.distance-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
  color: var(--bdi-green);
}
</style>
