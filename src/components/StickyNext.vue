<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  to: { type: [String, Number, Object], default: null },
  label: { type: String, default: 'Next' },
  hideBack: { type: Boolean, default: false },
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
  <div class="bdi-sticky-next">
    <div class="bdi-actions">
      <button v-if="showBack" type="button" class="bdi-back" aria-label="Go back" @click="onBack">
        <span class="bdi-back-arrow" aria-hidden="true">‹</span>
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
.bdi-sticky-next {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: var(--bdi-max-mobile);
  background: #fff;
  padding: 16px;
  border-top: 1px solid var(--bdi-grey-200);
  z-index: 5;
}

.bdi-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.bdi-back {
  flex: 0 0 72px;
  width: 72px;
  height: 48px;
  background: #fff;
  border: 1px solid var(--bdi-carbon);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1;
  color: var(--bdi-carbon);
  cursor: pointer;
  padding: 0;
}

.bdi-back:hover { background: var(--bdi-grey-100); }

.bdi-back-arrow {
  display: inline-block;
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  margin-top: -2px;
}

.bdi-actions :deep(.p-button.bdi-primary) {
  flex: 1 1 auto;
  width: auto;
}
</style>
