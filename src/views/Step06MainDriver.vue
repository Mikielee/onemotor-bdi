<script setup>
import { computed, reactive } from 'vue'
import Select from 'primevue/select'
import BdiDateField from '../components/BdiDateField.vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

const local = reactive({
  isPolicyholder: quote.mainDriver?.isPolicyholder ?? null,
  gender: quote.mainDriver?.gender || '',
  maritalStatus: quote.mainDriver?.maritalStatus || '',
  dob: quote.mainDriver?.dob || null,
})

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
]

function sync() {
  mutable.mainDriver = {
    ...quote.mainDriver,
    isPolicyholder: local.isPolicyholder,
    gender: local.gender,
    maritalStatus: local.maritalStatus,
    dob: local.dob,
  }
}

function pickPolicyholder(v) { local.isPolicyholder = v; sync() }
function pickGender(v) { local.gender = v; sync() }
function onDobChange(v) { local.dob = v; sync() }
function onMaritalChange(v) { local.maritalStatus = v; sync() }

const maxDob = new Date()

const canContinue = computed(() =>
  local.isPolicyholder !== null
  && Boolean(local.gender)
  && Boolean(local.maritalStatus)
  && Boolean(local.dob)
)

const phError = computed(() => showErrors.value && local.isPolicyholder === null)
const genderError = computed(() => showErrors.value && !local.gender)
const maritalError = computed(() => showErrors.value && !local.maritalStatus)
const dobError = computed(() => showErrors.value && !local.dob)

// Sprint-review demo: main driver IS the policyholder so Step 12 prefill
// kicks in; DOB 15 May 1990, Male, Married.
const { register } = useDemoAutofill()
register(() => {
  local.isPolicyholder = true
  local.gender = 'male'
  local.maritalStatus = 'married'
  local.dob = new Date('1990-05-15')
  sync()
})
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Main driver's details</h1>

    <!-- Is the main driver also the policyholder? -->
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

    <!-- Gender -->
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

    <!-- Marital status -->
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

    <!-- Date of birth -->
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
.yn-button.is-selected { border-color: var(--bdi-green); }
.yn-button.is-error { border-color: var(--bdi-red); }

.step :deep(.bdi-select) { width: 100%; }
</style>
