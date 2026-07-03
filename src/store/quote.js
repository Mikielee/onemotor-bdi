import { reactive, readonly, watch } from 'vue'

// --- sessionStorage persistence (prototype-only) ---
// A mid-journey browser refresh used to wipe the in-memory store, which made
// every prefill look broken during demos. The quote now survives refresh in
// THIS tab; opening a new tab still starts a clean journey. Bump the key
// when the schema changes.
const STORAGE_KEY = 'bdi-quote-v1'

function reviveDates(node) {
  if (Array.isArray(node)) { node.forEach(reviveDates); return node }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (typeof v === 'string' && (k === 'dob' || k.endsWith('Date'))) {
        const d = new Date(v)
        if (!Number.isNaN(d.getTime())) node[k] = d
      } else {
        reviveDates(v)
      }
    }
  }
  return node
}

// Permissive merge: recurse into matching plain objects, otherwise take the
// saved value (including keys the initial shape doesn't declare, since some
// steps add fields dynamically — e.g. payment, policyholder extras).
function mergeSaved(target, saved) {
  for (const k of Object.keys(saved)) {
    const sv = saved[k]
    const tv = target[k]
    if (
      sv && typeof sv === 'object' && !Array.isArray(sv) && !(sv instanceof Date)
      && tv && typeof tv === 'object' && !Array.isArray(tv) && !(tv instanceof Date)
    ) {
      mergeSaved(tv, sv)
    } else {
      target[k] = sv
    }
  }
}

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

// Hydrate from this tab's snapshot, then keep the snapshot current.
try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  if (saved) mergeSaved(state, reviveDates(saved))
} catch { /* corrupted snapshot: start clean */ }

watch(state, (s) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* quota/private mode: skip */ }
}, { deep: true })

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
