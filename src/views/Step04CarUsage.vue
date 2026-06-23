<script setup>
import { computed, reactive } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

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

function pickUsage(v) {
  local.usage = v
  // Private and business skips the commute question — clear any prior answer so
  // a later switch back to "Private only" re-asks it.
  if (v === 'private-business') local.commute = null
  sync()
}
function pickCommute(v) { local.commute = v; sync() }
function pickOffPeak(v) { local.offPeak = v; sync() }

function sync() { mutable.carUsage = { ...local } }

// Progressive reveal:
//   Q1 always visible
//   Q2 only if Q1 === private-only (private-business doesn't need commute info —
//     it's already business use, so commute-to-work is irrelevant)
//   Q3 after Q1 = private-business, OR after Q2 in the private-only path
const showCommute = computed(() => local.usage === 'private-only')
const showOffPeak = computed(() =>
  local.usage === 'private-business' || (local.usage === 'private-only' && Boolean(local.commute))
)

const canContinue = computed(() => {
  if (!local.usage) return false
  if (local.usage === 'private-only' && !local.commute) return false
  if (local.offPeak === null) return false
  return true
})

const usageError = computed(() => showErrors.value && !local.usage)
const commuteError = computed(() => showErrors.value && showCommute.value && !local.commute)
const offPeakError = computed(() => showErrors.value && showOffPeak.value && local.offPeak === null)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How do you use your car?</h1>

    <!-- Q1: Usage (always visible) -->
    <div
      class="card-stack"
      role="radiogroup"
      aria-label="Car usage"
      :data-error="usageError ? 'true' : null"
    >
      <button
        v-for="o in usageOptions"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.usage === o.value"
        class="choice-card"
        :class="{ 'is-selected': local.usage === o.value, 'is-error': usageError }"
        @click="pickUsage(o.value)"
      >
        <span class="choice-radio" :class="{ 'is-on': local.usage === o.value }">
          <span class="choice-dot" />
        </span>
        <span class="choice-text">
          <span class="choice-title">{{ o.title }}</span>
          <span class="choice-desc">{{ o.desc }}</span>
        </span>
      </button>
    </div>
    <FieldError :show="usageError" message="Select your car usage." />

    <!-- Q2 + disclaimer — revealed after Q1 -->
    <template v-if="showCommute">
      <div class="disclaimer">
        <svg class="disclaimer-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.998 12C2.998 7.026 7.025 2.998 12 2.998c4.972 0 8.999 4.028 8.999 9.002 0 4.972-4.027 9-8.999 9-4.973.004-9-4.026-9-9.002zm3.715-5.285A7.45 7.45 0 004.525 12c0 2.069.835 3.929 2.188 5.286A7.46 7.46 0 0012 19.47a7.46 7.46 0 005.286-2.184A7.45 7.45 0 0019.47 12a7.45 7.45 0 00-2.184-5.285A7.46 7.46 0 0012 4.525a7.46 7.46 0 00-5.287 2.19z" fill="currentColor"/>
          <path d="M13.135 10.807v5.351a1.134 1.134 0 11-2.268 0v-5.351a1.134 1.134 0 112.268 0z" fill="currentColor"/>
          <path d="M10.867 7.837a1.134 1.134 0 112.268 0 1.134 1.134 0 01-2.268 0z" fill="currentColor"/>
        </svg>
        <p class="disclaimer-text">
          <strong>Disclaimer</strong>: we do not cover ride hailing.
        </p>
      </div>

      <p class="field-label">Do you use this car for any part of your commute to work or school?</p>
      <div
        class="card-stack"
        role="radiogroup"
        aria-label="Commute"
        :data-error="commuteError ? 'true' : null"
      >
        <button
          v-for="o in commuteOptions"
          :key="o.value"
          type="button"
          role="radio"
          :aria-checked="local.commute === o.value"
          class="choice-card"
          :class="{ 'is-selected': local.commute === o.value, 'is-error': commuteError }"
          @click="pickCommute(o.value)"
        >
          <span class="choice-radio" :class="{ 'is-on': local.commute === o.value }">
            <span class="choice-dot" />
          </span>
          <span class="choice-text">
            <span class="choice-title">{{ o.title }}</span>
            <span class="choice-desc">{{ o.desc }}</span>
          </span>
        </button>
      </div>
      <FieldError :show="commuteError" message="Tell us if you use your car for commuting." />
    </template>

    <!-- Q3 — revealed after Q2 -->
    <template v-if="showOffPeak">
      <p class="field-label">Is this an off-peak car?</p>
      <div class="yes-no" :data-error="offPeakError ? 'true' : null">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.offPeak === true, 'is-error': offPeakError }"
          @click="pickOffPeak(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.offPeak === false, 'is-error': offPeakError }"
          @click="pickOffPeak(false)"
        >No</button>
      </div>
      <FieldError :show="offPeakError" message="Tell us if your car is off-peak." />
    </template>

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

.card-stack { display: flex; flex-direction: column; gap: 16px; }

.choice-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
}
.choice-card:hover { border-color: var(--bdi-grey-500); }
.choice-card.is-selected { border-color: var(--bdi-green); }
.choice-card.is-error { border-color: var(--bdi-red); }

.choice-radio {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--bdi-grey-500);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.choice-radio.is-on { border-color: var(--bdi-green); }
.choice-dot {
  width: 10.66px;
  height: 10.66px;
  border-radius: 50%;
  background: #fff;
}
.choice-radio.is-on .choice-dot { background: var(--bdi-green); }

.choice-text { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.choice-title { font-size: 14px; font-weight: 700; color: var(--bdi-carbon); }
.choice-desc { font-size: 12px; font-weight: 400; color: var(--bdi-carbon); line-height: 1.4; }

.disclaimer {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bdi-grey-200);
  border: 1px solid #D6D3D1;
  border-radius: var(--bdi-radius-card);
  padding: 8px;
}
.disclaimer-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--bdi-carbon);
}
.disclaimer-text {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.disclaimer-text strong { font-weight: 700; }

.field-label {
  margin: 8px 0 0 0;
  font-size: 14px;
  font-weight: 400;
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
  font-weight: 600;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.yn-button.is-selected { border-color: var(--bdi-green); }
.yn-button.is-error { border-color: var(--bdi-red); }
</style>
