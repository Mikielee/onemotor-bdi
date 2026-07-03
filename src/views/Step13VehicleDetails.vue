<script setup>
/**
 * Step 13 — Vehicle Details (OMP-652).
 * Figma BD/DA mobile reference: 2131-1607 canvas → 3329:43143 / 3329:41901
 * mobile mocks (DA-branded blue accents; BD mirrors with red brand vars).
 *
 * Section: "Vehicle to be Insured"
 *  - Car make, model, year (dropdowns, prefilled from Step 3 — still editable
 *    in case the customer corrects something at the end of the journey).
 *  - Inline helper banner reminding the cover-type age limit (Comprehensive
 *    has no cap, TPO/TPFT caps at 15 years — KB-9).
 *  - VRM input. If they don't have one yet, a cyan text link swaps in a
 *    Chassis Number field (OMP-85 decision: VRM XOR chassis required).
 *  - Current insurer (optional dropdown).
 *  - Financing Y/N. Yes reveals a Financial Institution dropdown AND, if the
 *    Step 1 cover is TPO or TPFT, a warning callout flagging that financed
 *    cars usually require Comprehensive (task 2dd6edc2-ddee).
 *
 * Odometer is NOT collected on BD per KB-7 (DA-only). Engine number,
 * car colour, accident-claim date, and ownership are NOT collected here:
 * engine number is removed entirely, colour is post-quote, the others
 * live elsewhere in the journey.
 */
import { computed, reactive, ref, watch } from 'vue'
import BdiFloatInput from '../components/BdiFloatInput.vue'
import BdiSearchSelect from '../components/BdiSearchSelect.vue'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

const CURRENT_YEAR = 2026
const MAX_AGE_RESTRICTIVE = 15

const restrictiveCover = computed(
  () => quote.coverType === 'third-party' || quote.coverType === 'third-party-fire-theft',
)

const yearOptions = computed(() => {
  const minYear = restrictiveCover.value
    ? CURRENT_YEAR - MAX_AGE_RESTRICTIVE
    : CURRENT_YEAR - 30
  return Array.from({ length: CURRENT_YEAR - minYear + 1 }, (_, i) => {
    const y = CURRENT_YEAR - i
    return { label: `${y}`, value: y }
  })
})

const POPULAR_MAKES = ['BMW', 'BYD', 'Honda', 'Hyundai', 'KIA']
const ALL_MAKES = [
  'Alfa Romeo', 'Audi', 'BMW', 'BYD', 'Citroen', 'Honda', 'Hyundai', 'KIA',
  'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Peugeot',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
].sort()
const groupedMakes = computed(() => [
  { label: 'Popular brands', items: POPULAR_MAKES.map((m) => ({ label: m, value: m })) },
  { label: 'All brands', items: ALL_MAKES.map((m) => ({ label: m, value: m })) },
])

const modelsByMake = {
  Toyota: ['Corolla Altis', 'Camry 2.0', 'Camry 2.4', 'Camry 2.5', 'RAV4', 'Vios', 'Yaris Cross', 'Prius', 'Sienta', 'Wish', 'Fortuner'],
  Honda: ['Civic', 'Vezel', 'HR-V', 'Jazz', 'Freed'],
  Mazda: ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-30'],
  Mitsubishi: ['Attrage', 'ASX', 'Outlander'],
  Nissan: ['Note', 'Qashqai', 'Serena'],
  Hyundai: ['Avante', 'Kona', 'Tucson'],
  KIA: ['Cerato', 'Niro', 'Sorento'],
  BMW: ['3 Series', '5 Series', 'X1', 'X3'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA'],
  Audi: ['A3', 'A4', 'Q3'],
  Volkswagen: ['Golf', 'Polo', 'Tiguan'],
  Volvo: ['XC40', 'XC60', 'S60'],
  Tesla: ['Model 3', 'Model Y'],
  Lexus: ['IS', 'NX', 'RX'],
  BYD: ['Atto 3', 'Dolphin', 'Seal'],
  'Alfa Romeo': ['Giulia', 'Stelvio'],
  Citroen: ['C3', 'C4'],
  Peugeot: ['208', '3008'],
  Subaru: ['Forester', 'Impreza', 'XV'],
}
const modelOptions = computed(() => {
  if (!local.carMake) return []
  return (modelsByMake[local.carMake] || []).map((m) => ({ label: m, value: m }))
})

// Same insurer list as Step 12's older car-details section. Optional per
// OMP-85 ("Current insurer remains optional").
const insurerOptions = [
  { label: 'AIG', value: 'AIG' },
  { label: 'AXA / EQ Insurance', value: 'AXA' },
  { label: 'Budget Direct Insurance', value: 'BDI' },
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

const financialInstitutionOptions = [
  { label: 'DBS Bank Ltd', value: 'DBS' },
  { label: 'OCBC Bank', value: 'OCBC' },
  { label: 'UOB', value: 'UOB' },
  { label: 'Maybank', value: 'Maybank' },
  { label: 'Standard Chartered', value: 'SCB' },
  { label: 'HSBC', value: 'HSBC' },
  { label: 'Citibank', value: 'Citi' },
  { label: 'Hong Leong Finance', value: 'HLF' },
  { label: 'Tokyo Century Leasing', value: 'TCL' },
  { label: 'Other', value: 'Other' },
]

// Car make/model/year prefill from Step 3 — same car, just a confirmation
// step at the end of the journey. Reads from the root store (Step 3 writes
// there directly) so back-and-forth navigation keeps the latest value.
const local = reactive({
  carMake: quote.carMake || '',
  carModel: quote.carModel || '',
  carYear: quote.carYear || null,
  registrationNumber: quote.policyholder?.carDetails?.registrationNumber || '',
  chassisNumber: quote.policyholder?.carDetails?.chassisNumber || '',
  currentInsurer: quote.policyholder?.carDetails?.currentInsurer || '',
  financing: quote.policyholder?.carDetails?.financing ?? null,
  financialInstitution: quote.policyholder?.carDetails?.financialInstitution || '',
})

// VRM-or-chassis toggle. If chassis is already filled (rehydrated state),
// land on the chassis input rather than the VRM input.
const useChassis = ref(
  Boolean(local.chassisNumber) && !local.registrationNumber,
)

watch(useChassis, (now) => {
  if (now) local.registrationNumber = ''
  else local.chassisNumber = ''
  sync()
})

// Clear model when make changes mid-edit.
watch(() => local.carMake, () => {
  if (local.carModel && !(modelsByMake[local.carMake] || []).includes(local.carModel)) {
    local.carModel = ''
  }
})

function sync() {
  // Car make/model/year live at the root of the store (Step 3 writes
  // there). Any edit here propagates back so there's a single source
  // of truth for the car identity.
  mutable.carMake = local.carMake
  mutable.carModel = local.carModel
  mutable.carYear = local.carYear

  mutable.policyholder = {
    ...quote.policyholder,
    carDetails: {
      ...quote.policyholder?.carDetails,
      registrationNumber: local.registrationNumber.trim().toUpperCase(),
      chassisNumber: local.chassisNumber.trim().toUpperCase(),
      currentInsurer: local.currentInsurer,
      financing: local.financing,
      financialInstitution: local.financialInstitution,
    },
  }
}

function pickFinancing(v) {
  local.financing = v
  if (v === false) local.financialInstitution = ''
  sync()
}

function onVrmInput(v) { local.registrationNumber = (v || '').toUpperCase(); sync() }
function onChassisInput(v) { local.chassisNumber = (v || '').toUpperCase(); sync() }

// Helper banner is only shown for TPO/TPFT where the 15-year cap is a
// real eligibility constraint (KB-9). Comprehensive has no age cap, so
// the banner is hidden on comprehensive quotes.
const helperText = computed(() =>
  restrictiveCover.value
    ? 'Third-party covers are available for cars up to 15 years old.'
    : '',
)

const showFinancingAlert = computed(
  () => restrictiveCover.value && local.financing === true,
)

const vrmOrChassisFilled = computed(
  () => useChassis.value
    ? local.chassisNumber.trim().length > 0
    : local.registrationNumber.trim().length > 0,
)

const canContinue = computed(() =>
  Boolean(local.carMake && local.carModel && local.carYear)
  && vrmOrChassisFilled.value
  && local.financing !== null
  && (local.financing === false || Boolean(local.financialInstitution)),
)

const makeError = computed(() => showErrors.value && !local.carMake)
const modelError = computed(() => showErrors.value && !local.carModel)
const yearError = computed(() => showErrors.value && !local.carYear)
const vrmError = computed(() => showErrors.value && !vrmOrChassisFilled.value)
const financingError = computed(() => showErrors.value && local.financing === null)
const fiError = computed(() =>
  showErrors.value && local.financing === true && !local.financialInstitution,
)

// Sprint-review demo: VRM SGY1234A, current insurer Income, no financing.
// Make/Model/Year are already prefilled from Step 3.
const { register } = useDemoAutofill()
register(() => {
  useChassis.value = false
  local.registrationNumber = 'SGY1234A'
  local.chassisNumber = ''
  local.currentInsurer = 'Income'
  local.financing = false
  local.financialInstitution = ''
  sync()
})
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Vehicle to be Insured</h1>

    <div class="field stack" :data-error="makeError ? 'true' : null">
      <label class="field-sublabel">Car make</label>
      <BdiSearchSelect
        v-model="local.carMake"
        @update:model-value="sync"
        :options="groupedMakes"
        grouped
        searchable
        placeholder="Choose car make"
        :invalid="makeError"
      />
      <FieldError :show="makeError" message="Please select your car make." />
    </div>

    <div class="field stack" :data-error="modelError ? 'true' : null">
      <label class="field-sublabel">Car model</label>
      <BdiSearchSelect
        v-model="local.carModel"
        @update:model-value="sync"
        :options="modelOptions"
        searchable
        :disabled="!local.carMake"
        placeholder="Choose car model"
        :invalid="modelError"
      />
      <FieldError :show="modelError" message="Please select your car model." />
    </div>

    <div class="field stack" :data-error="yearError ? 'true' : null">
      <label class="field-sublabel">Car registration year</label>
      <BdiSearchSelect
        v-model="local.carYear"
        @update:model-value="sync"
        :options="yearOptions"
        placeholder="Choose year"
        :invalid="yearError"
      />
      <FieldError :show="yearError" message="Please select your car registration year." />
    </div>

    <!-- Helper banner: cover-type age reminder. Only renders for TPO/TPFT
         (Comprehensive has no age cap). Vertical bar accent picks up the
         BD red brand colour. -->
    <div v-if="helperText" class="helper-banner">
      <span class="helper-bar" aria-hidden="true"></span>
      <p class="helper-text">{{ helperText }}</p>
    </div>

    <!-- VRM XOR Chassis -->
    <div class="field stack" :data-error="vrmError ? 'true' : null">
      <template v-if="!useChassis">
        <BdiFloatInput
          :model-value="local.registrationNumber"
          @update:model-value="onVrmInput"
          label="Vehicle Registration Number"
          :invalid="vrmError"
          maxlength="10"
        />
        <button
          type="button"
          class="alt-link"
          @click="useChassis = true"
        >I don't have Vehicle Registration Number yet</button>
        <FieldError :show="vrmError" message="Enter your VRM (or use the chassis number link below)." />
      </template>
      <template v-else>
        <BdiFloatInput
          :model-value="local.chassisNumber"
          @update:model-value="onChassisInput"
          label="Chassis number"
          :invalid="vrmError"
          maxlength="17"
        />
        <button
          type="button"
          class="alt-link"
          @click="useChassis = false"
        >I want to use Vehicle Registration Number instead</button>
        <FieldError :show="vrmError" message="Enter your chassis number." />
      </template>
    </div>

    <div class="field stack">
      <label class="field-sublabel">Current insurer <span class="optional">(optional)</span></label>
      <BdiSearchSelect
        v-model="local.currentInsurer"
        @update:model-value="sync"
        :options="insurerOptions"
        placeholder="Choose your current insurer"
      />
    </div>

    <div class="field stack" :data-error="financingError ? 'true' : null">
      <p class="field-sublabel">Is your car under any financing?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.financing === true, 'is-error': financingError }"
          @click="pickFinancing(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-on': local.financing === false, 'is-error': financingError }"
          @click="pickFinancing(false)"
        >No</button>
      </div>
      <FieldError :show="financingError" message="Let us know if your car is under financing." />
    </div>

    <!-- Financial institution reveals only when financing = Yes -->
    <div
      v-if="local.financing === true"
      class="field stack"
      :data-error="fiError ? 'true' : null"
    >
      <label class="field-sublabel">Please select your financial institution</label>
      <BdiSearchSelect
        v-model="local.financialInstitution"
        @update:model-value="sync"
        :options="financialInstitutionOptions"
        placeholder="Choose your financial institution"
        :invalid="fiError"
      />
      <FieldError :show="fiError" message="Please select your financial institution." />
    </div>

    <!-- TPO/TPFT + financing alert (task 2dd6edc2). Yellow border warning
         callout, same component pattern as Step 10's Authorised Driver Plan. -->
    <div v-if="showFinancingAlert" class="warning-callout">
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
        <p class="warning-title">Heads-up on financing</p>
        <p class="warning-text">
          Most financiers require Comprehensive cover for financed vehicles. Your selected cover (Third-party or Third-party Fire &amp; Theft) may not satisfy your loan agreement. Consider switching to Comprehensive before continuing.
        </p>
      </div>
    </div>

    <BdiQuoteFooter :disabled="!canContinue" @blocked="reveal" />
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
  font-weight: 600;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.optional {
  font-weight: 400;
  color: var(--bdi-grey-600);
}

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

/* Yes/No two-button pair shared across the journey. */
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

/* Helper banner — coloured vertical bar + body text. */
.helper-banner {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 0 0 0 0;
  background: transparent;
}
.helper-bar {
  flex: 0 0 4px;
  background: var(--bdi-red);
  border-radius: 2px;
}
.helper-text {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  line-height: 1.4;
}

/* "I don't have VRM yet" / "I have my VRM" text link. Sits below the input. */
.alt-link {
  align-self: flex-start;
  background: transparent;
  border: 0;
  padding: 4px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-cyan);
  text-decoration: underline;
  cursor: pointer;
}

/* Same warning-callout pattern as Step 10's Authorised Driver Plan section. */
.warning-callout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #FFF8E5;
  border: 1px solid rgba(242, 169, 0, 0.30);
  border-radius: 8px;
}
.warning-icon { width: 24px; height: 24px; flex-shrink: 0; }
.warning-body {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.warning-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
.warning-text {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
}
</style>
