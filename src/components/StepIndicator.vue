<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const groups = [
  { id: 0, label: 'Your Car' },
  { id: 1, label: 'Your Details' },
  { id: 2, label: 'Your Quote' },
  { id: 3, label: 'Finalise & Pay' },
]

const activeGroup = computed(() => route.meta?.group ?? 0)
</script>

<template>
  <nav class="bdi-steps" aria-label="Quote progress">
    <div
      v-for="g in groups"
      :key="g.id"
      class="bdi-step"
      :class="{ 'is-active': g.id === activeGroup, 'is-done': g.id < activeGroup }"
    >
      <span class="bdi-step-label">{{ g.label }}</span>
      <span class="bdi-step-bar" />
    </div>
  </nav>
</template>

<style scoped>
.bdi-steps {
  display: flex;
  gap: 8px;
  padding: 16px 16px 0 16px;
  background: var(--bdi-bg);
}
.bdi-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bdi-step-label {
  font-size: 10px;
  font-weight: 400;
  color: var(--bdi-grey-600);
  text-align: center;
  line-height: 1.3;
}
.bdi-step-bar {
  width: 100%;
  height: 4px;
  border-radius: var(--bdi-radius-pill);
  background: var(--bdi-grey-300);
}
.bdi-step.is-active .bdi-step-label { color: var(--bdi-green); }
.bdi-step.is-active .bdi-step-bar { background: var(--bdi-green); }
.bdi-step.is-done .bdi-step-label { color: var(--bdi-carbon); }
.bdi-step.is-done .bdi-step-bar { background: var(--bdi-green); }
</style>
