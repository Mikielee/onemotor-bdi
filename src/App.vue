<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import StepIndicator from './components/StepIndicator.vue'

// The scrolling region is this inner div, not the window — so the router's
// scrollBehavior can't reset it. Without this, navigating from a scrolled
// step lands mid-page. Same pattern as the DA prototype's shell.
const scrollEl = ref(null)
const route = useRoute()
watch(
  () => route.fullPath,
  () => { nextTick(() => scrollEl.value?.scrollTo(0, 0)) }
)
</script>

<template>
  <div class="bdi-shell">
    <AppHeader />
    <StepIndicator />
    <!-- The only scrolling region: step content + footer. The sticky bar
         inside a step docks to the bottom of this region while the content
         scrolls (position: sticky resolves against this scrollport). -->
    <div class="bdi-scroll" ref="scrollEl">
      <main class="bdi-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<style>
.bdi-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
}

/* Grows to fill the scroll region on short pages so the sticky bar rests
   at the frame bottom; grows with content on long pages so it scrolls. */
.bdi-main {
  flex: 1 0 auto;
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
