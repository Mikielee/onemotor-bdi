<script setup>
/**
 * Mock payment gateway. Reached when the customer picked Credit Card on
 * Step 15 (Single or Instalment). Real flow would redirect to the actual
 * Stripe / Adyen / 2C2P hosted page; this is just a faithful-feeling
 * placeholder so the prototype journey is end-to-end.
 *
 * On submit we run a 2.5s "processing" overlay and route to /step/17.
 * Validation is light: format only, no Luhn check.
 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import { useQuote } from '../store/quote'
import { useQuotePricing } from '../composables/useQuotePricing'
import { formatMoney } from '../utils/money'
import creditCardsLogo from '../assets/payment/credit-cards.png'

const router = useRouter()
const { quote } = useQuote()
const pricing = useQuotePricing()

const local = reactive({
  number: '',
  expiry: '',
  cvv: '',
  name: '',
})

const processing = ref(false)
const errors = reactive({ number: '', expiry: '', cvv: '', name: '' })

function formatCardNumber(v) {
  const digits = (v || '').replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}
function formatExpiry(v) {
  const digits = (v || '').replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function onNumberInput(v) { local.number = formatCardNumber(v); errors.number = '' }
function onExpiryInput(v) { local.expiry = formatExpiry(v); errors.expiry = '' }
function onCvvInput(v) {
  local.cvv = (v || '').replace(/\D/g, '').slice(0, 4)
  errors.cvv = ''
}

const amountLabel = computed(() => formatMoney(pricing.displayAmount.value))
const termLabel = computed(() =>
  pricing.paymentTerm.value === 'instalment' ? 'per month' : 'one-time payment',
)
const bankLabel = computed(() => {
  const map = { uob: 'UOB', dbs: 'DBS', ocbc: 'OCBC' }
  return map[quote.payment?.bank] || ''
})

const numberValid = computed(() => local.number.replace(/\D/g, '').length === 16)
const expiryValid = computed(() => /^\d{2}\/\d{2}$/.test(local.expiry))
const cvvValid = computed(() => local.cvv.length >= 3)
const nameValid = computed(() => local.name.trim().length > 0)
const canPay = computed(
  () => numberValid.value && expiryValid.value && cvvValid.value && nameValid.value,
)

function submit() {
  errors.number = numberValid.value ? '' : 'Enter your 16-digit card number.'
  errors.expiry = expiryValid.value ? '' : 'Use MM/YY.'
  errors.cvv = cvvValid.value ? '' : 'CVV is at least 3 digits.'
  errors.name = nameValid.value ? '' : 'Enter the cardholder name.'
  if (!canPay.value) return
  processing.value = true
  setTimeout(() => {
    processing.value = false
    router.push('/step/17')
  }, 2500)
}

function cancel() { router.push('/step/15') }
</script>

<template>
  <section class="gateway">
    <div class="bar">
      <div class="bar-brand">Secure payment</div>
      <button type="button" class="bar-cancel" @click="cancel">Cancel</button>
    </div>

    <h1 class="gw-title">Complete your payment</h1>
    <p class="gw-sub">
      You'll be charged
      <strong>{{ amountLabel }}</strong>
      ({{ termLabel }}<template v-if="bankLabel"> · via {{ bankLabel }} card</template>).
    </p>

    <div class="cards-row">
      <img :src="creditCardsLogo" alt="Accepted credit cards" class="cards-img" />
    </div>

    <form class="gw-form" @submit.prevent="submit">
      <label class="field">
        <span class="lbl">Card number</span>
        <InputText
          :model-value="local.number"
          @update:model-value="onNumberInput"
          placeholder="0000 0000 0000 0000"
          inputmode="numeric"
          autocomplete="cc-number"
          class="bdi-input"
          :class="{ 'is-error': errors.number }"
          fluid
        />
        <span v-if="errors.number" class="err">{{ errors.number }}</span>
      </label>

      <div class="row-two">
        <label class="field">
          <span class="lbl">Expiry</span>
          <InputText
            :model-value="local.expiry"
            @update:model-value="onExpiryInput"
            placeholder="MM/YY"
            inputmode="numeric"
            autocomplete="cc-exp"
            class="bdi-input"
            :class="{ 'is-error': errors.expiry }"
            maxlength="5"
            fluid
          />
          <span v-if="errors.expiry" class="err">{{ errors.expiry }}</span>
        </label>

        <label class="field">
          <span class="lbl">CVV</span>
          <InputText
            :model-value="local.cvv"
            @update:model-value="onCvvInput"
            placeholder="123"
            inputmode="numeric"
            autocomplete="cc-csc"
            class="bdi-input"
            :class="{ 'is-error': errors.cvv }"
            maxlength="4"
            fluid
          />
          <span v-if="errors.cvv" class="err">{{ errors.cvv }}</span>
        </label>
      </div>

      <label class="field">
        <span class="lbl">Cardholder name</span>
        <InputText
          v-model="local.name"
          placeholder="As shown on the card"
          autocomplete="cc-name"
          class="bdi-input"
          :class="{ 'is-error': errors.name }"
          fluid
        />
        <span v-if="errors.name" class="err">{{ errors.name }}</span>
      </label>

      <button type="submit" class="pay-btn">
        Pay {{ amountLabel }}
      </button>

      <p class="secure-line">
        <i class="pi pi-lock" aria-hidden="true"></i>
        Card details are encrypted and never stored on Budget Direct.
      </p>
    </form>

    <div v-if="processing" class="loading-overlay" role="alert" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loading-text">Authorising your payment…</p>
      <p class="loading-sub">Please don't close this window.</p>
    </div>
  </section>
</template>

<style scoped>
.gateway {
  min-height: 100vh;
  background: var(--bdi-grey-100);
  padding: 0 16px 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: -16px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--bdi-grey-200);
  margin-bottom: 8px;
}
.bar-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bdi-carbon);
}
.bar-brand::before {
  content: '🔒';
  font-size: 14px;
}
.bar-cancel {
  background: transparent;
  border: 0;
  padding: 4px 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-cyan);
  cursor: pointer;
}

.gw-title {
  margin: 4px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 22px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.gw-sub {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
  line-height: 1.45;
}
.gw-sub strong {
  font-weight: 700;
  color: var(--bdi-carbon);
}

.cards-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cards-img { height: 22px; width: auto; }

.gw-form {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--bdi-grey-200);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lbl {
  font-family: var(--bdi-font);
  font-size: 13px;
  font-weight: 600;
  color: var(--bdi-carbon);
}
.err {
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--bdi-red);
}

.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.gateway :deep(.bdi-input.p-inputtext),
.gateway :deep(.bdi-input .p-inputtext) {
  font-family: var(--bdi-font);
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 16px;
  color: var(--bdi-carbon);
  font-weight: 500;
  min-height: 52px;
  width: 100%;
}
.gateway :deep(.bdi-input.is-error.p-inputtext),
.gateway :deep(.bdi-input.is-error .p-inputtext) {
  border-color: var(--bdi-red);
}

.pay-btn {
  margin-top: 4px;
  background: var(--bdi-green);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.pay-btn:hover { filter: brightness(1.05); }

.secure-line {
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}
.secure-line .pi { font-size: 12px; }

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 245, 245, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1000;
  padding: 24px;
}
.spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid var(--bdi-grey-200);
  border-top-color: var(--bdi-green);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  margin: 4px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.loading-sub {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}
</style>
