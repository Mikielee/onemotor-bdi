<script setup>
import { computed } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const options = [
  {
    value: 'comprehensive',
    title: 'Comprehensive',
    description: 'Full protection — covers damage to your car, other vehicles, fire, theft, and more.',
  },
  {
    value: 'third-party-fire-theft',
    title: 'Third party, fire & theft',
    description: 'Covers damage to other vehicles plus fire and theft of your car.',
  },
  {
    value: 'third-party',
    title: 'Third party only',
    description: 'Basic cover — protects against damage you cause to other vehicles and property.',
  },
]

const canContinue = computed(() => Boolean(quote.coverType))

function select(value) {
  mutable.coverType = value
}
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">What cover do you need?</h1>

    <div class="cover-options" role="radiogroup" aria-label="Cover type">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="radio"
        :aria-checked="quote.coverType === opt.value"
        class="cover-card"
        :class="{ 'is-selected': quote.coverType === opt.value }"
        @click="select(opt.value)"
      >
        <span class="cover-radio" :class="{ 'is-on': quote.coverType === opt.value }">
          <span v-if="quote.coverType === opt.value" class="cover-radio-dot" />
        </span>
        <span class="cover-text">
          <span class="cover-title">{{ opt.title }}</span>
          <span class="cover-desc">{{ opt.description }}</span>
        </span>
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
  gap: 16px;
}

.cover-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.cover-card:hover { border-color: var(--bdi-grey-500); }
.cover-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}

.cover-radio {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--bdi-grey-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.cover-radio.is-on {
  border-color: var(--bdi-green);
}
.cover-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bdi-green);
}

.cover-text { display: flex; flex-direction: column; gap: 4px; }
.cover-title { font-size: 14px; font-weight: 900; color: var(--bdi-carbon); }
.cover-desc { font-size: 12px; font-weight: 500; color: var(--bdi-carbon); line-height: 1.4; }
</style>
