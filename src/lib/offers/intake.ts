// Intake sync — submission code/link encoding and record mapping.
// Ported from S3 760–770 (encRec / decRec / addSubmission / importCode).
// Import-safe on the server: no DOM, no localStorage at module scope.

import { DATA_FIELDS, missingRequired, nowIso, uid } from '@/lib/offers/schema'
import type { IntakeSubmission, OfferData, OfferRecord } from '@/lib/offers/types'

// btoa/atob operate on latin1; the unescape/encodeURIComponent pair is the
// source's UTF-8 bridge. Kept verbatim so codes stay wire-compatible.
function b64encodeUtf8(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function b64decodeUtf8(s: string): string {
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

// S3 761
export function encRec(obj: unknown): string {
  return b64encodeUtf8(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// S3 762
export function decRec(s: string): IntakeSubmission {
  let v = String(s).replace(/-/g, '+').replace(/_/g, '/')
  while (v.length % 4) v += '='
  return JSON.parse(b64decodeUtf8(v)) as IntakeSubmission
}

/**
 * S3 770 (importCode) — the parsing half, without the UI.
 * Accepts a raw code, an `AWM1-` prefixed code, or a link/hash containing `rec=…`.
 * Returns null for anything that isn't a decodable submission with a `data` object.
 */
export function parseIntakeCode(str: string): IntakeSubmission | null {
  const s = (str || '').trim()
  if (!s) return null
  const m = s.match(/rec=([A-Za-z0-9_\-]+)/)
  let code = m ? m[1] : s
  code = code.replace(/^AWM1-/, '')
  try {
    const sub = decRec(code)
    if (!sub || typeof sub !== 'object' || !sub.data || typeof sub.data !== 'object') return null
    return sub
  } catch {
    return null
  }
}

/**
 * S3 766–769 (addSubmission) — the mapping half, without the dedupe/persist.
 * Blanks every data field, then overlays the submission's values.
 */
export function submissionToRecord(sub: IntakeSubmission): OfferRecord {
  const d: OfferData = {}
  DATA_FIELDS.forEach((f) => {
    d[f.id] = ''
  })
  Object.assign(d, sub.data)
  return {
    id: uid(),
    data: d,
    status: missingRequired(d).length ? 'draft' : 'complete',
    created: sub.submitted || nowIso(),
    updated: nowIso(),
    stage: 'pipeline',
  }
}
