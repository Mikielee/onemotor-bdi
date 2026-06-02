<script setup>
defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
})
</script>

<template>
  <p v-if="show && message" class="bdi-field-error" role="alert">{{ message }}</p>
</template>
