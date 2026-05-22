<script setup>
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

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

const minStart = new Date()
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">When would you like your cover to start?</h1>

    <div class="field">
      <label class="bdi-field-label" for="start-date">Policy start date</label>
      <DatePicker
        id="start-date"
        v-model="startDate"
        date-format="dd/mm/yy"
        placeholder="DD/MM/YYYY"
        show-icon
        :min-date="minStart"
        fluid
      />
    </div>

    <div class="field">
      <label class="bdi-field-label" for="end-date">Policy end date</label>
      <DatePicker
        id="end-date"
        v-model="endDate"
        date-format="dd/mm/yy"
        placeholder="DD/MM/YYYY"
        show-icon
        :min-date="endMin"
        :max-date="endMax"
        :disabled="!quote.coverStartDate"
        fluid
      />
      <p class="field-hint" v-if="quote.coverStartDate">
        Cover runs for 7 to 18 months. Default is 12 months from the start date.
      </p>
      <p class="field-hint" v-else>
        Choose a start date first to set the policy length.
      </p>
    </div>

    <StickyNext :disabled="!canContinue" />
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
