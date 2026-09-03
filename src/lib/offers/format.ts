// Pure formatting/parsing helpers — ported verbatim from the source app.
// S2: 388, 486–491, 513, 595, 637–638, 688, 768–776, 816.  S3: 77–85, 468–470.

import type { OfferData } from '@/lib/offers/types'

// S2 388
export function esc(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// S2 486
export function parseMoney(s: string | null | undefined): number | null {
  if (s == null) return null
  const n = String(s).replace(/[^0-9.\-]/g, '')
  if (n === '' || isNaN(Number(n))) return null
  return Number(n)
}

// S2 487
export function fmtMoney(n: number): string {
  return (
    '$' +
    Number(Math.round(n)).toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
  )
}

// S2 513
export function usd(n: number, dec: number): string {
  return (
    '$' +
    Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  )
}

// S2 490
export function fmtDollarStr(s: string): string {
  const n = parseMoney(s)
  return n != null ? fmtMoney(n) : s || ''
}

// S3 83
export function moneyStr(s: string): string {
  const n = parseMoney(s)
  return n != null ? fmtMoney(n) : (s || '').trim()
}

// S3 82
export function nl2br(s: string): string {
  return String(s).replace(/\n/g, '<br>')
}

// S3 77
export function todayISO(): string {
  const t = new Date()
  return (
    t.getFullYear() +
    '-' +
    String(t.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(t.getDate()).padStart(2, '0')
  )
}

// S3 78
export function longDate(iso: string): string {
  const M = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  if (!iso) return ''
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? M[+m[2] - 1] + ' ' + +m[3] + ', ' + m[1] : iso
}

// S3 468
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// S3 469
export function fmtShort(iso: string): string {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? MON[+m[2] - 1] + ' ' + +m[3] + ', ' + m[1] : '—'
}

// S3 470
export function fmtMonthKey(k: string): string {
  if (!k) return 'No date'
  const p = k.split('-')
  return MON[+p[1] - 1] + ' ' + p[0]
}

// S2 638
export function fmtDate(iso: string): string {
  try {
    const dt = new Date(iso)
    return dt.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// S2 768–776 — accept mm/dd/yyyy, yyyy-mm-dd, excel serial-ish strings
export function normDate(v: string): string {
  v = v.trim()
  let m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const mm = m[1]
    const dd = m[2]
    let yy = m[3]
    if (yy.length === 2) yy = '20' + yy
    return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
  }
  m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`
  return v
}

// S2 816
export function dstamp(): string {
  const d = new Date()
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  )
}

// S3 79
export function splitAddr(s: string): string[] {
  s = (s || '').trim()
  if (!s) return []
  if (s.indexOf('\n') >= 0)
    return s
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
  const i = s.indexOf(',')
  return i >= 0 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : [s]
}

// S3 80
export function firstNameOf(d: OfferData): string {
  const p = (d.preferredName || '').trim() || (d.employeeName || '').trim()
  return p.split(/\s+/)[0] || '[First]'
}

// S3 81
export function article(t: string): string {
  return /^[aeiou]/i.test((t || '').trim()) ? 'an' : 'a'
}

// S3 84
export function pnlWhenPhrase(m: string): string {
  m = (m || '').trim()
  if (!m) return ''
  return /^(in|on|at|as|by|during|your|the|after|before|once|when|upon|immediately|effective|beginning|starting|contingent|subject|following|per)\b/i.test(
    m,
  )
    ? ' ' + m
    : ' in ' + m
}

// S2 595
export function cssEsc(s: string): string {
  return String(s).replace(/["\\]/g, '\\$&')
}

// S2 688
export function normHeader(h: unknown): string {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

// S3 348 / 388 / 397 — the repeated filename-slug idiom, extracted once.
export function safeFileBase(name: string, fallback: string): string {
  return name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || fallback
}
