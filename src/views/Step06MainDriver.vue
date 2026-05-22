<script setup>
import { computed, reactive } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const local = reactive({
  isPolicyholder: quote.mainDriver?.isPolicyholder ?? null,
  dob: quote.mainDriver?.dob || null,
  gender: quote.mainDriver?.gender || '',
  maritalStatus: quote.mainDriver?.maritalStatus || '',
})

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
]

function pickPolicyholder(v) { local.isPolicyholder = v; sync() }
function pickGender(v) { local.gender = v; sync() }
function onDobChange(v) { local.dob = v; sync() }
function onMaritalChange(v) { local.maritalStatus = v; sync() }

function sync() {
  mutable.mainDriver = {
    ...quote.mainDriver,
    isPolicyholder: local.isPolicyholder,
    dob: local.dob,
    gender: local.gender,
    maritalStatus: local.maritalStatus,
  }
}

const maxDob = new Date()

const canContinue = computed(() =>
  local.isPolicyholder !== null && local.dob && local.gender && local.maritalStatus
)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Main driver details</h1>

    <div class="field">
      <p class="field-label">Is the main driver also the policyholder?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.isPolicyholder === true }"
          @click="pickPolicyholder(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.isPolicyholder === false }"
          @click="pickPolicyholder(false)"
        >No</button>
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="dob">Date of birth</label>
      <DatePicker
        id="dob"
        :model-value="local.dob"
        @update:model-value="onDobChange"
        date-format="dd/mm/yy"
        placeholder="DD/MM/YYYY"
        show-icon
        :max-date="maxDob"
        class="bdi-input"
        fluid
      />
    </div>

    <div class="field">
      <p class="field-label">Gender</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.gender === 'male' }"
          @click="pickGender('male')"
        >Male</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.gender === 'female' }"
          @click="pickGender('female')"
        >Female</button>
      </div>
    </div>

    <div class="field">
      <Select
        :model-value="local.maritalStatus"
        @update:model-value="onMaritalChange"
        :options="maritalOptions"
        option-label="label"
        option-value="value"
        placeholder="Marital status"
        class="bdi-select"
        fluid
      />
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
  padding-bottom: 120px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  margin: 0;
  font-size: 16px;
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

.step :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  font-size: 16px;
  color: var(--bdi-carbon);
  font-weight: 500;
  min-height: 56px;
}
.step :deep(.bdi-input .p-datepicker-trigger) {
  background: transparent;
  border: 0;
  color: var(--bdi-carbon);
}

.step :deep(.bdi-select) { width: 100%; }
.step :deep(.bdi-select .p-select) {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  min-height: 56px;
}
.step :deep(.bdi-select .p-select-label) {
  font-family: var(--bdi-font);
  color: var(--bdi-grey-600);
  font-size: 16px;
  padding: 16px;
  font-weight: 500;
}
</style>
