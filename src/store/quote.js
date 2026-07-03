import { reactive, readonly } from 'vue'

const state = reactive({
  coverType: null,
  coverStartDate: null,
  coverEndDate: null,
  carYear: null,
  carMake: null,
  carModel: null,
  carUsage: null,
  annualDistance: null,
  mainDriver: {
    name: '',
    nric: '',
    dob: null,
    gender: '',
    maritalStatus: '',
    isPolicyholder: null,
  },
  drivingHistory: {
    yearsLicensed: null,
    atFaultClaims: null,
    notAtFaultClaims: null,
    certificateOfMerit: null,
    ncd: null,
    // NCD follow-ups (OMP-93, Figma 4708-3143)
    ncdZeroReason: null,      // when ncd === 0
    otherCarNcd: null,        // when ncdZeroReason === 'ncd-other-car'
    transferredFrom: null,    // when ncdZeroReason === 'ncd-other-car'
    fiftyYears: null,         // when ncd === 50
    claims: null,
    convictions: null,
  },
  contact: {
    preferredName: '',
    email: '',
    phone: '',
    postalCode: '',
    marketingChannels: [],
    consentPdpa: false,
  },
  quoteSelection: {
    // Single = pay whole cover term up front, gets 3% discount.
    // Instalment = pay monthly, no discount. Renamed from 'annual'/'monthly'
    // because cover term flexes 7–18 months (KB-f1898394, Sprint Review 12 Jun 2026).
    paymentTerm: 'single',
    excess: 600,
    promoCode: '',
  },
  hasAdditionalDrivers: null,
  hasOutsideDrivers: null,
  additionalDrivers: [],
  // Authorised Driver Plan is added when hasOutsideDrivers === true.
  // Adds +$200 to the premium and triggers the warning callout on Step 10.
  authorisedDriverPlan: false,
  driveLess: null,
  optionalBenefits: [],
  policyholder: {
    nric: '',
    fullName: '',
    address: {
      postalCode: '',
      block: '',
      street: '',
      unit: '',
      buildingName: '',
    },
    carDetails: {
      registrationNumber: '',
      currentInsurer: '',
      accidentClaimDate: '',   // MM/YYYY
      ownership: '',           // 'private' | 'company' — odometer is DA-only per KB-7
    },
  },
})

function setField(path, value) {
  const keys = path.split('.')
  let cursor = state
  while (keys.length > 1) {
    cursor = cursor[keys.shift()]
  }
  cursor[keys[0]] = value
}

export function useQuote() {
  return {
    quote: readonly(state),
    mutable: state,
    setField,
  }
}
