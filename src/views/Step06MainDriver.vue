<script setup>
import { computed, reactive } from 'vue'
import BdiDateField from '../components/BdiDateField.vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

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

const phError = computed(() => showErrors.value && local.isPolicyholder === null)
const dobError = computed(() => showErrors.value && !local.dob)
const genderError = computed(() => showErrors.value && !local.gender)
const maritalError = computed(() => showErrors.value && !local.maritalStatus)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Main driver details</h1>

    <!-- Order per Figma 4719-4828: Policyholder, Gender, Marital status, DOB. -->
    <div class="field" :data-error="phError ? 'true' : null">
      <p class="field-label">Is the main driver also the policyholder?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.isPolicyholder === true, 'is-error': phError }"
          @click="pickPolicyholder(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.isPolicyholder === false, 'is-error': phError }"
          @click="pickPolicyholder(false)"
        >No</button>
      </div>
      <FieldError
        :show="phError"
        message="Please select whether the main driver is also the policyholder."
      />
    </div>

    <div class="field" :data-error="genderError ? 'true' : null">
      <p class="field-label">Gender</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.gender === 'male', 'is-error': genderError }"
          @click="pickGender('male')"
        >Male</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.gender === 'female', 'is-error': genderError }"
          @click="pickGender('female')"
        >Female</button>
      </div>
      <FieldError :show="genderError" message="Please select your gender." />
    </div>

    <div class="field" :data-error="maritalError ? 'true' : null">
      <Select
        :model-value="local.maritalStatus"
        @update:model-value="onMaritalChange"
        :options="maritalOptions"
        option-label="label"
        option-value="value"
        placeholder="Marital status"
        class="bdi-select"
        :class="{ 'is-error': maritalError }"
        fluid
      />
      <FieldError :show="maritalError" message="Please select your marital status." />
    </div>

    <div class="field" :data-error="dobError ? 'true' : null">
      <label class="field-label" for="dob">Date of birth</label>
      <BdiDateField
        id="dob"
        :model-value="local.dob"
        @update:model-value="onDobChange"
        :max-date="maxDob"
        :invalid="dobError"
      />
      <FieldError :show="dobError" message="Please select your date of birth." />
    </div>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  border-color: var(--bdi-green);}
.yn-button.is-error { border-color: var(--bdi-red); }

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

/* Select styling comes from global style.css — no per-step overrides needed.
   The global rule already paints filled text Carbon and placeholder Grey-600. */
.step :deep(.bdi-select) { width: 100%; }
</style>
