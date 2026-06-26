<script setup>
/**
 * Step 12 — Policyholder Additional Details (OMP-651).
 * Figma BD/DA mobile reference: 4962-3081 canvas → 5281:1683 mobile mock.
 *
 * One screen, three sections:
 *   1. Your Details (full name, NRIC, DOB, gender, email, mobile, NCD)
 *   2. Your Address (postal code → autofill block + street; manual unit + bldg)
 *   3. Keep me updated for any special deals (marketing prefs)
 *
 * Prefill rules:
 *   - DOB + Gender pulled from Step 6 main driver if isPolicyholder === true
 *   - Email + Mobile pulled from Step 8 contact
 *   - NCD pulled from Step 7 driving history
 *   - Marketing channels pulled from Step 8 contact (decision pending —
 *     KB 98cd9339 hasn't landed, so we keep both Step 8 + Step 12 for now)
 *   - Full name + NRIC are still manual capture — never collected pre-Step 12
 *
 * Car details (registration, insurer, last claim, ownership) moved out of
 * Step 12 per Figma — they belong on Step 13 now (OMP-85).
 */
import { computed, reactive, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import BdiDateField from '../components/BdiDateField.vue'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'
import { validateNric, lookupPostal } from '../utils/nric'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Prefill helpers — when main driver = policyholder (chosen at Step 6
// and confirmed at Step 10.1), the policyholder's name/NRIC/DOB/gender
// are already collected upstream. We pull them in here so the customer
// just confirms instead of retyping. Email + mobile come from Step 8;
// NCD from Step 7. Full name + NRIC come from Step 10.1.
const mainDriverIsPolicyholder = computed(
  () => quote.mainDriver?.isPolicyholder === true,
)
const prefilledFullName = computed(() =>
  mainDriverIsPolicyholder.value ? quote.mainDriver?.name ?? '' : '',
)
const prefilledNric = computed(() =>
  mainDriverIsPolicyholder.value ? quote.mainDriver?.nric ?? '' : '',
)
const prefilledDob = computed(() =>
  mainDriverIsPolicyholder.value ? quote.mainDriver?.dob ?? null : null,
)
const prefilledGender = computed(() =>
  mainDriverIsPolicyholder.value ? quote.mainDriver?.gender ?? '' : '',
)

const local = reactive({
  // Your Details
  fullName: quote.policyholder?.fullName || prefilledFullName.value,
  nric: quote.policyholder?.nric || prefilledNric.value,
  dob: quote.policyholder?.dob || prefilledDob.value,
  gender: quote.policyholder?.gender || prefilledGender.value,
  email: quote.policyholder?.email || quote.contact?.email || '',
  phone: quote.policyholder?.phone || quote.contact?.phone || '',
  ncd: quote.policyholder?.ncd ?? quote.drivingHistory?.ncd ?? null,
  // Your Address — postal code triggers block + street auto-fill
  postalCode: quote.policyholder?.address?.postalCode || quote.contact?.postalCode || '',
  block: quote.policyholder?.address?.block || '',
  street: quote.policyholder?.address?.street || '',
  unit: quote.policyholder?.address?.unit || '',
  buildingName: quote.policyholder?.address?.buildingName || '',
  // Marketing — prefilled from Step 8 if user already picked there
  marketingChannels: [
    ...(quote.policyholder?.marketingChannels
      || quote.contact?.marketingChannels
      || []),
  ],
})

const ncdOptions = [
  { label: '0%', value: 0 },
  { label: '10%', value: 10 },
  { label: '20%', value: 20 },
  { label: '30%', value: 30 },
  { label: '40%', value: 40 },
  { label: '50%', value: 50 },
]

const channels = ['Email', 'SMS', 'Whatsapp']

// Postal code → auto-fill block + street + building name (where known).
// Unit number is always manual.
watch(
  () => local.postalCode,
  (code) => {
    if (!code || code.length !== 6) return
    const hit = lookupPostal(code)
    if (hit) {
      local.block = hit.block
      local.street = hit.street
      if (hit.buildingName) local.buildingName = hit.buildingName
    }
    sync()
  },
)

function sync() {
  mutable.policyholder = {
    ...quote.policyholder,
    fullName: local.fullName.trim(),
    nric: local.nric.trim().toUpperCase(),
    dob: local.dob,
    gender: local.gender,
    email: local.email.trim(),
    phone: local.phone.trim(),
    ncd: local.ncd,
    address: {
      postalCode: local.postalCode,
      block: local.block,
      street: local.street,
      unit: local.unit.trim(),
      buildingName: local.buildingName.trim(),
    },
    marketingChannels: [...local.marketingChannels],
  }
}

function onNricInput(v) { local.nric = (v || '').toUpperCase(); sync() }
function onPostalInput(v) { local.postalCode = (v || '').replace(/\D/g, '').slice(0, 6); sync() }
function pickGender(v) { local.gender = v; sync() }
function onDobChange(v) { local.dob = v; sync() }
function onNcdChange(v) { local.ncd = v; sync() }
function onChannelToggle(name) {
  const idx = local.marketingChannels.indexOf(name)
  if (idx === -1) local.marketingChannels.push(name)
  else local.marketingChannels.splice(idx, 1)
  sync()
}

const maxDob = new Date()

const nricValid = computed(() => validateNric(local.nric))
const emailValid = computed(() => /^\S+@\S+\.\S+$/.test(local.email))
const phoneValid = computed(() => /^[89]\d{7}$/.test(local.phone.replace(/\s/g, '')))
const postalValid = computed(() => /^\d{6}$/.test(local.postalCode))

const canContinue = computed(() =>
  local.fullName.trim().length > 0
  && nricValid.value
  && Boolean(local.dob)
  && Boolean(local.gender)
  && emailValid.value
  && phoneValid.value
  && local.ncd !== null
  && postalValid.value
  && local.unit.trim().length > 0,
)

const nameError = computed(() => showErrors.value && local.fullName.trim().length === 0)
const nricError = computed(() => showErrors.value && !nricValid.value)
const dobError = computed(() => showErrors.value && !local.dob)
const genderError = computed(() => showErrors.value && !local.gender)
const emailError = computed(() => showErrors.value && !emailValid.value)
const phoneError = computed(() => showErrors.value && !phoneValid.value)
const ncdError = computed(() => showErrors.value && local.ncd === null)
const postalError = computed(() => showErrors.value && !postalValid.value)
const unitError = computed(() => showErrors.value && local.unit.trim().length === 0)

// Sprint-review demo: sets postal 078878 (the watch then autofills
// block + street + building name 'Icon Residence' via the postal stub)
// and unit 41-21. Everything else on this page is prefilled from
// Step 6/7/8/10.1 by the existing chain.
const { register } = useDemoAutofill()
register(() => {
  local.postalCode = '078878'
  local.unit = '41-21'
  sync()
})
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">
      Just a few details about
      <span class="ph-emphasis">Policyholder</span>
      to get you covered
    </h1>

    <!-- Your Details -->
    <div class="block">
      <h2 class="block-title">Your Details</h2>

      <div class="field" :data-error="nameError ? 'true' : null">
        <InputText
          v-model="local.fullName"
          @update:model-value="sync"
          placeholder="Full name (as per NRIC)"
          class="bdi-input"
          :class="{ 'is-error': nameError }"
          fluid
        />
        <FieldError :show="nameError" message="Enter your full name as per NRIC." />
      </div>

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

      <div class="field stack" :data-error="dobError ? 'true' : null">
        <label class="field-sublabel" for="ph-dob">Date of birth</label>
        <BdiDateField
          id="ph-dob"
          :model-value="local.dob"
          @update:model-value="onDobChange"
          :max-date="maxDob"
          :invalid="dobError"
        />
        <FieldError :show="dobError" message="Please select your date of birth." />
      </div>

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
        <FieldError :show="genderError" message="Please select your gender." />
      </div>

      <div class="field" :data-error="emailError ? 'true' : null">
        <InputText
          v-model="local.email"
          @update:model-value="sync"
          placeholder="Email"
          class="bdi-input"
          :class="{ 'is-error': emailError }"
          type="email"
          fluid
        />
        <FieldError :show="emailError" message="Enter a valid email address." />
      </div>

      <div class="field" :data-error="phoneError ? 'true' : null">
        <div class="phone-row">
          <div class="country-code">+65</div>
          <InputText
            v-model="local.phone"
            @update:model-value="sync"
            placeholder="Mobile"
            class="bdi-input phone-input"
            :class="{ 'is-error': phoneError }"
            inputmode="numeric"
            maxlength="8"
            fluid
          />
        </div>
        <FieldError :show="phoneError" message="Enter a valid SG mobile (8 digits, starts with 8 or 9)." />
      </div>

      <div class="field stack" :data-error="ncdError ? 'true' : null">
        <label class="field-sublabel">No Claim Discount (NCD) at renewal</label>
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
    </div>

    <!-- Your Address -->
    <div class="block">
      <h2 class="block-title">Your Address</h2>

      <div class="field" :data-error="postalError ? 'true' : null">
        <InputText
          :model-value="local.postalCode"
          @update:model-value="onPostalInput"
          placeholder="Postal code"
          class="bdi-input"
          :class="{ 'is-error': postalError }"
          inputmode="numeric"
          maxlength="6"
          fluid
        />
        <p class="autofill-hint">
          <i class="pi pi-pencil" aria-hidden="true"></i>
          Autofill address from postal code
        </p>
        <FieldError :show="postalError" message="Enter a valid 6-digit Singapore postal code." />
      </div>

      <div v-if="postalValid" class="address-grid">
        <div class="field">
          <InputText
            v-model="local.block"
            @update:model-value="sync"
            placeholder="Block"
            class="bdi-input"
            fluid
          />
        </div>
        <div class="field">
          <InputText
            v-model="local.street"
            @update:model-value="sync"
            placeholder="Street"
            class="bdi-input"
            fluid
          />
        </div>
        <div class="field" :data-error="unitError ? 'true' : null">
          <InputText
            v-model="local.unit"
            @update:model-value="sync"
            placeholder="Unit number"
            class="bdi-input"
            :class="{ 'is-error': unitError }"
            fluid
          />
          <FieldError :show="unitError" message="Please enter your unit number." />
        </div>
        <div class="field">
          <InputText
            v-model="local.buildingName"
            @update:model-value="sync"
            placeholder="Building name (optional)"
            class="bdi-input"
            fluid
          />
        </div>
      </div>
    </div>

    <!-- Marketing channels — relocated from Step 8 per KB decision -->
    <div class="block">
      <h2 class="block-title">Keep me updated for any special deals.</h2>
      <div class="channels-cards">
        <button
          v-for="ch in channels"
          :key="ch"
          type="button"
          class="channel-card"
          :class="{ 'is-on': local.marketingChannels.includes(ch) }"
          @click="onChannelToggle(ch)"
        >
          <span class="channel-box" :class="{ 'is-on': local.marketingChannels.includes(ch) }">
            <span v-if="local.marketingChannels.includes(ch)" class="channel-tick">&check;</span>
          </span>
          <span class="channel-label">{{ ch }}</span>
        </button>
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
  gap: 24px;
}

.ph-emphasis {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.block-title {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
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

.phone-row {
  display: flex;
  align-items: stretch;
}
.country-code {
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-300);
  border-right: 0;
  border-radius: var(--bdi-radius-card) 0 0 var(--bdi-radius-card);
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #5c5c5c;
  display: flex;
  align-items: center;
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
.phone-row :deep(.phone-input.p-inputtext) {
  border-radius: 0 var(--bdi-radius-card) var(--bdi-radius-card) 0;
}
.step :deep(.bdi-select) { width: 100%; }
.step :deep(.bdi-select.is-error) {
  outline: 1px solid var(--bdi-red);
  outline-offset: -1px;
  border-radius: var(--bdi-radius-card);
}

.autofill-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
}
.autofill-hint .pi { font-size: 14px; }

.address-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Marketing channel cards — same component pattern as Step 8 but lives
   here per Figma. Keep both in sync if KB 98cd9339 lands either way. */
.channels-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  font-family: var(--bdi-font);
}
.channel-card.is-on { border-color: var(--bdi-green); }
.channel-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.channel-box {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--bdi-carbon);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.channel-box.is-on { background: var(--bdi-green); border-color: var(--bdi-green); }
.channel-tick {
  color: #fff;
  font-size: 10px;
  line-height: 1;
}
</style>
