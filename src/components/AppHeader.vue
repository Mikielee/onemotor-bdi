<script setup>
</script>

<template>
  <header class="bdi-header">
    <a class="bdi-logo" href="/" aria-label="Budget Direct Insurance home">
      <span class="bdi-logo-tagline">It pays to choose</span>
      <span class="bdi-logo-wordmark" aria-hidden="true">
        <span class="bdi-logo-line">
          <span class="dark">Bu</span><span class="red">dget</span>
        </span>
        <span class="bdi-logo-line">
          <span class="dark">Di</span><span class="red">rect</span><sup class="reg">®</sup>
        </span>
      </span>
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
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  gap: 2px;
  line-height: 1;
}

.bdi-logo-tagline {
  font-size: 9px;
  font-weight: 500;
  color: var(--bdi-carbon);
  letter-spacing: 0.2px;
  margin-bottom: 2px;
}

.bdi-logo-wordmark {
  font-family: var(--bdi-font);
  font-weight: 900;
  letter-spacing: -0.02em;
  display: inline-flex;
  flex-direction: column;
  line-height: 0.95;
}
.bdi-logo-line {
  font-size: 20px;
  display: inline-block;
}
.bdi-logo-line .dark { color: var(--bdi-carbon); }
.bdi-logo-line .red { color: var(--bdi-red); }
.bdi-logo-line .reg {
  font-size: 9px;
  font-weight: 700;
  color: var(--bdi-red);
  margin-left: 1px;
  vertical-align: super;
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
