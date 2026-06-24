<script setup>
/**
 * Step 10 — Who drives your car?
 * Figma BD mobile reference: 1735-2956 (multiple states pasted from spec).
 *
 * Two yes/no branches, in order:
 *   Q1: "Does anyone else IN YOUR HOUSEHOLD drive this car?"
 *     - Yes → driver form appears, user must save at least one driver
 *       (max 8 per OMP-19). Each saved driver = +$50.00 premium impact.
 *     - No → continue.
 *   Q2: "Will anyone OUTSIDE YOUR HOUSEHOLD drive this car?"
 *     - Yes → Authorised Driver Plan added (+$200.00) with warning callout.
 *     - No → continue.
 *
 * Driver form fields: Full name, NRIC/FIN, DOB, Gender, Marital status,
 * Years of valid driving licence, At-fault (0-4+), Not-at-fault (0-5+).
 *
 * No NCD or Certificate of Merit per driver — NCD attaches to the
 * policyholder (KB #4); CoM is asked at Step 7 for main + named drivers.
 */
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import BdiDateField from '../components/BdiDateField.vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { validateNric } from '../utils/nric'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

const MAX_DRIVERS = 8
const PREMIUM_PER_DRIVER = 50.0
const AUTHORISED_DRIVER_PLAN_COST = 200.0

const local = reactive({
  hasHousehold: quote.hasAdditionalDrivers ?? null,
  hasOutside: quote.hasOutsideDrivers ?? null,
  drivers: [...(quote.additionalDrivers || [])],
  showForm: false,
  editingIndex: null,
  draft: blankDriver(),
})

function blankDriver() {
  return {
    name: '',
    nric: '',
    dob: null,
    gender: '',
    maritalStatus: '',
    yearsLicensed: null,
    atFault: null,
    notAtFault: null,
  }
}

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

// Match Step 7 (main driver) chip ranges exactly — UW gate also applies.
const atFaultOptions = [0, 1, 2, 3, '4+']
const notAtFaultOptions = [0, 1, 2, 3, 4, '5+']

function setHousehold(v) {
  local.hasHousehold = v
  mutable.hasAdditionalDrivers = v
  if (!v) {
    local.drivers = []
    local.showForm = false
    local.editingIndex = null
    mutable.additionalDrivers = []
  } else {
    local.showForm = true
  }
}

function setOutside(v) {
  local.hasOutside = v
  mutable.hasOutsideDrivers = v
  mutable.authorisedDriverPlan = v === true
}

function startAdd() {
  if (local.drivers.length >= MAX_DRIVERS) return
  local.draft = blankDriver()
  local.editingIndex = null
  local.showForm = true
}

function editDriver(i) {
  local.draft = { ...local.drivers[i] }
  local.editingIndex = i
  local.showForm = true
}

function removeDriver(i) {
  local.drivers.splice(i, 1)
  mutable.additionalDrivers = [...local.drivers]
  if (local.drivers.length === 0 && local.hasHousehold === true) {
    local.showForm = true
  }
}

function cancelForm() {
  local.showForm = false
  local.draft = blankDriver()
  local.editingIndex = null
}

function pickDraftGender(v) { local.draft.gender = v }
function pickDraftAtFault(v) { local.draft.atFault = v }
function pickDraftNotAtFault(v) { local.draft.notAtFault = v }

const draftNricValid = computed(() => validateNric(local.draft.nric))

const canSaveDriver = computed(() => {
  const d = local.draft
  return Boolean(
    d.name.trim()
    && draftNricValid.value
    && d.dob
    && d.gender
    && d.maritalStatus
    && d.yearsLicensed !== null
    && d.atFault !== null
    && d.notAtFault !== null,
  )
})

function saveDriver() {
  if (!canSaveDriver.value) return
  const record = {
    ...local.draft,
    name: local.draft.name.trim(),
    nric: local.draft.nric.trim().toUpperCase(),
  }
  if (local.editingIndex !== null) {
    local.drivers[local.editingIndex] = record
  } else {
    local.drivers.push(record)
  }
  mutable.additionalDrivers = [...local.drivers]
  cancelForm()
}

const canContinue = computed(() => {
  if (local.hasHousehold === null || local.hasOutside === null) return false
  if (local.hasHousehold === true && local.drivers.length === 0) return false
  return true
})

const householdError = computed(() => showErrors.value && local.hasHousehold === null)
const driversError = computed(() =>
  showErrors.value && local.hasHousehold === true && local.drivers.length === 0,
)
const outsideError = computed(() => showErrors.value && local.hasOutside === null)

const householdPremiumImpact = computed(() =>
  local.drivers.length * PREMIUM_PER_DRIVER,
)

function fmt(n) {
  return `$${n.toFixed(2)}`
}

function driverSubtitle(d) {
  const g = d.gender === 'male' ? 'Male' : d.gender === 'female' ? 'Female' : ''
  const dob = d.dob ? new Date(d.dob).toLocaleDateString('en-GB') : ''
  return [g, dob].filter(Boolean).join(' | ')
}

const showFormView = computed(
  () => local.hasHousehold === true && local.showForm,
)
const showDriverList = computed(
  () => local.hasHousehold === true && local.drivers.length > 0 && !local.showForm,
)
const showQ2 = computed(
  () => local.hasHousehold === false || showDriverList.value,
)
const showAuthorisedPlan = computed(
  () => showQ2.value && local.hasOutside === true,
)

const atCap = computed(() => local.drivers.length >= MAX_DRIVERS)
</script>

<template>
  <section class="step">
    <h1 class="bdi-page-title">Who drives your car?</h1>

    <!-- Q1: Household -->
    <div class="block" :data-error="householdError ? 'true' : null">
      <p class="field-label">
        Does anyone else
        <strong>in your household</strong>
        drive this car?
      </p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.hasHousehold === true, 'is-error': householdError }"
          @click="setHousehold(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.hasHousehold === false, 'is-error': householdError }"
          @click="setHousehold(false)"
        >No</button>
      </div>
      <FieldError :show="householdError" message="Let us know if anyone in your household drives this car." />
    </div>

    <!-- Q1 = Yes, driver form -->
    <div v-if="showFormView" class="form-block">
      <p class="form-title">Please tell us about the driver</p>

      <div class="field">
        <InputText
          v-model="local.draft.name"
          placeholder="Full name (as per NRIC)"
          class="bdi-input"
          fluid
        />
      </div>

      <div class="field">
        <InputText
          :model-value="local.draft.nric"
          @update:model-value="(v) => (local.draft.nric = (v || '').toUpperCase())"
          placeholder="NRIC/FIN"
          class="bdi-input"
          maxlength="9"
          fluid
        />
      </div>

      <div class="field stack">
        <label class="field-sublabel" for="adddob">Date of birth</label>
        <BdiDateField
          id="adddob"
          :model-value="local.draft.dob"
          @update:model-value="(v) => (local.draft.dob = v)"
          :max-date="new Date()"
        />
      </div>

      <div class="field stack">
        <label class="field-sublabel">Gender</label>
        <div class="yes-no">
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-on': local.draft.gender === 'male' }"
            @click="pickDraftGender('male')"
          >Male</button>
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-on': local.draft.gender === 'female' }"
            @click="pickDraftGender('female')"
          >Female</button>
        </div>
      </div>

      <div class="field">
        <Select
          v-model="local.draft.maritalStatus"
          :options="maritalOptions"
          option-label="label"
          option-value="value"
          placeholder="Marital status"
          class="bdi-select"
          fluid
        />
      </div>

      <div class="field stack">
        <label class="field-sublabel">Years of valid driving licence</label>
        <Select
          v-model="local.draft.yearsLicensed"
          :options="yearsLicensedOptions"
          option-label="label"
          option-value="value"
          placeholder=" "
          class="bdi-select"
          fluid
        />
      </div>

      <div class="field stack">
        <p class="field-sublabel">
          Total number of <strong>at-fault</strong> accidents and/or claims in the past 3 years
        </p>
        <div class="chip-row">
          <button
            v-for="c in atFaultOptions"
            :key="`af-${c}`"
            type="button"
            class="chip"
            :class="{ 'is-on': local.draft.atFault === c }"
            @click="pickDraftAtFault(c)"
          >{{ c }}</button>
        </div>
      </div>

      <div class="field stack">
        <p class="field-sublabel">
          Total number of <strong>not-at-fault</strong> accidents and/or claims in the past 3 years
        </p>
        <div class="chip-row">
          <button
            v-for="c in notAtFaultOptions"
            :key="`naf-${c}`"
            type="button"
            class="chip"
            :class="{ 'is-on': local.draft.notAtFault === c }"
            @click="pickDraftNotAtFault(c)"
          >{{ c }}</button>
        </div>
      </div>

      <button
        type="button"
        class="save-driver"
        :class="{ 'is-ready': canSaveDriver }"
        :disabled="!canSaveDriver"
        @click="saveDriver"
      >Save driver</button>

      <button
        v-if="local.editingIndex !== null || local.drivers.length > 0"
        type="button"
        class="cancel-form"
        @click="cancelForm"
      >Cancel</button>
    </div>

    <!-- Q1 = Yes, driver list -->
    <template v-if="showDriverList">
      <div class="drivers-list">
        <div v-for="(d, i) in local.drivers" :key="i" class="driver-card">
          <div class="driver-info">
            <p class="driver-name">{{ d.name }}</p>
            <p class="driver-meta">{{ driverSubtitle(d) }}</p>
          </div>
          <div class="driver-actions">
            <button type="button" class="link-edit" @click="editDriver(i)">Edit</button>
            <button type="button" class="link-remove" @click="removeDriver(i)">Remove</button>
          </div>
        </div>

        <button
          v-if="!atCap"
          type="button"
          class="add-driver"
          @click="startAdd"
        >+ Add driver</button>
        <p v-else class="cap-note">You can add a maximum of {{ MAX_DRIVERS }} named drivers.</p>

        <!-- Impact on Premium pill -->
        <div class="impact-pill">
          <span class="impact-label">Impact on Premium</span>
          <span class="impact-amount">+{{ fmt(householdPremiumImpact) }}</span>
        </div>
      </div>
    </template>
    <FieldError :show="driversError" message="Please add at least one household driver, or change Q1 to No." />

    <!-- Divider before Q2 -->
    <hr v-if="showQ2" class="divider" />

    <!-- Q2: Outside household -->
    <div v-if="showQ2" class="block" :data-error="outsideError ? 'true' : null">
      <p class="field-label">
        Will anyone
        <strong>outside your household</strong>
        drive this car?
      </p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.hasOutside === true, 'is-error': outsideError }"
          @click="setOutside(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.hasOutside === false, 'is-error': outsideError }"
          @click="setOutside(false)"
        >No</button>
      </div>
      <FieldError :show="outsideError" message="Let us know if anyone outside your household will drive this car." />
    </div>

    <!-- Authorised Driver Plan (Q2 = Yes) -->
    <template v-if="showAuthorisedPlan">
      <div class="impact-pill">
        <span class="impact-label">Authorised Driver Plan</span>
        <span class="impact-amount">+{{ fmt(AUTHORISED_DRIVER_PLAN_COST) }}</span>
      </div>

      <div class="warning-callout">
        <svg class="warning-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M11.1069 9.84184V14.0375C11.1069 14.5303 11.5047 14.9282 11.9975 14.9282C12.4903 14.9282 12.8882 14.5303 12.8882 14.0375V9.84184C12.8882 9.34903 12.4903 8.95117 11.9975 8.95117C11.5047 8.95117 11.1069 9.34903 11.1069 9.84184ZM11.9975 17.2566C12.4903 17.2566 12.8882 16.8587 12.8882 16.3659C12.8882 15.8731 12.4903 15.4752 11.9975 15.4752C11.5047 15.4752 11.1069 15.8731 11.1069 16.3659C11.1069 16.8587 11.5047 17.2566 11.9975 17.2566Z"
            fill="#F2A900"
          />
          <path
            d="M4.836 19.6213C3.29881 19.6213 2.67036 18.5317 3.43896 17.2024L10.6005 4.80087C11.3691 3.47165 12.626 3.47165 13.3946 4.80087L20.5561 17.2024C21.3247 18.5317 20.6963 19.6213 19.1591 19.6213H4.836Z"
            stroke="#F2A900"
            stroke-width="1.36"
            fill="none"
          />
        </svg>
        <div class="warning-body">
          <p class="warning-title">Authorised Driver Plan</p>
          <p class="warning-text">
            A household member of the Main Driver who is not named as a Named Driver will not be covered under your Policy.
          </p>
          <p class="warning-text">
            Any unnamed driver/person who was involved in 2 or more accidents where he/she is partially or fully at fault within the 3 years preceding the start date of the Policy Term will not be covered under your Policy.
          </p>
        </div>
      </div>
    </template>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bdi-page-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 20px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.3;
}

.block { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.field-label strong { font-weight: 700; }

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

/* Driver form */
.form-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
}
.field { display: flex; flex-direction: column; }
.field.stack { gap: 8px; }

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
.step :deep(.bdi-select) { width: 100%; }

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

/* Save driver: disabled = grey, enabled = green */
.save-driver {
  background: #E4E4E4;
  color: #858585;
  border: 1px solid #E4E4E4;
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  min-height: 48px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
}
.save-driver.is-ready {
  background: var(--bdi-green);
  color: #fff;
  border-color: var(--bdi-green);
  cursor: pointer;
}

.cancel-form {
  background: transparent;
  border: 0;
  color: var(--bdi-cyan);
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 400;
  padding: 8px 0;
  cursor: pointer;
}

/* Driver list */
.drivers-list { display: flex; flex-direction: column; gap: 16px; }
.driver-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 8px;
}
.driver-info { flex: 1 1 0; display: flex; flex-direction: column; gap: 4px; }
.driver-name {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-carbon);
}
.driver-meta {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 400;
  color: #858585;
}
.driver-actions { display: flex; align-items: center; gap: 24px; }
.link-edit, .link-remove {
  background: transparent;
  border: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
}
.link-edit { color: var(--bdi-cyan); }
.link-remove { color: var(--bdi-red); }

.add-driver {
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 4px;
  padding: 12px 16px;
  min-height: 59px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-cyan);
  text-align: center;
  cursor: pointer;
}
.cap-note {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  color: var(--bdi-grey-600);
}

/* Impact on Premium pill (grey rounded box, green amount right-aligned) */
.impact-pill {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  background: #F5F5F5;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  font-family: var(--bdi-font);
}
.impact-label {
  font-size: 14px;
  font-weight: 400;
  color: #767676;
}
.impact-amount {
  flex: 1 1 0;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-green);
}

.divider {
  border: 0;
  border-top: 1px solid #CCCCCC;
  margin: 0;
}

/* Authorised Driver Plan warning callout */
.warning-callout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: #E4E4E4;
  border: 1px solid rgba(242, 169, 0, 0.30);
  border-radius: 8px;
}
.warning-icon { width: 24px; height: 24px; flex-shrink: 0; }
.warning-body {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.warning-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.warning-text {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
</style>
