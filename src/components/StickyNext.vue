<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  to: { type: [String, Number, Object], default: null },
  label: { type: String, default: 'Next' },
  hideBack: { type: Boolean, default: false },
  price: { type: String, default: '' },
})

const router = useRouter()
const route = useRoute()

const step = computed(() => route.meta?.step ?? 1)
const showBack = computed(() => !props.hideBack && step.value > 1)

function onNext() {
  if (props.disabled) return
  if (props.to !== null) {
    router.push(typeof props.to === 'object' ? props.to : props.to)
    return
  }
  if (step.value < 11) router.push(`/step/${step.value + 1}`)
}

function onBack() {
  if (step.value > 1) router.push(`/step/${step.value - 1}`)
  else router.back()
}
</script>

<template>
  <div class="sticky-cta">
    <div v-if="price" class="sticky-price">
      <span class="sticky-price-amt">{{ price }}</span>
      <span class="sticky-price-unit">per year (incl. GST)</span>
    </div>
    <div class="sticky-actions">
      <button
        v-if="showBack"
        type="button"
        class="sticky-back"
        aria-label="Go back"
        @click="onBack"
      >
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <Button
        class="bdi-primary"
        :disabled="disabled"
        :label="label"
        @click="onNext"
      />
    </div>
  </div>
</template>

<style scoped>
/* Sticky CTA sits in the normal document flow (above the footer) per
   Figma 3902-1286: sticky bar then footer, never overlapping. */
.sticky-cta {
  background: #fff;
  padding: 16px;
  border-top: 1px solid var(--bdi-grey-200);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: auto -16px 0 -16px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.sticky-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0 4px 0;
}
.sticky-price-amt {
  font-size: 22px;
  font-weight: 900;
  color: var(--bdi-carbon);
}
.sticky-price-unit {
  font-size: 13px;
  color: var(--bdi-grey-600);
}

.sticky-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sticky-back {
  flex: 0 0 72px;
  width: 72px;
  height: 48px;
  background: #fff;
  border: 1px solid var(--bdi-carbon);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bdi-carbon);
  cursor: pointer;
  padding: 0;
}
.sticky-back:hover { background: var(--bdi-grey-100); }
.sticky-back .pi { font-size: 16px; }

.sticky-actions :deep(.p-button.bdi-primary) {
  flex: 1 1 auto;
}
</style>
