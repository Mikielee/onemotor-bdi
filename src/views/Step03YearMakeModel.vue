<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { showErrors, reveal } = useValidation()

const { quote, mutable } = useQuote()

const years = Array.from({ length: 24 }, (_, i) => ({ label: `${2026 - i}`, value: 2026 - i }))

const makes = [
  'Toyota', 'Honda', 'Mazda', 'Mitsubishi', 'Nissan', 'Hyundai', 'Kia',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Tesla', 'Lexus',
].map((m) => ({ label: m, value: m }))

const modelsByMake = {
  Toyota: ['Corolla Altis', 'Camry', 'RAV4', 'Vios', 'Yaris Cross'],
  Honda: ['Civic', 'Vezel', 'HR-V', 'Jazz', 'Freed'],
  Mazda: ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-30'],
  Mitsubishi: ['Attrage', 'ASX', 'Outlander'],
  Nissan: ['Note', 'Qashqai', 'Serena'],
  Hyundai: ['Avante', 'Kona', 'Tucson'],
  Kia: ['Cerato', 'Niro', 'Sorento'],
  BMW: ['3 Series', '5 Series', 'X1', 'X3'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA'],
  Audi: ['A3', 'A4', 'Q3'],
  Volkswagen: ['Golf', 'Polo', 'Tiguan'],
  Volvo: ['XC40', 'XC60', 'S60'],
  Tesla: ['Model 3', 'Model Y'],
  Lexus: ['IS', 'NX', 'RX'],
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

// Only flag the next actionable missing field (the others are still disabled).
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
        :options="years"
        option-label="label"
        option-value="value"
        placeholder="Year"
        class="bdi-select"
        :class="{ 'is-error': yearError }"
        fluid
      />
      <FieldError :show="yearError" message="Select your car's year." />
    </div>

    <div class="field" :data-error="makeError ? 'true' : null">
      <Select
        v-model="makeModel"
        :options="makes"
        option-label="label"
        option-value="value"
        :disabled="!quote.carYear"
        placeholder="Car brand"
        class="bdi-select"
        :class="{ 'is-error': makeError }"
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

.field { width: 100%; }

/* Select styling comes from global style.css — no per-step overrides needed.
   The global rule already paints filled text Carbon and placeholder Grey-600. */
.step :deep(.bdi-select) { width: 100%; }
</style>
