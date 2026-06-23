<script setup>
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { validateNric, lookupPostal } from '../utils/nric'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

const local = reactive({
  // Your Details
  fullName: quote.policyholder?.fullName || '',
  nric: quote.policyholder?.nric || '',
  // Your Address — postcode prefilled from Step 8 contact if available
  postalCode: quote.policyholder?.address?.postalCode || quote.contact?.postalCode || '',
  block: quote.policyholder?.address?.block || '',
  street: quote.policyholder?.address?.street || '',
  unit: quote.policyholder?.address?.unit || '',
  buildingName: quote.policyholder?.address?.buildingName || '',
  // Your Car Details — BD scope (odometer is DA-only per KB #7)
  registrationNumber: quote.policyholder?.carDetails?.registrationNumber || '',
  currentInsurer: quote.policyholder?.carDetails?.currentInsurer || '',
  accidentClaimDate: quote.policyholder?.carDetails?.accidentClaimDate || '',
  ownership: quote.policyholder?.carDetails?.ownership || '',
})

const insurerOptions = [
  { label: 'AIG', value: 'AIG' },
  { label: 'AXA / EQ Insurance', value: 'AXA' },
  { label: 'DirectAsia', value: 'DirectAsia' },
  { label: 'FWD', value: 'FWD' },
  { label: 'HL Assurance', value: 'HLA' },
  { label: 'Income (NTUC)', value: 'Income' },
  { label: 'MSIG', value: 'MSIG' },
  { label: 'Sompo', value: 'Sompo' },
  { label: 'Tokio Marine', value: 'TokioMarine' },
  { label: 'Other', value: 'Other' },
  { label: "I don't have one", value: 'None' },
]

function sync() {
  mutable.policyholder = {
    ...quote.policyholder,
    fullName: local.fullName.trim(),
    nric: local.nric.trim().toUpperCase(),
    address: {
      postalCode: local.postalCode,
      block: local.block,
      street: local.street,
      unit: local.unit.trim(),
      buildingName: local.buildingName.trim(),
    },
    carDetails: {
      registrationNumber: local.registrationNumber.trim().toUpperCase(),
      currentInsurer: local.currentInsurer,
      accidentClaimDate: local.accidentClaimDate,
      ownership: local.ownership,
    },
  }
}

function onPostalCodeInput(v) {
  local.postalCode = v || ''
  if (/^\d{6}$/.test(local.postalCode)) {
    const hit = lookupPostal(local.postalCode)
    if (hit) {
      local.block = hit.block === '—' ? local.block : hit.block
      local.street = hit.street
    }
  }
  sync()
}

function onNricInput(v) { local.nric = (v || '').toUpperCase(); sync() }
function onAccidentDateInput(v) {
  // Light MM/YYYY mask: digits + slash
  let raw = (v || '').replace(/[^\d]/g, '').slice(0, 6)
  if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2)
  local.accidentClaimDate = raw
  sync()
}
function pickOwnership(v) { local.ownership = v; sync() }

const nricValid = computed(() => validateNric(local.nric))
const postalValid = computed(() => /^\d{6}$/.test(local.postalCode))
const vrmValid = computed(() =>
  // SG VRM rough pattern: 1–3 letters + 1–4 digits + 1 letter (e.g. SGA1234B).
  /^[A-Z]{1,3}\d{1,4}[A-Z]$/.test(local.registrationNumber.trim().toUpperCase())
)
const accidentDateValid = computed(() => {
  if (!local.accidentClaimDate) return true   // optional unless claims declared upstream
  if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(local.accidentClaimDate)) return false
  return true
})

const canContinue = computed(() =>
  local.fullName.trim().length > 0
  && nricValid.value
  && postalValid.value
  && local.block.length > 0
  && local.street.length > 0
  && local.unit.trim().length > 0
  && vrmValid.value
  && local.currentInsurer !== ''
  && accidentDateValid.value
  && local.ownership !== ''
)

const nameError = computed(() => showErrors.value && local.fullName.trim().length === 0)
const nricError = computed(() => showErrors.value && !nricValid.value)
const postalError = computed(() => showErrors.value && !postalValid.value)
const blockError = computed(() => showErrors.value && local.block.length === 0)
const streetError = computed(() => showErrors.value && local.street.length === 0)
const unitError = computed(() => showErrors.value && local.unit.trim().length === 0)
const vrmError = computed(() => showErrors.value && !vrmValid.value)
const insurerError = computed(() => showErrors.value && local.currentInsurer === '')
const accidentDateError = computed(() => showErrors.value && !accidentDateValid.value)
const ownershipError = computed(() => showErrors.value && local.ownership === '')
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Just a few more details to get you covered</h1>

    <!-- Your Details -->
    <div class="group">
      <p class="group-title">Your Details</p>

      <div class="field" :data-error="nameError ? 'true' : null">
        <InputText
          v-model="local.fullName"
          @update:model-value="sync"
          placeholder="Full name as per NRIC"
          class="bdi-input"
          :class="{ 'is-error': nameError }"
          fluid
        />
        <FieldError :show="nameError" message="Enter your full legal name as per NRIC." />
      </div>

      <div class="field" :data-error="nricError ? 'true' : null">
        <InputText
          :model-value="local.nric"
          @update:model-value="onNricInput"
          placeholder="NRIC / FIN"
          class="bdi-input"
          :class="{ 'is-error': nricError }"
          maxlength="9"
          fluid
        />
        <FieldError :show="nricError" message="Enter a valid NRIC or FIN." />
      </div>
    </div>

    <!-- Your Address -->
    <div class="group">
      <p class="group-title">Your Address</p>

      <div class="field" :data-error="postalError ? 'true' : null">
        <InputText
          :model-value="local.postalCode"
          @update:model-value="onPostalCodeInput"
          placeholder="Postal code"
          class="bdi-input"
          :class="{ 'is-error': postalError }"
          inputmode="numeric"
          maxlength="6"
          fluid
        />
        <FieldError :show="postalError" message="Enter a 6-digit postal code." />
      </div>

      <div class="field" :data-error="blockError ? 'true' : null">
        <InputText
          v-model="local.block"
          @update:model-value="sync"
          placeholder="Building / block / house no."
          class="bdi-input"
          :class="{ 'is-error': blockError }"
          fluid
        />
        <FieldError :show="blockError" message="Enter your block or house number." />
      </div>

      <div class="field" :data-error="streetError ? 'true' : null">
        <InputText
          v-model="local.street"
          @update:model-value="sync"
          placeholder="Street name"
          class="bdi-input"
          :class="{ 'is-error': streetError }"
          fluid
        />
        <FieldError :show="streetError" message="Enter your street name." />
      </div>

      <div class="field" :data-error="unitError ? 'true' : null">
        <InputText
          v-model="local.unit"
          @update:model-value="sync"
          placeholder="Unit number (e.g. #02-15)"
          class="bdi-input"
          :class="{ 'is-error': unitError }"
          fluid
        />
        <FieldError :show="unitError" message="Enter your unit number." />
      </div>

      <div class="field">
        <InputText
          v-model="local.buildingName"
          @update:model-value="sync"
          placeholder="Building name (if applicable)"
          class="bdi-input"
          fluid
        />
      </div>
    </div>

    <!-- Your Car Details -->
    <div class="group">
      <p class="group-title">Your Car Details</p>

      <div class="field" :data-error="vrmError ? 'true' : null">
        <InputText
          v-model="local.registrationNumber"
          @update:model-value="sync"
          placeholder="Car registration number (e.g. SGA1234B)"
          class="bdi-input"
          :class="{ 'is-error': vrmError }"
          maxlength="8"
          fluid
        />
        <FieldError :show="vrmError" message="Enter a valid Singapore car plate (e.g. SGA1234B)." />
      </div>

      <div class="field" :data-error="insurerError ? 'true' : null">
        <Select
          :model-value="local.currentInsurer"
          @update:model-value="(v) => { local.currentInsurer = v; sync() }"
          :options="insurerOptions"
          option-label="label"
          option-value="value"
          placeholder="Current insurer"
          class="bdi-select"
          :class="{ 'is-error': insurerError }"
          fluid
        />
        <FieldError :show="insurerError" message="Select your current insurer or 'I don't have one'." />
      </div>

      <div class="field" :data-error="accidentDateError ? 'true' : null">
        <p class="field-label">Date of accident / claim (if any)</p>
        <InputText
          :model-value="local.accidentClaimDate"
          @update:model-value="onAccidentDateInput"
          placeholder="MM/YYYY"
          class="bdi-input"
          :class="{ 'is-error': accidentDateError }"
          inputmode="numeric"
          maxlength="7"
          fluid
        />
        <FieldError :show="accidentDateError" message="Enter the date in MM/YYYY format, or leave blank if none." />
      </div>

      <div class="field" :data-error="ownershipError ? 'true' : null">
        <p class="field-label">Private or company owned?</p>
        <div class="yes-no">
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-selected': local.ownership === 'private', 'is-error': ownershipError }"
            @click="pickOwnership('private')"
          >Private</button>
          <button
            type="button"
            class="yn-button"
            :class="{ 'is-selected': local.ownership === 'company', 'is-error': ownershipError }"
            @click="pickOwnership('company')"
          >Company</button>
        </div>
        <FieldError :show="ownershipError" message="Select Private or Company." />
      </div>
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

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
}
.group-title {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--bdi-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
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

.step :deep(.bdi-input.p-inputtext),
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
  width: 100%;
}
.step :deep(.bdi-select) { width: 100%; }
</style>
