/**
 * useQuotePricing — single source of truth for the prototype's premium math.
 * Reads inputs from the quote store and returns reactive computeds the hero
 * card on Step 9 and the BdiQuoteFooter (Steps 9+) can share.
 *
 * Numbers are prototype placeholders. The real journey calls IDIT's
 * premiumCalculate on every meaningful change; here we just want the
 * sticky bar to feel alive as the user adds drivers / benefits / etc.
 */
import { computed } from 'vue'
import { useQuote } from '../store/quote'

const BASE_SUBTOTAL = 240.0
const GST_RATE = 0.09
const SINGLE_DISCOUNT_RATE = 0.03
const MEDICAL_EXPENSES_AMOUNT = 80.0
const PER_DRIVER = 50.0
const AUTHORISED_DRIVER_PLAN_COST = 200.0
const BENEFIT_PRICE = 8.11

const EXCESS_DELTAS = {
  0: 50,
  500: 10,
  600: 0,
  800: -20,
  1000: -30,
  1500: -50,
}

// Mirrors Step 11's benefits list so we can display human labels in the
// breakdown without dragging the whole component dependency along.
const BENEFIT_LABELS = {
  'ncd-protector': 'NCD Protector',
  'roadside-assistance': '24-hour Roadside Assistance',
  'any-workshop': 'Any Workshop',
  'new-for-old': 'New for Old Replacement Car',
  'medical-expenses': 'Medical Expenses',
  'overseas-emergency': 'Overseas Emergency / Repatriation',
  'personal-accident': 'Personal Accident',
  'transport-allowance': 'Transport Allowance',
  'windscreen-cover': 'Windscreen Cover',
  'ev-addon': 'EV Add-on Pack',
}

export function useQuotePricing() {
  const { quote } = useQuote()

  const paymentTerm = computed(() => quote.quoteSelection?.paymentTerm ?? 'single')
  const excess = computed(() => quote.quoteSelection?.excess ?? 600)
  const selectedBenefits = computed(() => quote.optionalBenefits ?? [])
  const additionalDrivers = computed(() => quote.additionalDrivers ?? [])
  const hasADP = computed(() => quote.authorisedDriverPlan === true)
  const appliedPromo = computed(() => quote.quoteSelection?.appliedPromo ?? null)

  const excessAdjustment = computed(() => EXCESS_DELTAS[excess.value] ?? 0)

  // Personal Accident benefit appears as its own "Medical expenses" row
  // (mirroring the legacy Step 9 line item). Other benefits are flat $8.11.
  const hasPersonalAccident = computed(() => selectedBenefits.value.includes('personal-accident'))
  const medicalExpenses = computed(() => hasPersonalAccident.value ? MEDICAL_EXPENSES_AMOUNT : 0)

  const driverCount = computed(() => additionalDrivers.value.length)
  const driverImpact = computed(() => driverCount.value * PER_DRIVER)
  const adpImpact = computed(() => hasADP.value ? AUTHORISED_DRIVER_PLAN_COST : 0)

  // Benefits excluding Personal Accident (which is shown separately).
  const otherBenefits = computed(() =>
    selectedBenefits.value.filter((b) => b !== 'personal-accident'),
  )
  const otherBenefitsCount = computed(() => otherBenefits.value.length)
  const otherBenefitsImpact = computed(() => otherBenefitsCount.value * BENEFIT_PRICE)

  const benefitsBreakdown = computed(() =>
    otherBenefits.value.map((id) => ({
      id,
      label: BENEFIT_LABELS[id] || id,
      amount: BENEFIT_PRICE,
    })),
  )

  // Subtotal-for-display omits medical expenses because that line is
  // surfaced separately in the breakdown (matches Step 9's existing UI).
  const subtotalForDisplay = computed(() =>
    BASE_SUBTOTAL + excessAdjustment.value,
  )

  const subtotalWithAdjustments = computed(() =>
    BASE_SUBTOTAL
    + excessAdjustment.value
    + medicalExpenses.value
    + driverImpact.value
    + adpImpact.value
    + otherBenefitsImpact.value,
  )

  const gstAmount = computed(() => subtotalWithAdjustments.value * GST_RATE)

  const annualTotal = computed(() => {
    const t = subtotalWithAdjustments.value + gstAmount.value
    return paymentTerm.value === 'single' ? t * (1 - SINGLE_DISCOUNT_RATE) : t
  })

  const instalmentValue = computed(() => annualTotal.value / 12)

  const displayAmount = computed(() =>
    paymentTerm.value === 'instalment' ? instalmentValue.value : annualTotal.value,
  )

  const displayUnit = computed(() =>
    paymentTerm.value === 'instalment' ? '/ month' : 'Total',
  )

  const isSingle = computed(() => paymentTerm.value === 'single')

  return {
    BASE_SUBTOTAL,
    GST_RATE,
    SINGLE_DISCOUNT_RATE,
    PER_DRIVER,
    AUTHORISED_DRIVER_PLAN_COST,
    BENEFIT_PRICE,
    paymentTerm,
    excess,
    excessAdjustment,
    hasPersonalAccident,
    medicalExpenses,
    driverCount,
    driverImpact,
    hasADP,
    adpImpact,
    otherBenefits,
    otherBenefitsCount,
    otherBenefitsImpact,
    benefitsBreakdown,
    appliedPromo,
    subtotalForDisplay,
    subtotalWithAdjustments,
    gstAmount,
    annualTotal,
    instalmentValue,
    displayAmount,
    displayUnit,
    isSingle,
  }
}
