// Singapore NRIC / FIN checksum validator.
// Reference: ICA NRIC algorithm — S/T (citizens/PRs), F/G (foreigners), M (FIN after Jan 2022).
export function validateNric(nric) {
  if (!nric || typeof nric !== 'string') return false
  const v = nric.trim().toUpperCase()
  if (!/^[STFGM]\d{7}[A-Z]$/.test(v)) return false

  const prefix = v[0]
  const digits = v.slice(1, 8).split('').map(Number)
  const weights = [2, 7, 6, 5, 4, 3, 2]
  let sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0)
  if (prefix === 'T' || prefix === 'G') sum += 4
  if (prefix === 'M') sum += 3

  const stChars = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
  const fgChars = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K']
  const mChars  = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X']

  // S/T/F/G use the modulo result directly. M-series (FIN from Jan 2022)
  // flips the index: idx = 10 - (sum % 11). Confirmed against valid sample
  // M4215664N (sum=103, +3 offset=106, 106 % 11 = 7, 10 - 7 = 3, mChars[3] = 'N').
  let expected
  if (prefix === 'S' || prefix === 'T') {
    expected = stChars[sum % 11]
  } else if (prefix === 'F' || prefix === 'G') {
    expected = fgChars[sum % 11]
  } else {
    expected = mChars[10 - (sum % 11)]
  }

  return v[8] === expected
}

// Prototype-only postal-code stub. Real impl calls OneMap / Google Places.
// When the user types a 6-digit postcode we autofill block + street + building
// name (where known); unit is always manual.
const postcodeStubs = {
  '049317': { street: 'Bayfront Avenue', block: '10', buildingName: '' },
  '238858': { street: 'Orchard Turn', block: '2', buildingName: 'ION Orchard' },
  '460999': { street: 'Bedok North Road', block: '419', buildingName: '' },
  '018989': { street: 'Marina View', block: '1', buildingName: 'Asia Square Tower 2' },
  '098632': { street: 'HarbourFront Walk', block: '1', buildingName: 'VivoCity' },
  '188101': { street: 'Bras Basah Road', block: '8', buildingName: 'Bras Basah Complex' },
  '569830': { street: 'Ang Mo Kio Avenue 8', block: '53', buildingName: '' },
  '078878': { street: 'Gopeng Street', block: '10', buildingName: 'Icon Residence' },
}

export function lookupPostal(code) {
  if (!/^\d{6}$/.test(code)) return null
  if (postcodeStubs[code]) return postcodeStubs[code]
  // Anything that's a valid 6-digit code but not in the stub: fall back to a
  // placeholder that mimics what an API would return.
  return { street: 'Sample Street', block: '—', buildingName: '' }
}
