<script setup>
import { computed } from 'vue'
import BdiDateField from '../components/BdiDateField.vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Sprint-review demo: header 'Car Insurance' chip seeds a start date
// 7 days out and a 12-month cover term.
const { register } = useDemoAutofill()
register(() => {
  const start = new Date()
  start.setDate(start.getDate() + 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 1)
  mutable.coverStartDate = start
  mutable.coverEndDate = end
})

const startDate = computed({
  get: () => quote.coverStartDate,
  set: (v) => {
    mutable.coverStartDate = v
    if (!quote.coverEndDate && v) {
      const defaultEnd = new Date(v)
      defaultEnd.setFullYear(defaultEnd.getFullYear() + 1)
      mutable.coverEndDate = defaultEnd
    } else if (quote.coverEndDate && v) {
      const min = endMin.value
      const max = endMax.value
      const current = new Date(quote.coverEndDate)
      if (current < min) mutable.coverEndDate = min
      else if (current > max) mutable.coverEndDate = max
    }
  },
})

const endDate = computed({
  get: () => quote.coverEndDate,
  set: (v) => { mutable.coverEndDate = v },
})

// Cover end-date rules: minimum 7 months from start, maximum 18 months (1.5 years).
const endMin = computed(() => {
  if (!quote.coverStartDate) return null
  const d = new Date(quote.coverStartDate)
  d.setMonth(d.getMonth() + 7)
  return d
})
const endMax = computed(() => {
  if (!quote.coverStartDate) return null
  const d = new Date(quote.coverStartDate)
  d.setMonth(d.getMonth() + 18)
  return d
})

const canContinue = computed(() => Boolean(quote.coverStartDate && quote.coverEndDate))
const startError = computed(() => showErrors.value && !quote.coverStartDate)
// End date only becomes actionable once a start date is set (it auto-populates
// then), so don't flag the disabled field.
const endError = computed(() => showErrors.value && quote.coverStartDate && !quote.coverEndDate)

const minStart = new Date()
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">When would you like your cover to start?</h1>

    <div class="field" :data-error="startError ? 'true' : null">
      <label class="bdi-field-label" for="start-date">Policy start date</label>
      <BdiDateField
        id="start-date"
        v-model="startDate"
        :invalid="startError"
        :min-date="minStart"
      />
      <FieldError :show="startError" message="Select a policy start date." />
    </div>

    <div class="field" :data-error="endError ? 'true' : null">
      <label class="bdi-field-label" for="end-date">Policy end date</label>
      <BdiDateField
        id="end-date"
        v-model="endDate"
        :invalid="endError"
        :min-date="endMin"
        :max-date="endMax"
        :disabled="!quote.coverStartDate"
      />
      <p class="field-hint" v-if="quote.coverStartDate">
        Cover runs for 7 to 18 months. Default is 12 months from the start date.
      </p>
      <p class="field-hint" v-else>
        Choose a start date first to set the policy length.
      </p>
      <FieldError :show="endError" message="Select a policy end date." />
    </div>

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

.field { display: flex; flex-direction: column; }

.field-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: var(--bdi-grey-600);
  line-height: 1.4;
}
</style>
