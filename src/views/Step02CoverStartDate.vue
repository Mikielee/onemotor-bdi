<script setup>
import { computed, watch } from 'vue'
import DatePicker from 'primevue/datepicker'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const startDate = computed({
  get: () => quote.coverStartDate,
  set: (v) => { mutable.coverStartDate = v },
})

const endDate = computed(() => {
  if (!quote.coverStartDate) return null
  const d = new Date(quote.coverStartDate)
  d.setFullYear(d.getFullYear() + 1)
  return d
})

watch(endDate, () => {})

const canContinue = computed(() => Boolean(quote.coverStartDate))
const minDate = new Date()
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">When would you like your cover to start?</h1>

    <div class="field">
      <label class="field-label" for="start-date">Policy start date</label>
      <DatePicker
        id="start-date"
        v-model="startDate"
        date-format="dd/mm/yy"
        placeholder="DD/MM/YYYY"
        show-icon
        :min-date="minDate"
        class="bdi-input"
        fluid
      />
    </div>

    <div class="field">
      <label class="field-label">Policy end date</label>
      <div class="field-readonly">
        {{ endDate ? endDate.toLocaleDateString('en-GB') : 'DD/MM/YYYY' }}
      </div>
      <p class="field-hint">Your cover runs for 12 months from the start date.</p>
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

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.4;
}

.field-readonly {
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-grey-600);
}

.field-hint {
  margin: 0;
  font-size: 12px;
  color: var(--bdi-grey-600);
}

.step :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--bdi-carbon);
  font-weight: 700;
}
.step :deep(.bdi-input .p-datepicker-trigger) {
  border-radius: 0 var(--bdi-radius-card) var(--bdi-radius-card) 0;
  background: transparent;
  border: 0;
  color: var(--bdi-carbon);
}
</style>
