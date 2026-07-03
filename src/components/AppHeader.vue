<script setup>
import logoUrl from '../assets/budget-direct-logo.png'
import { useDemoAutofill } from '../composables/useDemoAutofill'

// The 'Car Insurance' chip in the header doubles as a sprint-review
// demo trigger. Each step page registers a fill handler; clicking
// the chip runs the current page's handler. See useDemoAutofill.js.
const { trigger } = useDemoAutofill()
</script>

<template>
  <header class="bdi-header">
    <a class="bdi-logo" href="/" aria-label="Budget Direct Insurance home">
      <img :src="logoUrl" alt="Budget Direct Insurance" />
    </a>
    <div class="bdi-header-right">
      <button
        class="bdi-product-chip"
        type="button"
        title="Demo: autofill this page"
        @click="trigger"
      >
        <i class="pi pi-car bdi-chip-icon" aria-hidden="true"></i>
        <span>Car Insurance</span>
      </button>
      <button class="bdi-menu" type="button" aria-label="Open menu">
        <i class="pi pi-bars" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Header — master component contract (journey-spec/components.yaml):
   84px tall, 17px/16px padding, logo in a contained ~72x50 box, chip +
   burger right-aligned with a 16px gap. Same geometry as DA's .da-header
   so the two brands stay consistent; only the brand marks differ.
   The 17px vertical padding also keeps the logo clear of the phone
   frame's 28px corner radius, which was clipping the "It pays to
   choose" tagline when the logo bled to the header's top edge. */
.bdi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 17px 16px;
  background: #fff;
  border-bottom: 1px solid var(--bdi-grey-200);
}

.bdi-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.bdi-logo img {
  display: block;
  width: 72px;
  height: 50px;
  object-fit: contain;
}

.bdi-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bdi-product-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-200);
  border-radius: var(--bdi-radius-pill);
  color: var(--bdi-carbon);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.bdi-chip-icon {
  font-size: 16px;
  color: var(--bdi-red);
}

.bdi-menu {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--bdi-carbon);
}
.bdi-menu .pi { font-size: 20px; }
</style>
