import { describe, expect, test } from 'bun:test'
import { parseMoney, fmtMoney, normDate, longDate, splitAddr, esc } from '@/lib/offers/format'
import {
  baseWageCalc,
  baseWageWYR,
  guaranteeCalc,
  cpPct,
  accelBpsStr,
  defaultExempt,
  isCommissionedRec,
} from '@/lib/offers/calc'
import { FIELDS, DATA_FIELDS, HEADERS, missingRequired } from '@/lib/offers/schema'

describe('format', () => {
  test('parseMoney', () => {
    expect(parseMoney('$4,333')).toBe(4333)
    expect(parseMoney('')).toBeNull()
    expect(parseMoney('abc')).toBeNull()
  })
  test('fmtMoney rounds and formats', () => expect(fmtMoney(41600)).toBe('$41,600'))
  test('normDate', () => {
    expect(normDate('7/24/26')).toBe('2026-07-24')
    expect(normDate('2026-7-4')).toBe('2026-07-04')
    expect(normDate('July 4')).toBe('July 4')
  })
  test('longDate', () => expect(longDate('2026-09-03')).toBe('September 3, 2026'))
  test('splitAddr comma fallback', () =>
    expect(splitAddr('1313 Disneyland Dr, Anaheim, CA 92802')).toEqual([
      '1313 Disneyland Dr',
      'Anaheim, CA 92802',
    ]))
  test('esc', () => expect(esc('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;'))
})

describe('calc', () => {
  test('hourly basis defaults 40h and annualizes', () => {
    const c = baseWageCalc({
      baseHourly: '$20',
      baseHoursWeek: '',
      baseMonthly: '',
      baseAnnual: '',
    })
    expect(c?.basis).toBe('hourly')
    expect(c?.annual).toBe(41600)
    expect(
      baseWageWYR({ baseHourly: '$20', baseHoursWeek: '', baseMonthly: '', baseAnnual: '' }),
    ).toBe('$20.00 per hour')
  })
  test('guaranteeCalc', () => {
    const g = guaranteeCalc({ bonusGuaranteeAmount: '$10,000', bonusGuaranteeMonths: '3' })
    expect(g).toEqual({
      perPeriod: 5000,
      periods: 6,
      weeks: 12,
      total: 30000,
      perS: '$5,000',
      totalS: '$30,000',
    })
  })
  test('cpPct converts bps', () => {
    expect(cpPct('125')).toBe('1.25 %')
    expect(cpPct('')).toBe('N/A')
    expect(cpPct('n/a')).toBe('N/A')
  })
  test('accelBpsStr', () => expect(accelBpsStr('250')).toBe('250 bps (2.50%)'))
  test('defaultExempt', () => {
    expect(defaultExempt({ employmentType: 'Full Time - Operations' })).toBe('non-exempt')
    expect(defaultExempt({ employmentType: 'Commissioned Sales' })).toBe('exempt')
  })
  test('isCommissionedRec by title', () =>
    expect(isCommissionedRec({ employmentType: '', position: 'Loan Officer' })).toBe(true))
})

describe('schema', () => {
  test('68 field entries (42 numbered questions), headers match cols', () => {
    expect(FIELDS.length).toBe(68)
    expect(DATA_FIELDS.length).toBe(66) // all but the two composite pseudo-fields (baseWage, bonusStructure)
    expect(HEADERS).toEqual(DATA_FIELDS.map((f) => f.col))
  })
  test('missingRequired counts empty required fields', () => {
    expect(missingRequired({}).length).toBe(14)
  })
})
