// The localStorage seam. Every function is a no-op returning an empty default on
// the server, so any module may import this file during SSR/build.
// S2 102–121 (records), S3 509–510 (email pref), S3 763–765 + 771 (intake sync).

import type { EmailClientPref, IntakeSubmission, OfferRecord } from '@/lib/offers/types'

// S2 102–103
export const LS_KEY = 'onhr_records_v121'
export const LS_DRAFT = 'onhr_draft_v121'
// S3 509
export const LS_EMAIL_CLIENT = 'onhr_email_client'
// S3 763
export const IMPORTED_KEY = 'onhr_imported_sids'
// S3 771
export const INBOX_KEY = 'onhr_inbox'

const isBrowser = (): boolean => typeof window !== 'undefined'

// S2 110–116
export function loadRecords(): OfferRecord[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as OfferRecord[]
    const seed = (window as unknown as { __SEED_RECORDS__?: unknown }).__SEED_RECORDS__
    if (Array.isArray(seed) && seed.length) {
      const recs = (seed as OfferRecord[]).slice()
      persistRecords(recs)
      return recs
    }
    return []
  } catch {
    return []
  }
}

// S2 117–120 (persistLocal). Throws nothing — the caller toasts on `false`.
export function persistRecords(records: OfferRecord[]): boolean {
  if (!isBrowser()) return false
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records))
    return true
  } catch {
    return false
  }
}

// S3 509
export function getEmailPref(): EmailClientPref {
  if (!isBrowser()) return 'desktop'
  try {
    return localStorage.getItem(LS_EMAIL_CLIENT) === 'web' ? 'web' : 'desktop'
  } catch {
    return 'desktop'
  }
}

// S3 510
export function setEmailPref(v: EmailClientPref): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(LS_EMAIL_CLIENT, v === 'web' ? 'web' : 'desktop')
  } catch {
    /* quota / private mode — ignore, as the source does */
  }
}

// S3 764
export function importedSids(): string[] {
  if (!isBrowser()) return []
  try {
    return JSON.parse(localStorage.getItem(IMPORTED_KEY) || '[]') as string[]
  } catch {
    return []
  }
}

// S3 765
export function markImported(sid: string | undefined): void {
  if (!isBrowser()) return
  if (!sid) return
  try {
    let a = importedSids()
    if (a.indexOf(sid) < 0) {
      a.push(sid)
      if (a.length > 800) a = a.slice(-800)
      localStorage.setItem(IMPORTED_KEY, JSON.stringify(a))
    }
  } catch {
    /* ignore */
  }
}

/**
 * S3 771 (pollInbox) — drains the same-browser intake inbox.
 * Reads `onhr_inbox`, clears it, and returns the submissions that carry data.
 */
export function readAndClearInbox(): IntakeSubmission[] {
  if (!isBrowser()) return []
  try {
    const inbox = JSON.parse(localStorage.getItem(INBOX_KEY) || '[]') as IntakeSubmission[]
    if (!Array.isArray(inbox) || !inbox.length) return []
    localStorage.setItem(INBOX_KEY, '[]')
    return inbox.filter((sub) => Boolean(sub && sub.data))
  } catch {
    return []
  }
}
