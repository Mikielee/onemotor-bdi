<script setup>
/**
 * BD text input with the floating "label on border" interaction.
 *
 * Empty + unfocused: the label sits inside the field like a placeholder.
 * Focused or filled: the label shrinks onto the top border (white notch),
 * so the field name never disappears once the customer has typed. This is
 * the BD Figma field pattern and matches the DA prototype's behavior.
 *
 * PrimeVue FloatLabel variant="on" provides the mechanics; global styling
 * for the label lives in style.css (.p-floatlabel-on).
 */
import { useId } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  invalid: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: null },
  inputmode: { type: String, default: null },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: null },
  inputClass: { type: [String, Object, Array], default: null },
})
const emit = defineEmits(['update:modelValue'])

const uid = useId()
</script>

<template>
  <FloatLabel variant="on" class="bdi-float">
    <InputText
      :id="uid"
      :model-value="modelValue"
      @update:model-value="(v) => emit('update:modelValue', v)"
      class="bdi-input"
      :class="[{ 'is-error': invalid }, inputClass]"
      :maxlength="maxlength"
      :inputmode="inputmode"
      :type="type"
      :autocomplete="autocomplete"
      fluid
    />
    <label :for="uid">{{ label }}</label>
  </FloatLabel>
</template>

<style scoped>
.bdi-float { width: 100%; }
</style>
