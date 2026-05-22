<script setup>
import logoGroup from '../assets/logo/bdi-logo-group.png'
import logoGroup1 from '../assets/logo/bdi-logo-group1.png'
import logoVector from '../assets/logo/bdi-logo-vector.png'
import carIcon from '../assets/icons/car.png'
import menuIcon from '../assets/icons/menu.png'
</script>

<template>
  <header class="bdi-header">
    <a class="bdi-logo" href="/" aria-label="Budget Direct Insurance home">
      <span class="bdi-logo-tagline">It pays to choose</span>
      <span class="bdi-logo-stack">
        <img :src="logoGroup1" alt="" class="bdi-logo-group1" />
        <img :src="logoGroup" alt="" class="bdi-logo-group" />
        <img :src="logoVector" alt="Budget Direct Insurance" class="bdi-logo-vector" />
      </span>
    </a>
    <div class="bdi-header-right">
      <button class="bdi-product-chip" type="button">
        <img :src="carIcon" alt="" class="bdi-chip-icon" />
        <span>Car Insurance</span>
      </button>
      <button class="bdi-menu" type="button" aria-label="Open menu">
        <img :src="menuIcon" alt="" />
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
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  gap: 2px;
}

.bdi-logo-tagline {
  font-size: 9px;
  font-weight: 500;
  color: var(--bdi-carbon);
  letter-spacing: 0.2px;
  margin-bottom: 2px;
}

.bdi-logo-stack {
  position: relative;
  display: inline-block;
  width: 94px;
  height: 50px;
}
.bdi-logo-stack img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.bdi-chip-icon {
  width: 16px;
  height: 16px;
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
}
.bdi-menu img { width: 24px; height: 24px; }
</style>
