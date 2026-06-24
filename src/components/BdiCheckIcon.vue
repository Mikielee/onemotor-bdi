<script setup>
// Green check icon, lifted as-is from Figma (Step 9 "Check Filled" instance).
// Uses BD green #009A44 with a white inner circle. The `size` prop scales
// both width and height to keep the icon square. Use this everywhere a
// "completed / included" check appears so visuals stay consistent with Figma.
defineProps({
  size: { type: [Number, String], default: 24 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    class="bdi-check-icon"
  >
    <circle cx="12" cy="12" r="6.75" fill="white" />
    <path
      d="M12 3C7.02949 3.00483 3 7.02949 3 12C3 16.9705 7.02949 21 12 21C16.9705 21 21 16.9705 21 12C21 7.02949 16.9705 3 12 3ZM16.5362 9.6933L11.1893 16.2708C10.9914 16.5169 10.6971 16.6617 10.3882 16.6713H10.3496C10.0504 16.6713 9.76086 16.5458 9.55818 16.3287L6.98606 13.5539C6.5807 13.1147 6.60965 12.4343 7.04397 12.029C7.48311 11.6236 8.16354 11.6525 8.5689 12.0869L10.2917 13.9496L14.852 8.33727C15.2284 7.87399 15.9088 7.80644 16.3673 8.17802C16.8306 8.55442 16.903 9.23485 16.5265 9.69812L16.5362 9.6933Z"
      fill="#009A44"
    />
  </svg>
</template>

<style scoped>
.bdi-check-icon { display: inline-block; flex-shrink: 0; }
</style>
