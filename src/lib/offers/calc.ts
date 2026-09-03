// Compensation math and the default offer-letter wording it produces.
// S2 513–527 (base wage), S3 87–122 (letter defaults), S3 186 (cpPct).
// The DOM-reading wrappers (computeGuarantee/computeProduction/computeBaseWage)
// stay in the form component — only the pure math lives here.

import type { OfferData } from '@/lib/offers/types'
import { esc, fmtMoney, moneyStr, parseMoney, pnlWhenPhrase, usd } from '@/lib/offers/format'

interface BaseWageShape {
  hourly: number | null
  hours: number | null
  hoursGiven: number | null
  monthly: number
  annual: number
}

export type BaseWageCalc =
  | (BaseWageShape & { basis: 'hourly'; hourly: number; hours: number })
  | (BaseWageShape & { basis: 'monthly' | 'annual' })

/* Base wage: enter one basis, derive monthly + annual. hours/week defaults to 40 for hourly. */
// S2 514–524
export function baseWageCalc(d: OfferData): BaseWageCalc | null {
  const hourly = parseMoney(d.baseHourly),
    monthlyIn = parseMoney(d.baseMonthly),
    annualIn = parseMoney(d.baseAnnual)
  let hoursParsed: number | null = parseFloat(String(d.baseHoursWeek || '').replace(/[^0-9.]/g, ''))
  if (!(hoursParsed > 0)) hoursParsed = null
  const hours = hoursParsed
  if (hourly != null && hourly > 0) {
    const hoursUsed = hours || 40
    const annual = hourly * hoursUsed * 52
    const monthly = annual / 12
    return { basis: 'hourly', hourly, hours: hoursUsed, hoursGiven: hours, monthly, annual }
  } else if (monthlyIn != null && monthlyIn > 0) {
    const monthly = monthlyIn
    const annual = monthly * 12
    return { basis: 'monthly', hourly, hours, hoursGiven: hours, monthly, annual }
  } else if (annualIn != null && annualIn > 0) {
    const annual = annualIn
    const monthly = annual / 12
    return { basis: 'annual', hourly, hours, hoursGiven: hours, monthly, annual }
  }
  return null
}

// S2 525–531
export function baseWageWYR(d: OfferData): string {
  const c = baseWageCalc(d)
  // legacy free-text fallback
  if (!c) return d.baseWage && String(d.baseWage).trim() ? String(d.baseWage).trim() : ''
  if (c.basis === 'hourly') return usd(c.hourly, 2) + ' per hour' // show only what was entered
  if (c.basis === 'monthly') return usd(c.monthly, 2) + ' per month'
  return usd(Math.round(c.annual), 0) + ' annually'
}

export interface GuaranteeCalc {
  perPeriod: number
  periods: number
  weeks: number
  total: number
  perS: string
  totalS: string
}

// S3 108
export function guaranteeCalc(d: OfferData): GuaranteeCalc | null {
  const monthly = parseMoney(d.bonusGuaranteeAmount)
  const months = parseInt(d.bonusGuaranteeMonths || '', 10)
  if (monthly == null || !months || months < 1) return null
  return {
    perPeriod: monthly / 2,
    periods: months * 2,
    weeks: months * 4,
    total: monthly * months,
    perS: fmtMoney(monthly / 2),
    totalS: fmtMoney(monthly * months),
  }
}

// S3 87
export function isCommissionedRec(d: OfferData): boolean {
  const et = d.employmentType || '',
    pos = d.position || ''
  return /commission/i.test(et) || /loan officer|branch manager|area manager/i.test(pos)
}

// S3 88–95
export function defaultSignon(d: OfferData): string {
  const m1 = parseMoney(d.bonusSignOnAmount),
    m2 = parseMoney(d.bonusSignOnMonth2),
    m3 = parseMoney(d.bonusSignOnMonth3)
  const sched: [string, number][] = []
  if (m1 != null) sched.push(['Month 1', m1])
  if (m2 != null) sched.push(['Month 2', m2])
  if (m3 != null) sched.push(['Month 3', m3])
  if (!sched.length) return ''
  const soTotal = sched.reduce((s, x) => s + x[1], 0)
  return sched.length === 1
    ? fmtMoney(soTotal) +
        ', eligible after your license becomes active under All Western Mortgage to help with the transition.'
    : fmtMoney(soTotal) +
        ' total, paid as ' +
        sched.map((x) => x[0] + ': ' + fmtMoney(x[1])).join(', ') +
        ', eligible after your license becomes active under All Western Mortgage to help with the transition.'
}

// S3 96–107
export function defaultPnl(d: OfferData): string {
  const pairs: [string, string][] = [
    ['bonusPnlAmount', 'bonusPnlMonth'],
    ['bonusPnlAmount2', 'bonusPnlMonth2'],
    ['bonusPnlAmount3', 'bonusPnlMonth3'],
  ]
  const slots: { amt: string; amtN: number | null; month: string }[] = []
  pairs.forEach(function (p) {
    const a = (d[p[0]] || '').trim()
    if (a) slots.push({ amt: a, amtN: parseMoney(a), month: (d[p[1]] || '').trim() })
  })
  if (!slots.length) return ''
  const lic = isCommissionedRec(d)
    ? ', eligible 30 days after your license becomes active under All Western Mortgage to help with the transition'
    : ''
  if (slots.length === 1)
    return (
      moneyStr(slots[0].amt) +
      ' will be credited to P&L' +
      pnlWhenPhrase(slots[0].month) +
      lic +
      '.'
    )
  const allNum = slots.every(function (x) {
    return x.amtN != null
  })
  const total = slots.reduce(function (s, x) {
    return s + (x.amtN != null ? x.amtN : 0)
  }, 0)
  const parts = slots.map(function (x) {
    return moneyStr(x.amt) + pnlWhenPhrase(x.month)
  })
  const lead = allNum ? fmtMoney(total) + ' total, credited to P&L as: ' : 'Credited to P&L as: '
  return lead + parts.join('; ') + lic + '.'
}

// S3 109
export function defaultGuarantee(d: OfferData): string {
  const c = guaranteeCalc(d)
  if (!c) return ''
  const lic = isCommissionedRec(d)
    ? ' after your license becomes active under All Western Mortgage to help with the transition.'
    : '.'
  return (
    c.totalS +
    ' total – paid as ' +
    c.perS +
    ' every two weeks for the first ' +
    c.periods +
    ' bi-weekly pay periods (~ ' +
    c.weeks +
    ' weeks)' +
    lic
  )
}

// S3 110
export function defaultPerfile(d: OfferData): string {
  const dol = (d.bonusPerFileDollar || '').trim(),
    bps = (d.bonusPerFileBps || '').trim()
  if (dol) return moneyStr(dol) + ' per closed/funded file assigned to you'
  if (bps)
    return (
      'You will receive ' +
      bps +
      ' bps on the overall production generated by the branch for assigned files that are closed/funded.'
    )
  return ''
}

// S3 111
export function defaultProduction(d: OfferData): string {
  const amt = (d.bonusProductionAmount || '').trim(),
    vol = (d.bonusProductionVolume || '').trim(),
    mo = (d.bonusProductionMaxMonths || '').trim()
  if (!amt) return ''
  return (
    moneyStr(amt) +
    ' production bonus' +
    (vol ? ' upon reaching ' + moneyStr(vol) + ' in funded production' : '') +
    (mo ? ' within the first ' + mo + ' months of onboarding' : '') +
    '.'
  )
}

// S3 112
export function defaultOverride(d: OfferData): string {
  const bps = (d.bonusOverrideBps || '').trim()
  return bps ? bps + ' bps override on managed production' : ''
}

// S3 113
export function accelBpsStr(v: string | null | undefined): string {
  v = (v || '').trim()
  if (!v) return ''
  const n = Number(v.replace(/[^0-9.\-]/g, ''))
  if (isNaN(n)) return v
  return n + ' bps (' + (n / 100).toFixed(2) + '%)'
}

// S3 114–121
export function defaultAccel(d: OfferData): string {
  const pairs: [string, string][] = [
    ['bonusAccelBps1', 'Month 1'],
    ['bonusAccelBps2', 'Month 2'],
    ['bonusAccelBps3', 'Month 3'],
  ]
  const parts: string[] = []
  pairs.forEach(function (p) {
    const s = accelBpsStr(d[p[0]])
    if (s) parts.push(p[1] + ': ' + s)
  })
  if (!parts.length) return ''
  return 'Accelerated commission during your ramp-up period — ' + parts.join('; ') + '.'
}

// Full Time / Part Time Operations default to non-exempt; other roles default to exempt.
// Manually overridable via the Exempt status toggle in the letter options.
// S3 122
export function defaultExempt(d: OfferData): 'exempt' | 'non-exempt' {
  return /operation/i.test((d && d.employmentType) || '') ? 'non-exempt' : 'exempt'
}

// S3 186 — bps -> percent
export function cpPct(v: string | null | undefined): string {
  v = (v == null ? '' : String(v)).trim()
  if (v === '' || /^n\/?a$/i.test(v)) return 'N/A'
  const n = Number(v.replace(/[^0-9.\-]/g, ''))
  if (isNaN(n)) return esc(v)
  return (n / 100).toFixed(2) + ' %'
}
