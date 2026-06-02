<script setup>
import { computed, reactive } from 'vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { showErrors, reveal } = useValidation()

const { quote, mutable } = useQuote()

const yearsOptions = Array.from({ length: 41 }, (_, i) => ({
  label: i === 0 ? 'Less than 1 year' : `${i} year${i === 1 ? '' : 's'}`,
  value: i,
}))

const ncdOptions = [
  { label: '0%', value: 0 },
  { label: '10%', value: 10 },
  { label: '20%', value: 20 },
  { label: '30%', value: 30 },
  { label: '40%', value: 40 },
  { label: '50%', value: 50 },
]

const atFaultOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3+', value: 3 },
]

const notAtFaultOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
]

// NCD follow-up options (Figma 4708-3143).
const ncdZeroReasonOptions = [
  { label: 'New driver', value: 'new-driver' },
  { label: 'No previous insurance', value: 'no-previous-insurance' },
  { label: 'Claims in past year', value: 'claims-past-year' },
  { label: 'I have NCD on another car', value: 'ncd-other-car' },
]
const otherCarNcdOptions = ncdOptions
const transferredFromOptions = [
  { label: 'Current insurer', value: 'current' },
  { label: 'Previous insurer', value: 'previous' },
]
const fiftyYearsOptions = [
  { label: '1 year', value: 1 },
  { label: '2 years', value: 2 },
  { label: '3 years or more', value: 3 },
]

const local = reactive({
  yearsLicensed: quote.drivingHistory?.yearsLicensed ?? null,
  atFault: quote.drivingHistory?.atFaultClaims ?? null,
  notAtFault: quote.drivingHistory?.notAtFaultClaims ?? null,
  certOfMerit: quote.drivingHistory?.certificateOfMerit ?? null,
  ncd: quote.drivingHistory?.ncd ?? null,
  ncdZeroReason: quote.drivingHistory?.ncdZeroReason ?? null,
  otherCarNcd: quote.drivingHistory?.otherCarNcd ?? null,
  transferredFrom: quote.drivingHistory?.transferredFrom ?? null,
  fiftyYears: quote.drivingHistory?.fiftyYears ?? null,
})

function sync() {
  mutable.drivingHistory = {
    ...quote.drivingHistory,
    yearsLicensed: local.yearsLicensed,
    atFaultClaims: local.atFault,
    notAtFaultClaims: local.notAtFault,
    certificateOfMerit: local.certOfMerit,
    ncd: local.ncd,
    ncdZeroReason: local.ncdZeroReason,
    otherCarNcd: local.otherCarNcd,
    transferredFrom: local.transferredFrom,
    fiftyYears: local.fiftyYears,
  }
}

function setAtFault(v) { local.atFault = v; sync() }
function setNotAtFault(v) { local.notAtFault = v; sync() }
function setCertOfMerit(v) { local.certOfMerit = v; sync() }
function onYearsChange(v) { local.yearsLicensed = v; sync() }
function onNcdChange(v) {
  local.ncd = v
  // Reset follow-ups that no longer apply.
  if (v !== 0) { local.ncdZeroReason = null; local.otherCarNcd = null; local.transferredFrom = null }
  if (v !== 50) { local.fiftyYears = null }
  sync()
}
function onZeroReasonChange(v) {
  local.ncdZeroReason = v
  if (v !== 'ncd-other-car') { local.otherCarNcd = null; local.transferredFrom = null }
  sync()
}
function onOtherCarNcdChange(v) { local.otherCarNcd = v; sync() }
function onTransferredChange(v) { local.transferredFrom = v; sync() }
function onFiftyYearsChange(v) { local.fiftyYears = v; sync() }

// Conditional follow-up visibility.
const showZeroFollowup = computed(() => local.ncd === 0)
const showOtherCar = computed(() => local.ncd === 0 && local.ncdZeroReason === 'ncd-other-car')
const showFiftyFollowup = computed(() => local.ncd === 50)

const canContinue = computed(() => {
  if (
    local.yearsLicensed === null
    || local.atFault === null
    || local.notAtFault === null
    || local.certOfMerit === null
    || local.ncd === null
  ) return false
  if (local.ncd === 0) {
    if (local.ncdZeroReason === null) return false
    if (local.ncdZeroReason === 'ncd-other-car'
      && (local.otherCarNcd === null || local.transferredFrom === null)) return false
  }
  if (local.ncd === 50 && local.fiftyYears === null) return false
  return true
})

const yearsError = computed(() => showErrors.value && local.yearsLicensed === null)
const atFaultError = computed(() => showErrors.value && local.atFault === null)
const notAtFaultError = computed(() => showErrors.value && local.notAtFault === null)
const certError = computed(() => showErrors.value && local.certOfMerit === null)
const ncdError = computed(() => showErrors.value && local.ncd === null)
const zeroReasonError = computed(() => showErrors.value && showZeroFollowup.value && local.ncdZeroReason === null)
const otherCarError = computed(() => showErrors.value && showOtherCar.value && local.otherCarNcd === null)
const transferredError = computed(() => showErrors.value && showOtherCar.value && local.transferredFrom === null)
const fiftyYearsError = computed(() => showErrors.value && showFiftyFollowup.value && local.fiftyYears === null)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Your driving history</h1>

    <div class="field" :data-error="yearsError ? 'true' : null">
      <label class="field-label">Years of valid driving licence</label>
      <Select
        :model-value="local.yearsLicensed"
        @update:model-value="onYearsChange"
        :options="yearsOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': yearsError }"
        fluid
      />
      <FieldError :show="yearsError" message="Please select years of driving experience." />
    </div>

    <p class="prefix">
      In the 3 years prior to the start of the policy, all drivers to be insured had the following:
    </p>

    <div class="field" :data-error="atFaultError ? 'true' : null">
      <p class="field-label">
        Total number of <strong>at-fault</strong> accidents and/or claims
      </p>
      <div class="chip-row">
        <button
          v-for="o in atFaultOptions"
          :key="o.value"
          type="button"
          class="chip"
          :class="{ 'is-selected': local.atFault === o.value, 'is-error': atFaultError }"
          @click="setAtFault(o.value)"
        >{{ o.label }}</button>
      </div>
      <FieldError :show="atFaultError" message="Please select number of at-fault accidents or claims." />
    </div>

    <div class="field" :data-error="notAtFaultError ? 'true' : null">
      <p class="field-label">
        Total number of <strong>not-at-fault</strong> accidents and/or claims
      </p>
      <div class="chip-row">
        <button
          v-for="o in notAtFaultOptions"
          :key="o.value"
          type="button"
          class="chip"
          :class="{ 'is-selected': local.notAtFault === o.value, 'is-error': notAtFaultError }"
          @click="setNotAtFault(o.value)"
        >{{ o.label }}</button>
      </div>
      <FieldError :show="notAtFaultError" message="Please select number of not-at-fault accidents or claims." />
    </div>

    <div class="field" :data-error="certError ? 'true' : null">
      <p class="field-label">Entitled to Certificate of Merit?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.certOfMerit === true, 'is-error': certError }"
          @click="setCertOfMerit(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.certOfMerit === false, 'is-error': certError }"
          @click="setCertOfMerit(false)"
        >No</button>
      </div>
      <FieldError :show="certError" message="Please select if you are entitled to a Certificate of Merit." />
    </div>

    <div class="field" :data-error="ncdError ? 'true' : null">
      <label class="field-label">No Claim Discount (NCD) at renewal</label>
      <Select
        :model-value="local.ncd"
        @update:model-value="onNcdChange"
        :options="ncdOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': ncdError }"
        fluid
      />
      <FieldError :show="ncdError" message="Please select your NCD at renewal." />
    </div>

    <!-- NCD = 0% follow-up -->
    <div v-if="showZeroFollowup" class="field" :data-error="zeroReasonError ? 'true' : null">
      <label class="field-label">NCD is 0% because</label>
      <Select
        :model-value="local.ncdZeroReason"
        @update:model-value="onZeroReasonChange"
        :options="ncdZeroReasonOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': zeroReasonError }"
        fluid
      />
      <FieldError :show="zeroReasonError" message="Please tell us why your NCD is 0%." />
    </div>

    <!-- NCD = 0% and NCD held on another car -->
    <div v-if="showOtherCar" class="field" :data-error="otherCarError ? 'true' : null">
      <label class="field-label">What is your NCD on the other car?</label>
      <Select
        :model-value="local.otherCarNcd"
        @update:model-value="onOtherCarNcdChange"
        :options="otherCarNcdOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': otherCarError }"
        fluid
      />
      <FieldError :show="otherCarError" message="Please select your NCD on the other car." />
    </div>

    <div v-if="showOtherCar" class="field" :data-error="transferredError ? 'true' : null">
      <label class="field-label">NCD transferred from</label>
      <Select
        :model-value="local.transferredFrom"
        @update:model-value="onTransferredChange"
        :options="transferredFromOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': transferredError }"
        fluid
      />
      <FieldError :show="transferredError" message="Please select where your NCD is transferred from." />
    </div>

    <!-- NCD = 50% follow-up -->
    <div v-if="showFiftyFollowup" class="field" :data-error="fiftyYearsError ? 'true' : null">
      <label class="field-label">How many years has the vehicle held the 50% No Claims Discount?</label>
      <Select
        :model-value="local.fiftyYears"
        @update:model-value="onFiftyYearsChange"
        :options="fiftyYearsOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="bdi-select"
        :class="{ 'is-error': fiftyYearsError }"
        fluid
      />
      <FieldError :show="fiftyYearsError" message="Please select how long the 50% NCD has been held." />
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
.field-label strong { font-weight: 900; }

.prefix {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}

.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  flex: 1 1 0;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  min-height: 56px;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  text-align: center;
  cursor: pointer;
  font-family: var(--bdi-font);
}
.chip.is-selected {
  border-color: var(--bdi-green);}
.chip.is-error { border-color: var(--bdi-red); }

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

/* Field styling comes from global style.css — no Select overrides needed. */
</style>
