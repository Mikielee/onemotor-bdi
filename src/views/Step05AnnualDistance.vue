<script setup>
import { computed } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const options = [
  { value: 'under-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000 to 12,000km' },
  { value: '12001-18000', label: '12,001-18,000km' },
  { value: 'over-18000', label: 'Over 18,000km' },
]

const canContinue = computed(() => Boolean(quote.annualDistance))

function select(value) {
  mutable.annualDistance = value
}
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How far do you drive in a year?</h1>

    <div class="distance-grid" role="radiogroup" aria-label="Annual distance">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="quote.annualDistance === o.value"
        class="distance-card"
        :class="{ 'is-selected': quote.annualDistance === o.value }"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
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
}

.distance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.distance-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  min-height: 58px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
  transition: border-color 120ms ease, box-shadow 120ms ease;
  font-family: var(--bdi-font);
}

.distance-card:hover { border-color: var(--bdi-grey-500); }
.distance-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}
</style>
