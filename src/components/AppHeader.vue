<script setup>
import logoUrl from '../assets/budget-direct-logo.png'
</script>

<template>
  <header class="bdi-header">
    <a class="bdi-logo" href="/" aria-label="Budget Direct Insurance home">
      <img :src="logoUrl" alt="Budget Direct Insurance" />
    </a>
    <div class="bdi-header-right">
      <button class="bdi-product-chip" type="button">
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
.bdi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 0 16px;
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
  height: 56px;
  width: auto;
}

.bdi-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
