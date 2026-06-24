<script setup>
/**
 * Step 11 — Optional Benefits (OMP-362).
 * Figma BD/DA mobile reference: 4015-974 (canvas), 5584:1218 (collapsed),
 * 5553:7827 / 5553:9633 (expanded).
 *
 * 10 optional add-ons. By default we only show the top 3 (the two Recommended
 * picks + Any Workshop). The remaining 7 sit behind a "Show more optional
 * benefits" button so the page stays scannable. Each card has:
 *   - optional Recommended pill at the top-left corner
 *   - title + price + toggle on a single row
 *   - description + Learn more link
 *
 * Selection is persisted to quote.optionalBenefits. Prices are flat $8.11
 * placeholders for the prototype; real values come from IDIT pricing on
 * each toggle in production.
 */
import { computed, ref } from 'vue'
import BdiQuoteFooter from '../components/BdiQuoteFooter.vue'
import { useQuote } from '../store/quote'
import { formatMoney } from '../utils/money'

const { quote, mutable } = useQuote()

const benefits = [
  {
    id: 'ncd-protector',
    title: 'NCD Protector',
    price: 8.11,
    blurb: 'Protect your No Claim Discount even if you make a claim. Your NCD stays unchanged at renewal.',
    recommended: true,
  },
  {
    id: 'roadside-assistance',
    title: '24-hour Roadside Assistance',
    price: 8.11,
    blurb: 'Round-the-clock help if your car breaks down, including tow-to-workshop service.',
    recommended: true,
  },
  {
    id: 'any-workshop',
    title: 'Any Workshop',
    price: 8.11,
    blurb: 'Choose any workshop for repairs, not just our authorised network.',
    recommended: false,
  },
  {
    id: 'new-for-old',
    title: 'New for Old Replacement Car',
    price: 8.11,
    blurb: 'Get a brand-new replacement car if yours is written off within the first 24 months.',
    recommended: false,
  },
  {
    id: 'medical-expenses',
    title: 'Medical Expenses',
    price: 8.11,
    blurb: "Cover for medical bills if you're injured in a covered accident.",
    recommended: false,
  },
  {
    id: 'overseas-emergency',
    title: 'Overseas Emergency Allowance / Repatriation',
    price: 8.11,
    blurb: 'Daily allowance and repatriation support when driving in Malaysia or southern Thailand.',
    recommended: false,
  },
  {
    id: 'personal-accident',
    title: 'Personal Accident',
    price: 8.11,
    blurb: 'A lump-sum payment if a covered accident leads to death or permanent disability.',
    recommended: false,
  },
  {
    id: 'transport-allowance',
    title: 'Transport Allowance / Loss of Use',
    price: 8.11,
    blurb: 'Daily allowance for alternative transport while your car is being repaired.',
    recommended: false,
  },
  {
    id: 'windscreen-cover',
    title: 'Windscreen Cover Add-On',
    price: 8.11,
    blurb: 'Cover for windscreen and window damage with no impact on your NCD.',
    recommended: false,
  },
  {
    id: 'ev-addon',
    title: 'EV Add-on Pack',
    price: 8.11,
    blurb: 'Cover for charging cables, wall chargers, and battery-related damage for electric vehicles.',
    recommended: false,
  },
]

const TOP_COUNT = 3
const expanded = ref(false)

const visibleBenefits = computed(() =>
  expanded.value ? benefits : benefits.slice(0, TOP_COUNT),
)

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
        v-for="b in visibleBenefits"
        :key="b.id"
        class="benefit-card"
        :class="{ 'is-on': selected.has(b.id) }"
      >
        <div v-if="b.recommended" class="badge">Recommended</div>
        <div class="benefit-row">
          <p class="benefit-title">{{ b.title }}</p>
          <span class="benefit-price">{{ formatMoney(b.price) }}</span>
          <button
            type="button"
            class="switch"
            :class="{ 'is-on': selected.has(b.id) }"
            :aria-pressed="selected.has(b.id)"
            :aria-label="`${b.title} ${selected.has(b.id) ? 'on' : 'off'}`"
            @click="toggle(b.id)"
          >
            <span class="switch-handle" />
          </button>
        </div>
        <p class="benefit-blurb">{{ b.blurb }}</p>
        <a href="#" class="learn-more">Learn more</a>
      </div>
    </div>

    <button
      type="button"
      class="show-more"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show fewer optional benefits' : 'Show more optional benefits' }}
    </button>

    <BdiQuoteFooter :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card: white bg, subtle shadow, light grey border by default; green border
   when the toggle is on. Recommended badge floats over the top edge. */
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
  box-shadow: 0 1px 1px rgba(0,0,0,0.05);
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

/* Title + price + toggle on a single row. Title flexes; price stays right
   of title; toggle is fixed-width at the far right. */
.benefit-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.benefit-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  flex: 1;
  line-height: 1.3;
}

.benefit-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
  flex-shrink: 0;
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

.benefit-blurb {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.5;
}

.learn-more {
  font-size: 14px;
  font-weight: 700;
  color: var(--bdi-cyan);
  text-decoration: none;
  align-self: flex-start;
}
.learn-more:hover { text-decoration: underline; }

/* Full-width outlined toggle for showing the rest of the benefits.
   Per Figma: white bg, light grey border, cyan text. Sits as an action,
   not a content card — hence cyan to match other "Save and email quote"
   text-link CTAs. */
.show-more {
  width: 100%;
  background: #fff;
  border: 1px solid #DADADA;
  border-radius: 8px;
  padding: 16px;
  min-height: 56px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-cyan);
  cursor: pointer;
  text-align: center;
}
.show-more:hover { background: var(--bdi-grey-100); }
</style>
