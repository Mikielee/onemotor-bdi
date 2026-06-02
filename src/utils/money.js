/**
 * Global money formatter.
 *
 * House rules (apply everywhere a dollar value is shown):
 *   - prefix is "$" (NOT "S$")
 *   - thousands separator (comma)
 *   - always two decimal places: $1,234.50, not $1,234.5 or $1,234
 *
 *   formatMoney(1234.5)  // "$1,234.50"
 *   formatMoney(0)       // "$0.00"
 *
 * For signed deltas (e.g. excess "+$120.00" / "-$45.00"):
 *
 *   formatMoneySigned(120)   // "+$120.00"
 *   formatMoneySigned(-45)   // "-$45.00"
 *   formatMoneySigned(0)     // "$0.00"
 */
const fmt = new Intl.NumberFormat('en-SG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(n) {
  const value = Number(n) || 0
  return `$${fmt.format(Math.abs(value))}`
}

export function formatMoneySigned(n) {
  const value = Number(n) || 0
  if (value === 0) return formatMoney(0)
  const sign = value > 0 ? '+' : '-'
  return `${sign}${formatMoney(value)}`
}
