<script setup>
/**
 * BDI date field — matches Figma 4691-831.
 *  - Calendar icon sits inside the input (no boxed button).
 *  - Typing digits auto-inserts slashes in real time: 21061989 -> 21/06/1989,
 *    216 -> 21/06.
 *  - Clicking the field or the icon opens an inline calendar in a popup that
 *    has a green border. Picking a date fills the field and closes the popup.
 *  - Filled / focused border is green; error border is red (global .is-error).
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
  modelValue: { type: [Date, Object, null], default: null },
  minDate: { type: Date, default: undefined },
  maxDate: { type: Date, default: undefined },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  placeholder: { type: String, default: 'DD/MM/YYYY' },
  id: { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const focused = ref(false)
const root = ref(null)

function pad(n) { return String(n).padStart(2, '0') }
function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// The visible, masked string.
const text = ref(fmt(props.modelValue))
watch(() => props.modelValue, (v) => { text.value = fmt(v) })

const calValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const filled = computed(() => Boolean(props.modelValue))

function maskDigits(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function withinRange(d) {
  if (props.minDate && d < stripTime(props.minDate)) return false
  if (props.maxDate && d > props.maxDate) return false
  return true
}
function stripTime(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function onInput(e) {
  const masked = maskDigits(e.target.value)
  text.value = masked
  // Keep the DOM value in sync (Vue may not if the masked string equals the
  // model-derived value but the raw typed value differed).
  e.target.value = masked

  if (masked.length === 10) {
    const [dd, mm, yyyy] = masked.split('/').map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    const valid =
      d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
    if (valid && withinRange(d)) {
      emit('update:modelValue', d)
      return
    }
  }
  // Incomplete or invalid -> no committed date yet.
  if (props.modelValue) emit('update:modelValue', null)
}

function onCalSelect(v) {
  emit('update:modelValue', v)
  open.value = false
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function onFocus() {
  focused.value = true
  if (!props.disabled) open.value = true
}
function onBlur() { focused.value = false }

function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div
    ref="root"
    class="bdi-datefield"
    :class="{ 'is-filled': filled, 'is-focused': focused || open, 'is-error': invalid, 'is-disabled': disabled }"
  >
    <input
      :id="id"
      class="bdi-datefield-input"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :value="text"
      :disabled="disabled"
      maxlength="10"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <button
      type="button"
      class="bdi-datefield-icon"
      aria-label="Open calendar"
      tabindex="-1"
      :disabled="disabled"
      @click="toggle"
    >
      <i class="pi pi-calendar" aria-hidden="true"></i>
    </button>

    <div v-if="open" class="bdi-datefield-pop">
      <DatePicker
        v-model="calValue"
        inline
        :min-date="minDate"
        :max-date="maxDate"
        @update:model-value="onCalSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.bdi-datefield {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  min-height: var(--bdi-field-height);
  transition: border-color 120ms ease;
}
/* Filled or focused = green border (Figma 4691-831). */
.bdi-datefield.is-filled,
.bdi-datefield.is-focused { border-color: var(--bdi-green); }
.bdi-datefield.is-error { border-color: var(--bdi-red); }
.bdi-datefield.is-disabled { background: var(--bdi-grey-100); }

.bdi-datefield-input {
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-carbon);
  padding: 0 8px 0 16px;
  min-height: calc(var(--bdi-field-height) - 2px);
  border-radius: var(--bdi-radius-card);
}
.bdi-datefield-input::placeholder { color: var(--bdi-grey-600); font-weight: 600; }

/* Icon sits inside the field, no box. */
.bdi-datefield-icon {
  flex: 0 0 auto;
  background: transparent;
  border: 0;
  padding: 0 16px 0 8px;
  color: var(--bdi-carbon);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.bdi-datefield-icon:disabled { cursor: not-allowed; color: var(--bdi-grey-500); }
.bdi-datefield-icon .pi { font-size: 18px; }

/* Calendar popup — green border per the mock-up. */
.bdi-datefield-pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid var(--bdi-green);
  border-radius: var(--bdi-radius-card);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
}
.bdi-datefield-pop :deep(.p-datepicker-panel),
.bdi-datefield-pop :deep(.p-datepicker) {
  border: 0;
  box-shadow: none;
}
</style>
