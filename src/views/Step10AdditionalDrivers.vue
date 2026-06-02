<script setup>
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import BdiDateField from '../components/BdiDateField.vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Figma 4124-13337 — three scenarios:
//   1. Immediately Proceed (No household + No outside drivers).
//   2. One Household member.
//   3. Two+ Household members (list view with Edit + Remove).

const local = reactive({
  hasHousehold: quote.hasAdditionalDrivers ?? null,
  hasOutside: quote.hasOutsideDrivers ?? null,
  drivers: [...(quote.additionalDrivers || [])],
  showForm: false,
  editingIndex: null,
  draft: blankDriver(),
})

const relationshipOptions = [
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Parent', value: 'Parent' },
  { label: 'Child', value: 'Child' },
  { label: 'Sibling', value: 'Sibling' },
  { label: 'Other household member', value: 'Other' },
]

const claimChips = [0, 1, 2, '3+']
const notAtFaultChips = [0, 1, 2, 3, '4+']

function blankDriver() {
  return {
    relationship: '',
    name: '',
    nric: '',
    dob: null,
    atFault: null,
    notAtFault: null,
  }
}

function setHousehold(v) {
  local.hasHousehold = v
  mutable.hasAdditionalDrivers = v
  if (!v) {
    local.drivers = []
    local.showForm = false
    mutable.additionalDrivers = []
  }
}

function setOutside(v) {
  local.hasOutside = v
  mutable.hasOutsideDrivers = v
}

function startAdd() {
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
}

function cancelForm() {
  local.showForm = false
  local.draft = blankDriver()
  local.editingIndex = null
}

const canSave = computed(() => {
  const d = local.draft
  return Boolean(d.relationship && d.name && d.nric && d.dob && d.atFault !== null && d.notAtFault !== null)
})

function saveDriver() {
  if (!canSave.value) return
  if (local.editingIndex !== null) {
    local.drivers[local.editingIndex] = { ...local.draft }
  } else {
    local.drivers.push({ ...local.draft })
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
  showErrors.value && local.hasHousehold === true && local.drivers.length === 0
)
const outsideError = computed(() =>
  showErrors.value && local.hasHousehold !== null && local.hasOutside === null
)

const summary = (d) => {
  const last4 = d.nric ? d.nric.slice(-4) : ''
  return `${d.relationship} · ${d.name}${last4 ? ' · …' + last4 : ''}`
}

const claimsSummary = (d) =>
  `${d.notAtFault} not-at-fault · ${d.atFault} at-fault`
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Who else drives your car?</h1>

    <div class="block" :data-error="householdError ? 'true' : null">
      <p class="bdi-field-label">Does anyone else in your household drive this car?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.hasHousehold === true, 'is-error': householdError }"
          @click="setHousehold(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.hasHousehold === false, 'is-error': householdError }"
          @click="setHousehold(false)"
        >No</button>
      </div>
      <FieldError :show="householdError" message="Let us know if anyone else in your household drives this car." />
    </div>

    <template v-if="local.hasHousehold === true">
      <div v-for="(d, i) in local.drivers" :key="i" class="driver-card">
        <div class="driver-row">
          <p class="driver-summary">{{ summary(d) }}</p>
          <button type="button" class="icon-btn" aria-label="Edit driver" @click="editDriver(i)">
            <i class="pi pi-pencil"></i>
          </button>
          <button type="button" class="icon-btn" aria-label="Remove driver" @click="removeDriver(i)">
            <i class="pi pi-trash"></i>
          </button>
        </div>
        <p class="driver-meta">{{ claimsSummary(d) }}</p>
      </div>

      <div v-if="local.showForm" class="form-card">
        <p class="form-title">{{ local.editingIndex !== null ? 'Edit driver' : 'Please tell us about the driver' }}</p>

        <div class="field">
          <label class="bdi-field-label">Relationship to main driver</label>
          <Select
            v-model="local.draft.relationship"
            :options="relationshipOptions"
            option-label="label"
            option-value="value"
            placeholder="Choose relationship"
            fluid
          />
        </div>

        <div class="field">
          <label class="bdi-field-label">Full name (as per NRIC)</label>
          <InputText v-model="local.draft.name" placeholder="John Doe" fluid />
        </div>

        <div class="field">
          <label class="bdi-field-label">NRIC / FIN</label>
          <InputText v-model="local.draft.nric" placeholder="SXXXXXXXA" fluid />
        </div>

        <div class="field">
          <label class="bdi-field-label">Date of birth</label>
          <BdiDateField v-model="local.draft.dob" />
        </div>

        <div class="field">
          <label class="bdi-field-label">At-fault accidents/claims in past 3 years</label>
          <div class="chip-row">
            <button
              v-for="c in claimChips"
              :key="c"
              type="button"
              class="chip"
              :class="{ 'is-on': local.draft.atFault === c }"
              @click="local.draft.atFault = c"
            >{{ c }}</button>
          </div>
        </div>

        <div class="field">
          <label class="bdi-field-label">Not-at-fault accidents/claims in past 3 years</label>
          <div class="chip-row">
            <button
              v-for="c in notAtFaultChips"
              :key="c"
              type="button"
              class="chip"
              :class="{ 'is-on': local.draft.notAtFault === c }"
              @click="local.draft.notAtFault = c"
            >{{ c }}</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="form-cancel" @click="cancelForm">Cancel</button>
          <button type="button" class="form-save" :disabled="!canSave" @click="saveDriver">
            Save driver
          </button>
        </div>
      </div>

      <button
        v-if="!local.showForm"
        type="button"
        class="add-driver"
        :class="{ 'is-error': driversError }"
        :data-error="driversError ? 'true' : null"
        @click="startAdd"
      >
        <i class="pi pi-plus"></i>
        Add a driver
      </button>
      <FieldError :show="driversError" message="Add at least one household driver, or choose No above." />

      <p class="callout">
        <i class="pi pi-info-circle" aria-hidden="true"></i>
        <span>Additional Young and/or Inexperienced Driver Excess of $2,500 (before GST) applies if the
          car is driven by anyone under 25 or with less than 2 years' valid driving licence, and not
          named under the policy.</span>
      </p>
    </template>

    <div v-if="local.hasHousehold !== null" class="block" :data-error="outsideError ? 'true' : null">
      <p class="bdi-field-label">Does anyone outside your household drive this car?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.hasOutside === true, 'is-error': outsideError }"
          @click="setOutside(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.hasOutside === false, 'is-error': outsideError }"
          @click="setOutside(false)"
        >No</button>
      </div>
      <FieldError :show="outsideError" message="Let us know if anyone outside your household drives this car." />
      <p v-if="local.hasOutside === true" class="bdi-help">
        Unnamed household members are not covered. Any unnamed driver involved in 2 or more at-fault
        accidents in the 3 years before the policy starts is excluded automatically.
      </p>
    </div>

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

.block { display: flex; flex-direction: column; gap: 8px; }

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
  min-height: 48px;
}
.yn-button.is-selected {
  border-color: var(--bdi-green);}
.yn-button.is-error { border-color: var(--bdi-red); }

.driver-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.driver-row { display: flex; align-items: center; gap: 8px; }
.driver-summary { margin: 0; flex: 1; font-size: 14px; font-weight: 900; color: var(--bdi-carbon); }
.driver-meta { margin: 0; font-size: 12px; color: var(--bdi-grey-600); }
.icon-btn {
  background: transparent;
  border: 0;
  color: var(--bdi-grey-600);
  cursor: pointer;
  padding: 4px;
}
.icon-btn:hover { color: var(--bdi-carbon); }

.form-card {
  background: #fff;
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--bdi-carbon);
}
.field { display: flex; flex-direction: column; }

.chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 8px 14px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-carbon);
  cursor: pointer;
  min-width: 48px;
}
.chip.is-on {
  border-color: var(--bdi-green);}

.form-actions { display: flex; gap: 8px; }
.form-cancel,
.form-save {
  flex: 1;
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  min-height: 48px;
}
.form-cancel {
  background: #fff;
  border: 1px solid var(--bdi-carbon);
  color: var(--bdi-carbon);
}
.form-save {
  background: var(--bdi-green);
  border: 0;
  color: #fff;
}
.form-save:disabled {
  background: var(--bdi-grey-200);
  color: var(--bdi-grey-600);
  cursor: not-allowed;
}

.add-driver {
  background: #fff;
  border: 1px dashed var(--bdi-grey-500);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  color: var(--bdi-carbon);
  font-family: var(--bdi-font);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}
.add-driver:hover { border-color: var(--bdi-green); color: var(--bdi-green); }
.add-driver.is-error { border-color: var(--bdi-red); border-style: solid; color: var(--bdi-red); }

.callout {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 0;
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-card);
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--bdi-carbon);
}
.callout .pi {
  color: var(--bdi-cyan);
  flex-shrink: 0;
  margin-top: 1px;
}

.bdi-help {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--bdi-grey-600);
  line-height: 1.5;
}
</style>
