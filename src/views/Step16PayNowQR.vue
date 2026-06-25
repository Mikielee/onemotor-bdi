<script setup>
/**
 * Step 16 — PayNow QR (OMP-655).
 * Figma BD mobile reference: 5089-4302 canvas → 5089:4637 mobile mock.
 *
 * Only reachable when the customer picked PayNow on Step 15 — the gateway
 * mock handles credit-card payments separately. All three paths
 * (PayNow / Single-card / Instalment-card) converge on Step 17.
 *
 * The QR rendered here is decorative for the prototype. Real flow would
 * receive an EMV-formatted PayNow string from the payment provider and
 * encode that. The QR image source uses the free QR Server API; swap
 * for production's PayNow EMV generator before launch.
 */
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuotePricing } from '../composables/useQuotePricing'
import { formatMoney } from '../utils/money'
import paynowLogo from '../assets/payment/paynow.png'

const router = useRouter()
const pricing = useQuotePricing()

// Reference number — pick once on mount so re-renders don't churn it.
const reference = ref('')
const expiryLabel = ref('')

onMounted(() => {
  // Format: PN + YYYYMMDD + 6 random alphanumerics. Prototype only.
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  reference.value = `PN${datePart}-${randomPart}`

  const expires = new Date(now.getTime() + 15 * 60 * 1000)
  expiryLabel.value = expires.toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
})

const amountLabel = computed(() => `S${formatMoney(pricing.displayAmount.value)}`)

const qrPayload = computed(() => {
  const parts = [
    'BDI-PAYNOW-DEMO',
    reference.value,
    formatMoney(pricing.displayAmount.value),
  ].join('|')
  return parts
})
const qrUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=4&data=${encodeURIComponent(qrPayload.value)}`,
)

function saveQr() {
  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = `${reference.value}.png`
  link.target = '_blank'
  link.rel = 'noopener'
  link.click()
}

function confirmPayment() { router.push('/step/17') }
function changePayment() { router.push('/step/15') }
</script>

<template>
  <section class="step">
    <div class="paynow-head">
      <img :src="paynowLogo" alt="PayNow" class="paynow-logo" />
    </div>
    <h1 class="page-title">Scan QR code to pay</h1>

    <div class="qr-frame">
      <img :src="qrUrl" alt="PayNow QR code" class="qr-img" />
    </div>

    <p class="amount">{{ amountLabel }}</p>

    <dl class="meta">
      <div class="meta-row">
        <dt>Payment reference</dt>
        <dd>{{ reference || '—' }}</dd>
      </div>
      <div class="meta-row">
        <dt>To</dt>
        <dd>Budget Direct Insurance</dd>
      </div>
      <div class="meta-row">
        <dt>QR code expires</dt>
        <dd>{{ expiryLabel || '—' }}</dd>
      </div>
    </dl>

    <button type="button" class="outline-btn" @click="saveQr">
      Save QR code
    </button>

    <h2 class="how-title">How to pay via PayNow</h2>
    <ol class="how-list">
      <li>Save or screenshot the QR code above.</li>
      <li>Log in to your bank's PayNow app.</li>
      <li>Use "Scan and Pay" or "Pay with QR Code" to scan the saved image.</li>
      <li>Confirm payment in your bank app, then return to this page.</li>
    </ol>

    <div class="cta-stack">
      <button type="button" class="primary-btn" @click="confirmPayment">
        Confirm payment
      </button>
      <button type="button" class="ghost-btn" @click="changePayment">
        Change payment method
      </button>
    </div>
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paynow-head {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
.paynow-logo {
  height: 28px;
  width: auto;
}

.page-title {
  margin: 0;
  text-align: center;
  font-family: var(--bdi-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--bdi-carbon);
}

.qr-frame {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--bdi-grey-200);
  align-self: center;
}
.qr-img {
  display: block;
  width: 240px;
  height: 240px;
}

.amount {
  margin: 4px 0 0 0;
  text-align: center;
  font-family: var(--bdi-font);
  font-size: 28px;
  font-weight: 900;
  color: var(--bdi-green);
  line-height: 1.1;
}

.meta {
  margin: 4px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
.meta-row { display: flex; flex-direction: column; gap: 2px; }
.meta-row dt {
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--bdi-grey-600);
}
.meta-row dd {
  margin: 0;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-carbon);
}

.outline-btn {
  margin-top: 8px;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--bdi-carbon);
  cursor: pointer;
}
.outline-btn:hover { background: var(--bdi-grey-100); }

.how-title {
  margin: 16px 0 0 0;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 700;
  color: var(--bdi-carbon);
}
.how-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--bdi-carbon);
  line-height: 1.5;
}

.cta-stack {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.primary-btn {
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
.primary-btn:hover { filter: brightness(1.05); }

.ghost-btn {
  background: transparent;
  border: 0;
  padding: 8px;
  font-family: var(--bdi-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--bdi-cyan);
  cursor: pointer;
}
.ghost-btn:hover { text-decoration: underline; }
</style>
