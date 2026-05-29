<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import StepIndicator from './components/StepIndicator.vue'
</script>

<template>
  <div class="bdi-shell">
    <AppHeader />
    <StepIndicator />
    <main class="bdi-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<style>
.bdi-main {
  flex: 1;
  padding: 0 16px 0 16px;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 160ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
