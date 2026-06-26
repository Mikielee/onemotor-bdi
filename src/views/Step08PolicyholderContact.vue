<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()

const local = reactive({
  preferredName: quote.contact?.preferredName || '',
  email: quote.contact?.email || '',
  phone: quote.contact?.phone || '',
  marketingChannels: [...(quote.contact?.marketingChannels || [])],
  consentPdpa: quote.contact?.consentPdpa ?? false,
})

function sync() {
  mutable.contact = {
    ...quote.contact,
    preferredName: local.preferredName,
    email: local.email,
    phone: local.phone,
    marketingChannels: [...local.marketingChannels],
    consentPdpa: local.consentPdpa,
  }
}

function toggleChannel(name) {
  const idx = local.marketingChannels.indexOf(name)
  if (idx === -1) local.marketingChannels.push(name)
  else local.marketingChannels.splice(idx, 1)
  sync()
}

function togglePdpa() {
  local.consentPdpa = !local.consentPdpa
  sync()
}

const channels = ['Email', 'SMS', 'Whatsapp']

const emailValid = computed(() => /^\S+@\S+\.\S+$/.test(local.email))
const phoneValid = computed(() => /^[89]\d{7}$/.test(local.phone.replace(/\s/g, '')))

const canContinue = computed(() =>
  local.preferredName.trim().length > 0
  && emailValid.value
  && phoneValid.value
  && local.consentPdpa
)

const nameError = computed(() => showErrors.value && local.preferredName.trim().length === 0)
const emailError = computed(() => showErrors.value && !emailValid.value)
const phoneError = computed(() => showErrors.value && !phoneValid.value)
const pdpaError = computed(() => showErrors.value && !local.consentPdpa)

// First IDIT call simulation: Next reveals a holding overlay for ~2.5s,
// then routes to Step 9 (Your Quote). Real implementation replaces the
// setTimeout with the IDIT POST + success handler.
const loading = ref(false)
const educationalTips = [
  'Comprehensive cover protects you against accidents, theft, and third-party claims.',
  'No Claim Discount rewards careful drivers with up to 50% off.',
  'Adding a named driver can lower your premium if they have a clean record.',
]
const currentTip = ref(educationalTips[0])

function onNext() {
  loading.value = true
  currentTip.value = educationalTips[Math.floor(Math.random() * educationalTips.length)]
  setTimeout(() => {
    loading.value = false
    router.push('/step/9')
  }, 2500)
}

// Sprint-review demo: preferred name + email + mobile + Email marketing
// channel + PDPA consent ticked. No postal code on Step 8.
const { register } = useDemoAutofill()
register(() => {
  local.preferredName = 'Wei Liang'
  local.email = 'demo@bdi.sg'
  local.phone = '91234567'
  local.marketingChannels = ['Email']
  local.consentPdpa = true
  sync()
})
</script>

<template>
  <section class="step">
    <h1 class="bdi-section-title">How should we contact you?</h1>

    <div class="fields">
      <div class="field" :data-error="nameError ? 'true' : null">
        <InputText
          v-model="local.preferredName"
          @update:model-value="sync"
          placeholder="Preferred name"
          class="bdi-input"
          :class="{ 'is-error': nameError }"
          fluid
        />
        <FieldError :show="nameError" message="Enter your preferred name." />
      </div>

      <div class="field" :data-error="emailError ? 'true' : null">
        <InputText
          v-model="local.email"
          @update:model-value="sync"
          placeholder="Email"
          class="bdi-input"
          :class="{ 'is-error': emailError }"
          type="email"
          fluid
        />
        <FieldError :show="emailError" message="Enter a valid email address." />
      </div>

      <div class="field" :data-error="phoneError ? 'true' : null">
        <div class="phone-row">
          <div class="country-code">+65</div>
          <InputText
            v-model="local.phone"
            @update:model-value="sync"
            placeholder="Mobile"
            class="bdi-input phone-input"
            :class="{ 'is-error': phoneError }"
            inputmode="numeric"
            maxlength="8"
            fluid
          />
        </div>
        <FieldError :show="phoneError" message="Enter a valid SG mobile (8 digits, starts with 8 or 9)." />
      </div>
    </div>

    <div class="channels">
      <p class="channels-title">Keep me updated for any special deals.</p>
      <div class="channels-cards">
        <button
          v-for="ch in channels"
          :key="ch"
          type="button"
          class="channel-card"
          :class="{ 'is-on': local.marketingChannels.includes(ch) }"
          @click="toggleChannel(ch)"
        >
          <span class="channel-box" :class="{ 'is-on': local.marketingChannels.includes(ch) }">
            <span v-if="local.marketingChannels.includes(ch)" class="channel-tick">&check;</span>
          </span>
          <span class="channel-label">{{ ch }}</span>
        </button>
      </div>
    </div>

    <div :data-error="pdpaError ? 'true' : null">
      <button type="button" class="pdpa" @click="togglePdpa">
        <span class="channel-box" :class="{ 'is-on': local.consentPdpa, 'is-error': pdpaError }">
          <span v-if="local.consentPdpa" class="channel-tick">&check;</span>
        </span>
        <span class="pdpa-text">
          I acknowledge and agree to the collection, use and disclosure of my personal data which has been provided for the purposes of procuring insurance products &amp; services as per the Budget Direct
          <a href="https://www.budgetdirect.com.sg/security-privacy" target="_blank" rel="noopener" @click.stop>Personal Data Protection Statement</a>.
        </span>
      </button>
      <FieldError :show="pdpaError" message="Please accept the Personal Data Protection Statement to continue." />
    </div>

    <StickyNext :disabled="!canContinue" :intercept-next="true" @blocked="reveal" @next="onNext" />

    <!-- First IDIT call: holding overlay -->
    <div v-if="loading" class="loading-overlay" role="alert" aria-live="polite">
      <div class="loading-card">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-title">Just a moment</p>
        <p class="loading-tip">{{ currentTip }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field { display: flex; flex-direction: column; }

.phone-row {
  display: flex;
  align-items: stretch;
}
.country-code {
  background: var(--bdi-grey-100);
  border: 1px solid var(--bdi-grey-300);
  border-right: 0;
  border-radius: var(--bdi-radius-card) 0 0 var(--bdi-radius-card);
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #5c5c5c;
  display: flex;
  align-items: center;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.channels-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
/* Desktop (≥768px): channels lay out horizontally per Figma 3997:7960
   — title sits above, then 3 cards side-by-side. */
@media (min-width: 768px) {
  .channels { gap: 12px; }
  .channels-cards {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
  .channels-cards .channel-card { flex: 1 1 0; }
}
.channels-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  font-family: var(--bdi-font);
}
.channel-card.is-on { border-color: var(--bdi-green); }
.channel-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--bdi-carbon);
}
.channel-box {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--bdi-carbon);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.channel-box.is-on { background: var(--bdi-green); border-color: var(--bdi-green); }
.channel-box.is-error { border-color: var(--bdi-red); }
.channel-tick {
  color: #fff;
  font-size: 10px;
  line-height: 1;
}

.pdpa {
  background: transparent;
  border: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  font-family: var(--bdi-font);
  margin-top: 8px;
}
.pdpa .channel-box { margin-top: 4px; }
.pdpa-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
.pdpa-text a {
  color: var(--bdi-cyan);
  text-decoration: underline;
}

.step :deep(.bdi-input.p-inputtext),
.step :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 16px;
  font-size: 16px;
  color: var(--bdi-carbon);
  font-weight: 500;
  min-height: 56px;
  width: 100%;
}
.phone-row :deep(.phone-input.p-inputtext) {
  border-radius: 0 var(--bdi-radius-card) var(--bdi-radius-card) 0;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 245, 245, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.loading-card {
  max-width: 320px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.spinner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 6px solid var(--bdi-grey-200);
  border-top-color: var(--bdi-red, #DA291C);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-title {
  margin: 4px 0 0 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.loading-tip {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.5;
}
</style>
