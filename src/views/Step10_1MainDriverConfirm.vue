<script setup>
/**
 * Step 10.1 — Tell us more about the Main Driver.
 * Figma BD mobile reference: 5269-3520.
 *
 * Sits between Step 9 (Your Quote) and Step 10 (Who drives your car?).
 * Captures the two main-driver fields we hadn't collected anywhere yet
 * (Full name + NRIC/FIN — KB OMP-92 deferred them to post-quote) and
 * re-presents Step 6/7 answers as prefilled, editable confirmations so
 * the customer can correct anything before binding.
 *
 * Back routes to /step/9 (BdiQuoteFooter default since meta.step = 10).
 * Next is intercepted so it routes to /step/10 instead of /step/11.
 */
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import BdiDateField from '../components/BdiDateField.vue'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { validateNric } from '../utils/nric'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()

const local = reactive({
  // Newly collected on this step
  name: quote.mainDriver?.name || '',
  nric: quote.mainDriver?.nric || '',
  // Prefilled from Step 6
  dob: quote.mainDriver?.dob || null,
  gender: quote.mainDriver?.gender || '',
  maritalStatus: quote.mainDriver?.maritalStatus || '',
  // Prefilled from Step 7
  yearsLicensed: quote.drivingHistory?.yearsLicensed ?? null,
  atFault: quote.drivingHistory?.atFaultClaims ?? null,
  notAtFault: quote.drivingHistory?.notAtFaultClaims ?? null,
  certOfMerit: quote.drivingHistory?.certificateOfMerit ?? null,
})

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
]

const yearsLicensedOptions = Array.from({ length: 41 }, (_, i) => ({
  label: i === 0 ? 'Less than 1 year' : `${i} year${i === 1 ? '' : 's'}`,
  value: i,
}))

const atFaultOptions = [0, 1, 2, 3, '4+']
const notAtFaultOptions = [0, 1, 2, 3, 4, '5+']

function sync() {
  mutable.mainDriver = {
    ...quote.mainDriver,
    name: local.name.trim(),
    nric: local.nric.trim().toUpperCase(),
    dob: local.dob,
    gender: local.gender,
    maritalStatus: local.maritalStatus,
  }
  mutable.drivingHistory = {
    ...quote.drivingHistory,
    yearsLicensed: local.yearsLicensed,
    atFaultClaims: local.atFault,
    notAtFaultClaims: local.notAtFault,
    certificateOfMerit: local.certOfMerit,
  }
}

function onNricInput(v) { local.nric = (v || '').toUpperCase(); sync() }
function onDobChange(v) { local.dob = v; sync() }
function pickGender(v) { local.gender = v; sync() }
function onMaritalChange(v) { local.maritalStatus = v; sync() }
function onYearsChange(v) { local.yearsLicensed = v; sync() }
function setAtFault(v) { local.atFault = v; sync() }
function setNotAtFault(v) { local.notAtFault = v; sync() }
function setCertOfMerit(v) { local.certOfMerit = v; sync() }

const nricValid = computed(() => validateNric(local.nric))
const maxDob = new Date()

const canContinue = computed(() =>
  local.name.trim().length > 0
  && nricValid.value
  && Boolean(local.dob)
  && Boolean(local.gender)
  && Boolean(local.maritalStatus)
  && local.yearsLicensed !== null
  && local.atFault !== null
  && local.notAtFault !== null
  && local.certOfMerit !== null,
)

const nameError = computed(() => showErrors.value && local.name.trim().length === 0)
const nricError = computed(() => showErrors.value && !nricValid.value)
const dobError = computed(() => showErrors.value && !local.dob)
const genderError = computed(() => showErrors.value && !local.gender)
const maritalError = computed(() => showErrors.value && !local.maritalStatus)
const yearsError = computed(() => showErrors.value && local.yearsLicensed === null)
const atFaultError = computed(() => showErrors.value && local.atFault === null)
const notAtFaultError = computed(() => showErrors.value && local.notAtFault === null)
const certError = computed(() => showErrors.value && local.certOfMerit === null)

function onNext() {
  if (!canContinue.value) {
    reveal()
    return
  }
  sync()
  router.push('/step/10')
}
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Tell us more about the Main Driver</h1>

    <!-- Full name -->
    <div class="field" :data-error="nameError ? 'true' : null">
      <InputText
        v-model="local.name"
        @update:model-value="sync"
        placeholder="Full name (as per NRIC)"
        class="bdi-input"
        :class="{ 'is-error': nameError }"
        fluid
      />
      <FieldError :show="nameError" message="Enter the main driver's full name." />
    </div>

    <!-- NRIC/FIN -->
    <div class="field" :data-error="nricError ? 'true' : null">
      <InputText
        :model-value="local.nric"
        @update:model-value="onNricInput"
        placeholder="NRIC/FIN"
        class="bdi-input"
        :class="{ 'is-error': nricError }"
        maxlength="9"
        fluid
      />
      <FieldError :show="nricError" message="Enter a valid NRIC or FIN." />
    </div>

    <!-- DOB (prefilled from Step 6) -->
    <div class="field stack" :data-error="dobError ? 'true' : null">
      <label class="field-sublabel" for="md-dob">Date of birth</label>
      <BdiDateField
        id="md-dob"
        :model-value="local.dob"
        @update:model-value="onDobChange"
        :max-date="maxDob"
        :invalid="dobError"
      />
      <FieldError :show="dobError" message="Please confirm date of birth." />
    </div>

    <!-- Gender (prefilled from Step 6) -->
    <div class="field stack" :data-error="genderError ? 'true' : null">
      <label class="field-sublabel">Gender</label>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.gender === 'male', 'is-error': genderError }"
          @click="pickGender('male')"
        >Male</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.gender === 'female', 'is-error': genderError }"
          @click="pickGender('female')"
        >Female</button>
      </div>
      <FieldError :show="genderError" message="Please confirm gender." />
    </div>

    <!-- Marital status (prefilled from Step 6) -->
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
      <FieldError :show="maritalError" message="Please confirm marital status." />
    </div>

    <!-- Years of valid driving licence (prefilled from Step 7) -->
    <div class="field stack" :data-error="yearsError ? 'true' : null">
      <label class="field-sublabel">Years of valid driving licence</label>
      <Select
        :model-value="local.yearsLicensed"
        @update:model-value="onYearsChange"
        :options="yearsLicensedOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': yearsError }"
        fluid
      />
      <FieldError :show="yearsError" message="Please confirm years of valid driving licence." />
    </div>

    <!-- At-fault chips (prefilled from Step 7) -->
    <div class="field stack" :data-error="atFaultError ? 'true' : null">
      <p class="field-sublabel">
        Total number of <strong>at-fault</strong> accidents and/or claims in the past 3 years
      </p>
      <div class="chip-row">
        <button
          v-for="c in atFaultOptions"
          :key="`af-${c}`"
          type="button"
          class="chip"
          :class="{ 'is-on': local.atFault === c, 'is-error': atFaultError }"
          @click="setAtFault(c)"
        >{{ c }}</button>
      </div>
      <FieldError :show="atFaultError" message="Please confirm at-fault accidents/claims." />
    </div>

    <!-- Not-at-fault chips (prefilled from Step 7) -->
    <div class="field stack" :data-error="notAtFaultError ? 'true' : null">
      <p class="field-sublabel">
        Total number of <strong>not-at-fault</strong> accidents and/or claims in the past 3 years
      </p>
      <div class="chip-row">
        <button
          v-for="c in notAtFaultOptions"
          :key="`naf-${c}`"
          type="button"
          class="chip"
          :class="{ 'is-on': local.notAtFault === c, 'is-error': notAtFaultError }"
          @click="setNotAtFault(c)"
        >{{ c }}</button>
      </div>
      <FieldError :show="notAtFaultError" message="Please confirm not-at-fault accidents/claims." />
    </div>

    <!-- Certificate of Merit (prefilled from Step 7) -->
    <div class="field stack" :data-error="certError ? 'true' : null">
      <p class="field-sublabel">Entitled to Certificate of Merit?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.certOfMerit === true, 'is-error': certError }"
          @click="setCertOfMerit(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.certOfMerit === false, 'is-error': certError }"
          @click="setCertOfMerit(false)"
        >No</button>
      </div>
      <FieldError :show="certError" message="Please confirm Certificate of Merit eligibility." />
    </div>

    <BdiQuoteFooter
      :disabled="!canContinue"
      :intercept-next="true"
      @blocked="reveal"
      @next="onNext"
    />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; }
.field.stack { gap: 8px; }

.field-sublabel {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.field-sublabel strong { font-weight: 700; }

.yes-no { display: flex; gap: 8px; }
.yn-button {
  flex: 1 1 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  min-height: 56px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.yn-button.is-on { border-color: var(--bdi-green); }
.yn-button.is-error { border-color: var(--bdi-red); }

.chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  flex: 1 1 0;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  min-height: 56px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
}
.chip.is-on { border-color: var(--bdi-green); }
.chip.is-error { border-color: var(--bdi-red); }

.step :deep(.bdi-input.p-inputtext),
.step :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  font-size: 16px;
  color: var(--bdi-carbon);
  font-weight: 400;
  min-height: 56px;
  width: 100%;
}
.step :deep(.bdi-input.is-error.p-inputtext),
.step :deep(.bdi-input.is-error .p-inputtext) {
  border-color: var(--bdi-red);
}
.step :deep(.bdi-select) { width: 100%; }
.step :deep(.bdi-select.is-error) {
  outline: 1px solid var(--bdi-red);
  outline-offset: -1px;
  border-radius: var(--bdi-radius-card);
}
</style>
