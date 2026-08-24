const UNITS = [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]

export function compactNumber(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new TypeError(`compactNumber: expected a finite number, received ${typeof n}`)
  }
  if (n < 0) throw new RangeError(`compactNumber: expected a non-negative number, received ${n}`)
  if (n < 1000) return String(n)
  for (const [size, suffix] of UNITS) {
    if (n < size) continue
    const scaled = n / size
    const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)
    // 999,999,999 scales to 999.999… in the M unit and rounds to "1000",
    // which belongs one unit up: "1B", not "1000M".
    if (Number(text) >= 1000) return compactNumber(size * 1000)
    return `${text.replace(/\.0$/, '')}${suffix}`
  }
}

export function utcDateStamp(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('utcDateStamp: expected a valid Date')
  }
  return date.toISOString().slice(0, 10)
}

export function utcMinuteStamp(iso) {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) throw new TypeError('utcMinuteStamp: could not parse timestamp')
  return `${parsed.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}
