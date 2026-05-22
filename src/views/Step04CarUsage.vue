<script setup>
import { computed, reactive } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const usageOptions = [
  { value: 'private-only', title: 'Private only', desc: 'Social, domestic and pleasure purposes only.' },
  { value: 'private-business', title: 'Private and business', desc: 'Personal use plus business activities.' },
]

const commuteOptions = [
  { value: 'regular', title: 'Regular commuting', desc: 'The car is driven to work or study at least once a week.' },
  { value: 'none', title: 'No commuting', desc: 'You work from home and/or the car is rarely or never driven to work or study.' },
]

const local = reactive({
  usage: quote.carUsage?.usage || null,
  commute: quote.carUsage?.commute || null,
  offPeak: quote.carUsage?.offPeak ?? null,
})

function pickUsage(v) { local.usage = v; sync() }
function pickCommute(v) { local.commute = v; sync() }
function pickOffPeak(v) { local.offPeak = v; sync() }

function sync() { mutable.carUsage = { ...local } }

const canContinue = computed(() =>
  Boolean(local.usage && local.commute && local.offPeak !== null)
)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How do you use your car?</h1>

    <div class="card-stack" role="radiogroup" aria-label="Car usage">
      <button
        v-for="o in usageOptions"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.usage === o.value"
        class="choice-card"
        :class="{ 'is-selected': local.usage === o.value }"
        @click="pickUsage(o.value)"
      >
        <span class="choice-radio" :class="{ 'is-on': local.usage === o.value }">
          <span v-if="local.usage === o.value" class="choice-dot" />
        </span>
        <span class="choice-text">
          <span class="choice-title">{{ o.title }}</span>
          <span class="choice-desc">{{ o.desc }}</span>
        </span>
      </button>
    </div>

    <p class="disclaimer">
      <strong>Disclaimer</strong>: we do not cover ride hailing.
    </p>

    <p class="field-label">Do you use this car for any part of your commute to work or school?</p>
    <div class="card-stack" role="radiogroup" aria-label="Commute">
      <button
        v-for="o in commuteOptions"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.commute === o.value"
        class="choice-card"
        :class="{ 'is-selected': local.commute === o.value }"
        @click="pickCommute(o.value)"
      >
        <span class="choice-radio" :class="{ 'is-on': local.commute === o.value }">
          <span v-if="local.commute === o.value" class="choice-dot" />
        </span>
        <span class="choice-text">
          <span class="choice-title">{{ o.title }}</span>
          <span class="choice-desc">{{ o.desc }}</span>
        </span>
      </button>
    </div>

    <p class="field-label">Is this an off-peak car?</p>
    <div class="yes-no">
      <button
        type="button"
        class="yn-button"
        :class="{ 'is-selected': local.offPeak === true }"
        @click="pickOffPeak(true)"
      >Yes</button>
      <button
        type="button"
        class="yn-button"
        :class="{ 'is-selected': local.offPeak === false }"
        @click="pickOffPeak(false)"
      >No</button>
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

.card-stack { display: flex; flex-direction: column; gap: 8px; }

.choice-card {
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
}
.choice-card:hover { border-color: var(--bdi-grey-500); }
.choice-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}

.choice-radio {
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
.choice-radio.is-on { border-color: var(--bdi-green); }
.choice-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bdi-green); }

.choice-text { display: flex; flex-direction: column; gap: 4px; }
.choice-title { font-size: 14px; font-weight: 900; color: var(--bdi-carbon); }
.choice-desc { font-size: 12px; font-weight: 500; color: var(--bdi-carbon); line-height: 1.4; }

.disclaimer {
  margin: 0;
  background: var(--bdi-grey-100);
  border: 1px solid #CCCCCC;
  border-radius: var(--bdi-radius-card);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.disclaimer strong { font-weight: 900; }

.field-label {
  margin: 8px 0 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}

.yes-no { display: flex; gap: 8px; }
.yn-button {
  flex: 1;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.yn-button.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
  color: var(--bdi-green);
}
</style>
