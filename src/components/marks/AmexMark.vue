<script setup>
/**
 * Prototype-only stylized "AMEX" mark — NOT the licensed logo asset.
 * Production must use the brand's official logo from americanexpress.com
 * brand portal. Same approach for Mastercard, Visa, PayNow, UOB, DBS, OCBC.
 */
defineProps({ size: { type: [Number, String], default: 32 } })
</script>

<template>
  <span class="amex-mark" :style="{ fontSize: `${Number(size) * 0.32}px` }">AMEX</span>
</template>

<style scoped>
.amex-mark {
  display: inline-block;
  padding: 4px 8px;
  background: #016FD0;
  color: #fff;
  font-family: var(--bdi-font);
  font-weight: 900;
  letter-spacing: 0.08em;
  border-radius: 3px;
  line-height: 1;
}
</style>
