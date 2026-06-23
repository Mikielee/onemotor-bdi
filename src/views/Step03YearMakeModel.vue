<script setup>
import { computed, watch } from 'vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { showErrors, reveal } = useValidation()
const { quote, mutable } = useQuote()

const CURRENT_YEAR = 2026
const MAX_AGE_RESTRICTIVE = 15  // Third-party covers cap car age at 15 years

// Cover type determines year availability:
//  - third-party / third-party-fire-theft → only cars ≤ 15 years old
//  - comprehensive → no age cap
const restrictiveCover = computed(() =>
  quote.coverType === 'third-party' || quote.coverType === 'third-party-fire-theft'
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

// If user picks third-party after already choosing an older year, blank it out.
watch(restrictiveCover, (isRestrictive) => {
  if (!isRestrictive) return
  if (quote.carYear && quote.carYear < CURRENT_YEAR - MAX_AGE_RESTRICTIVE) {
    mutable.carYear = null
    mutable.carMake = null
    mutable.carModel = null
  }
}, { immediate: true })

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
  Toyota: ['Corolla Altis', 'Camry 2.0', 'Camry 2.4', 'Camry 2.5', 'RAV4', 'Vios', 'Yaris Cross', 'Prius', 'Sienta', 'Wish'],
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

const yearModel = computed({
  get: () => quote.carYear,
  set: (v) => { mutable.carYear = v },
})

const makeModel = computed({
  get: () => quote.carMake,
  set: (v) => {
    mutable.carMake = v
    mutable.carModel = null
  },
})

const carModelV = computed({
  get: () => quote.carModel,
  set: (v) => { mutable.carModel = v },
})

const availableModels = computed(() => {
  if (!quote.carMake) return []
  return (modelsByMake[quote.carMake] || []).map((m) => ({ label: m, value: m }))
})

const canContinue = computed(() => Boolean(quote.carYear && quote.carMake && quote.carModel))

const yearError = computed(() => showErrors.value && !quote.carYear)
const makeError = computed(() => showErrors.value && quote.carYear && !quote.carMake)
const modelError = computed(() => showErrors.value && quote.carMake && !quote.carModel)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Tell us about your car</h1>

    <div class="field" :data-error="yearError ? 'true' : null">
      <Select
        v-model="yearModel"
        :options="yearOptions"
        option-label="label"
        option-value="value"
        placeholder="Year"
        class="bdi-select"
        :class="{ 'is-error': yearError }"
        fluid
      />
      <p v-if="restrictiveCover" class="field-hint">
        Third-party covers are available for cars up to {{ MAX_AGE_RESTRICTIVE }} years old.
      </p>
      <FieldError :show="yearError" message="Select your car's year." />
    </div>

    <div class="field" :data-error="makeError ? 'true' : null">
      <Select
        v-model="makeModel"
        :options="groupedMakes"
        option-group-label="label"
        option-group-children="items"
        option-label="label"
        option-value="value"
        :disabled="!quote.carYear"
        placeholder="Car brand"
        class="bdi-select"
        :class="{ 'is-error': makeError }"
        :filter="true"
        filter-placeholder="Search"
        fluid
      />
      <FieldError :show="makeError" message="Select your car's brand." />
    </div>

    <div class="field" :data-error="modelError ? 'true' : null">
      <Select
        v-model="carModelV"
        :options="availableModels"
        option-label="label"
        option-value="value"
        :disabled="!quote.carMake"
        placeholder="Car model"
        class="bdi-select"
        :class="{ 'is-error': modelError }"
        :filter="true"
        filter-placeholder="Search"
        fluid
      />
      <FieldError :show="modelError" message="Select your car's model." />
    </div>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field { width: 100%; display: flex; flex-direction: column; }

.field-hint {
  margin: 6px 0 0 4px;
  font-size: 12px;
  color: var(--bdi-grey-600);
  line-height: 1.4;
}

.step :deep(.bdi-select) { width: 100%; }
</style>
