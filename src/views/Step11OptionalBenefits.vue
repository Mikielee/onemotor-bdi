<script setup>
import { computed, ref } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const benefits = [
  {
    id: 'ncd-protector-plus',
    title: 'NCD Protector Plus',
    price: '$8.11',
    blurb: 'Protect your No Claim Discount so a single at-fault claim does not reset it.',
    recommended: true,
  },
  {
    id: 'breakdown-assistance',
    title: '24-hour Breakdown Assistance',
    price: '$8.11',
    blurb: 'Round-the-clock help if your car breaks down, including tow-to-workshop service.',
    recommended: true,
  },
  {
    id: 'medical-expenses',
    title: 'Medical Expenses',
    price: '$8.11',
    blurb: 'Covers medical costs for you and your passengers following a covered accident.',
    recommended: false,
  },
  {
    id: 'personal-accident',
    title: 'Personal accident',
    price: '$8.11',
    blurb: 'A lump-sum payment if a covered accident leads to death or permanent disability.',
    recommended: false,
  },
]

const selected = ref(new Set(quote.optionalBenefits || []))

function toggle(id) {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
  mutable.optionalBenefits = Array.from(selected.value)
  // force reactivity by reassigning
  selected.value = new Set(selected.value)
}

const canContinue = computed(() => true)
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">Want extra coverage?</h1>

    <div class="benefits">
      <div
        v-for="b in benefits"
        :key="b.id"
        class="benefit-card"
        :class="{ 'is-on': selected.has(b.id) }"
      >
        <div v-if="b.recommended" class="badge">Recommended</div>
        <div class="benefit-row">
          <p class="benefit-title">{{ b.title }}</p>
          <button
            type="button"
            class="switch"
            :class="{ 'is-on': selected.has(b.id) }"
            :aria-pressed="selected.has(b.id)"
            @click="toggle(b.id)"
          >
            <span class="switch-handle" />
          </button>
        </div>
        <div class="price-pill">{{ b.price }}</div>
        <p class="benefit-blurb">{{ b.blurb }}</p>
        <a href="#" class="learn-more">Learn more</a>
      </div>
    </div>

    <StickyNext :disabled="!canContinue" label="Get my quote" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 140px;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-card {
  position: relative;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1);
}
.benefit-card.is-on {
  border-color: var(--bdi-green);
  box-shadow: 0 0 0 1px var(--bdi-green) inset, 0 1px 1px rgba(0,0,0,0.05);
}

.badge {
  position: absolute;
  top: -11px;
  left: 17px;
  background: var(--bdi-green);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 30px;
}

.benefit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.benefit-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--bdi-carbon);
  flex: 1;
}

.switch {
  position: relative;
  width: 52px;
  height: 32px;
  border-radius: 100px;
  border: 2px solid var(--bdi-grey-600);
  background: #fff;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.switch-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bdi-grey-600);
  transition: left 150ms ease, background-color 150ms ease;
}
.switch.is-on {
  background: var(--bdi-green);
  border-color: var(--bdi-green);
}
.switch.is-on .switch-handle {
  left: 24px;
  background: #fff;
}

.price-pill {
  align-self: flex-start;
  background: var(--bdi-grey-100);
  border-radius: var(--bdi-radius-card);
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
}

.benefit-blurb {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}

.learn-more {
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-cyan);
  text-decoration: none;
}
.learn-more:hover { text-decoration: underline; }
</style>
