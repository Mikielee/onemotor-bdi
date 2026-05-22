<script setup>
import { computed, ref } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const hasAdditional = ref(quote.hasAdditionalDrivers ?? null)
const drivers = ref([...(quote.additionalDrivers || [])])

function setHas(v) {
  hasAdditional.value = v
  mutable.hasAdditionalDrivers = v
  if (v === false) {
    drivers.value = []
    mutable.additionalDrivers = []
  }
}

function addDriver() {
  drivers.value.push({
    id: Date.now(),
    name: '',
  })
  mutable.additionalDrivers = [...drivers.value]
}

function removeDriver(id) {
  drivers.value = drivers.value.filter((d) => d.id !== id)
  mutable.additionalDrivers = [...drivers.value]
}

const canContinue = computed(() => {
  if (hasAdditional.value === false) return true
  if (hasAdditional.value === true) return drivers.value.length >= 1
  return false
})
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Who drives your car?</h1>

    <div class="field">
      <p class="field-label">
        Does anyone else <strong>in your household</strong> drive this car?
      </p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': hasAdditional === true }"
          @click="setHas(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': hasAdditional === false }"
          @click="setHas(false)"
        >No</button>
      </div>
    </div>

    <div v-if="hasAdditional === true" class="drivers-section">
      <p class="section-label">Please tell us about the driver</p>

      <div v-if="drivers.length === 0" class="empty-state">
        <p class="empty-text">No additional drivers added yet.</p>
        <button type="button" class="add-driver" @click="addDriver">
          + Add a driver
        </button>
      </div>

      <div v-else class="driver-list">
        <div v-for="(d, i) in drivers" :key="d.id" class="driver-card">
          <div class="driver-row">
            <p class="driver-title">Driver {{ i + 1 }}</p>
            <button type="button" class="driver-remove" @click="removeDriver(d.id)">Remove</button>
          </div>
          <p class="driver-placeholder">Driver details will be captured here.</p>
        </div>
        <button type="button" class="add-driver secondary" @click="addDriver">
          + Add another driver
        </button>
      </div>

      <div class="warning">
        <p class="warning-title">Authorised Driver option cover</p>
        <ul>
          <li>A household member of the Main Driver who is not named as a Named Driver will not be covered under your Policy.</li>
          <li>Any unnamed driver who was involved in 2 or more accidents where he or she is partially or fully at fault within the 3 years preceding the start date of the Policy Term will not be covered under your Policy.</li>
        </ul>
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

.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.field-label strong { font-weight: 700; }

.yes-no { display: flex; gap: 8px; }
.yn-button {
  flex: 1;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  min-height: 56px;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  cursor: pointer;
  font-family: var(--bdi-font);
}
.yn-button.is-selected {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset;
}

.drivers-section { display: flex; flex-direction: column; gap: 16px; }

.section-label {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
}

.empty-state {
  background: #fff;
  border: 1px dashed var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.empty-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}

.add-driver {
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: var(--bdi-radius-card);
  padding: 12px 24px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}
.add-driver.secondary {
  background: #fff;
  color: var(--bdi-green);
  border: 1px solid var(--bdi-green);
}

.driver-list { display: flex; flex-direction: column; gap: 12px; }
.driver-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.driver-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.driver-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--bdi-carbon);
}
.driver-remove {
  background: transparent;
  border: 0;
  color: var(--bdi-red);
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.driver-placeholder {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}

.warning {
  background: var(--bdi-grey-100);
  border: 1px solid rgba(242, 169, 0, 0.3);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
}
.warning-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.warning ul {
  margin: 0;
  padding-left: 20px;
}
.warning li {
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
  margin-bottom: 6px;
}
.warning li:last-child { margin-bottom: 0; }
</style>
