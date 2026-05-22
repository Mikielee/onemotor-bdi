<script setup>
import { computed, reactive, watch } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const options = [
  { value: 'under-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000 to 12,000km' },
  { value: '12000-18000', label: '12,000 to 18,000km' },
  { value: 'over-18000', label: 'More than 18,000km' },
]

const local = reactive({
  band: quote.annualDistance || null,
  driveLess: quote.driveLess ?? null,
  showError: false,
})

const isUnder8k = computed(() => local.band === 'under-8000')

function select(value) {
  local.band = value
  local.showError = false
  if (!isUnder8k.value) local.driveLess = null
  mutable.annualDistance = value
  mutable.driveLess = local.driveLess
}

function pickDriveLess(v) {
  local.driveLess = v
  mutable.driveLess = v
}

const canContinue = computed(() => Boolean(local.band))

watch(canContinue, (v) => { if (v) local.showError = false })

function handleNextBlocked() {
  if (!canContinue.value) local.showError = true
}
</script>

<template>
  <section class="step" @click="handleNextBlocked" :class="{ noop: false }">
    <h1 class="bdi-section-title">How far do you drive in a year?</h1>

    <p class="hint">
      Most Singapore drivers cover under 8,000km a year. As a rough guide,
      <strong>22km a day = 154km a week = around 8,000km a year</strong>.
      A typical commute from Tampines to the CBD is ~25km a day.
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
        @click.stop="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>

    <div v-if="local.showError" class="error-text" role="alert">
      Please select a mileage band to continue.
    </div>

    <transition name="fade">
      <div v-if="isUnder8k" class="drive-less" @click.stop>
        <h2 class="drive-less-title">Drive Less, Pay Less</h2>
        <p class="drive-less-body">
          Driving under 8,000km a year? You may qualify for a Drive Less, Pay Less discount.
          Would you like to opt in?
        </p>
        <div class="yes-no">
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-selected': local.driveLess === true }"
            @click="pickDriveLess(true)"
          >Yes</button>
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-selected': local.driveLess === false }"
            @click="pickDriveLess(false)"
          >No</button>
        </div>

        <div v-if="local.driveLess === true" class="odo-callout">
          <i class="pi pi-info-circle" aria-hidden="true" />
          <div>
            <strong>One thing to note.</strong>
            We'll ask for your odometer reading later in this journey, and
            a photo of your odometer once your policy starts. You can still proceed.
          </div>
        </div>
      </div>
    </transition>

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
  transition: border-color 120ms ease, box-shadow 120ms ease;
  font-family: var(--bdi-font);
}

.distance-card:hover { border-color: var(--bdi-grey-500); }
.distance-card.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
  color: var(--bdi-green);
}

.error-text {
  background: #FDECEA;
  border: 1px solid var(--bdi-red);
  color: var(--bdi-red);
  border-radius: var(--bdi-radius-card);
  padding: 10px 12px;
  font-size: 13px;
}

.drive-less {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drive-less-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--bdi-carbon);
}

.drive-less-body {
  margin: 0;
  font-size: 13px;
  color: var(--bdi-carbon);
  line-height: 1.5;
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
  font-family: var(--bdi-font);
}
.yn-button.is-selected {
  border-color: var(--bdi-green);
  color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}

.odo-callout {
  display: flex;
  gap: 12px;
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--bdi-carbon);
}
.odo-callout .pi {
  color: var(--bdi-cyan);
  font-size: 18px;
  flex-shrink: 0;
}
.odo-callout strong { font-weight: 900; }

.fade-enter-active, .fade-leave-active { transition: opacity 160ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
