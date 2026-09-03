// Spreadsheet import/export, the import template, and backup/restore.
// S2 688–699 (header map), 700–767 (import), 779–817 (export), 820–866 (template),
// 867–878 (backup/restore).
//
// `xlsx` is loaded with a dynamic import inside each function so this module is
// import-safe on the server and stays out of the initial client bundle.

import {
  DATA_FIELDS,
  DOLLAR_FIELD_IDS,
  EXAMPLE,
  FIELD_BY_ID,
  HEADERS,
  META_COLS,
  missingRequired,
  nowIso,
  uid,
} from '@/lib/offers/schema'
import {
  dstamp,
  fmtDate,
  fmtDollarStr,
  normDate,
  normHeader,
  safeFileBase,
} from '@/lib/offers/format'
import type { BackupFile, FieldDef, ImportResult, OfferData, OfferRecord } from '@/lib/offers/types'

/* ===================== HEADER MAP (S2 689–699) ===================== */

const HEADER_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  DATA_FIELDS.forEach((f) => {
    m[normHeader(f.col)] = f.id
    m[normHeader(f.label)] = f.id
    m[normHeader(f.id)] = f.id
    m[normHeader(f.q + '. ' + f.label)] = f.id
    m[normHeader('q' + f.q)] = f.id
  })
  return m
})()

/* ===================== IMPORT (S2 700–767) ===================== */

// S2 730 — index existing records by Employee Name + Email.
function importKey(data: OfferData | undefined): string {
  const n = normHeader((data && data.employeeName) || '')
  const e = normHeader((data && data.email) || '')
  return n ? n + '|' + e : ''
}

/**
 * Pure port of S2 `importWorkbook`. Returns a NEW records array; neither the
 * input array nor any record inside it is mutated (updated records are cloned).
 * The source's `toast(..., true)` early-returns become thrown Errors carrying the
 * same message, so the caller can surface them unchanged.
 */
export async function applyImport(
  records: OfferRecord[],
  fileData: ArrayBuffer,
): Promise<ImportResult> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(fileData, { type: 'array' })

  // prefer a sheet named "New Hires", else first non-instructions sheet
  let sheetName = wb.SheetNames.find((n) => /new\s*hire|requests|data/i.test(n))
  if (!sheetName)
    sheetName =
      wb.SheetNames.find((n) => !/instruction|readme|guide|values/i.test(n)) || wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]

  // Read as rows-of-cells so a legend/title band above the headers is tolerated.
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: false })

  // Locate the real header row: first row with 2+ cells matching known headers.
  let hdrRow = -1
  for (let i = 0; i < aoa.length; i++) {
    const hits = (aoa[i] || []).filter(
      (c) => HEADER_MAP[normHeader(String(c == null ? '' : c))],
    ).length
    if (hits >= 2) {
      hdrRow = i
      break
    }
  }
  if (hdrRow < 0)
    throw new Error("Couldn't find the header row. Use the provided template headers.")

  const headers = (aoa[hdrRow] || []).map((h) => String(h == null ? '' : h))
  const rows: Record<string, unknown>[] = aoa
    .slice(hdrRow + 1)
    .filter((r) => (r || []).some((c) => String(c == null ? '' : c).trim() !== ''))
    .map((r) => {
      const o: Record<string, unknown> = {}
      headers.forEach((h, ci) => {
        if (h) o[h] = r[ci] == null ? '' : r[ci]
      })
      return o
    })
  if (!rows.length) throw new Error('No data rows found in the spreadsheet.')

  // build column->fieldid map from actual headers
  const sample = rows[0]
  const colMap: Record<string, string> = {}
  let matched = 0
  Object.keys(sample).forEach((col) => {
    const fid = HEADER_MAP[normHeader(col)]
    if (fid) {
      colMap[col] = fid
      matched++
    }
  })
  if (matched === 0)
    throw new Error("Couldn't match any columns. Use the provided template headers.")

  let added = 0
  let updated = 0
  const matchedFids = new Set(Object.values(colMap))

  const out = records.slice()
  // Records we have cloned and may therefore mutate freely.
  const owned = new Set<OfferRecord>()
  const existingByKey = new Map<string, OfferRecord>()
  out.forEach((r) => {
    const k = importKey(r.data)
    if (k && !existingByKey.has(k)) existingByKey.set(k, r)
  })

  rows.forEach((row) => {
    const d: OfferData = {}
    DATA_FIELDS.forEach((f) => {
      d[f.id] = ''
    })
    let any = false
    Object.keys(row).forEach((col) => {
      const fid = colMap[col]
      if (!fid) return
      let v = row[col]
      if (v == null) v = ''
      let s = String(v).trim()
      // normalize dates coming from excel
      const f = FIELD_BY_ID[fid]
      if (f.type === 'date' && s) s = normDate(s)
      else if (DOLLAR_FIELD_IDS.includes(fid) && s) s = fmtDollarStr(s)
      d[fid] = s
      if (s) any = true
    })
    if (!any) return

    const key = importKey(d)
    const found = key ? existingByKey.get(key) : undefined
    if (found) {
      // update in place: overwrite only the columns present in this sheet;
      // keep stage, letter edits, hidden fields
      let hit = found
      if (!owned.has(hit)) {
        const clone: OfferRecord = { ...hit, data: { ...hit.data } }
        const idx = out.indexOf(hit)
        if (idx >= 0) out[idx] = clone
        owned.add(clone)
        if (key) existingByKey.set(key, clone)
        hit = clone
      }
      matchedFids.forEach((fid) => {
        hit.data[fid] = d[fid]
      })
      hit.status = missingRequired(hit.data).length ? 'draft' : 'complete'
      hit.updated = nowIso()
      updated++
    } else {
      const rec: OfferRecord = {
        id: uid(),
        data: d,
        status: missingRequired(d).length ? 'draft' : 'complete',
        created: nowIso(),
        updated: nowIso(),
      }
      out.unshift(rec)
      owned.add(rec)
      // duplicate rows within one import update, not double-add
      if (key) existingByKey.set(key, rec)
      added++
    }
  })

  return { records: out, added, updated, sheetName }
}

/* ===================== EXPORT (S2 780–818) ===================== */

// S2 779–790
function recordsToAoa(includeMeta: boolean, recs: OfferRecord[]): (string | undefined)[][] {
  const head: string[] = [...HEADERS]
  if (includeMeta) head.push(...META_COLS)
  const aoa: (string | undefined)[][] = [head]
  recs.forEach((r) => {
    const row: (string | undefined)[] = DATA_FIELDS.map((f) => r.data[f.id] || '')
    if (includeMeta) row.push(r.id, r.status, fmtDate(r.updated))
    aoa.push(row)
  })
  return aoa
}

// S2 817
export function downloadBlob(blob: Blob, name: string): void {
  if (typeof document === 'undefined') return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

// S2 800–808
export async function exportXlsxAll(records: OfferRecord[]): Promise<void> {
  if (!records.length) return
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(recordsToAoa(true, records))
  ws['!cols'] = HEADERS.map((h) => ({ wch: Math.min(Math.max(h.length + 2, 12), 34) })).concat(
    META_COLS.map(() => ({ wch: 16 })),
  )
  XLSX.utils.book_append_sheet(wb, ws, 'New Hires')
  XLSX.writeFile(wb, 'new_hire_requests_' + dstamp() + '.xlsx')
}

// S2 809–815
export async function exportCsvAll(records: OfferRecord[]): Promise<void> {
  if (!records.length) return
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet(recordsToAoa(true, records))
  const csv = XLSX.utils.sheet_to_csv(ws)
  downloadBlob(new Blob([csv], { type: 'text/csv' }), 'new_hire_requests_' + dstamp() + '.csv')
}

// S2 791–799 — export ONLY the checked pipeline rows to CSV.
export async function exportSelectedCsv(
  records: OfferRecord[],
  ids: string[],
): Promise<{ count: number }> {
  if (!ids || !ids.length) return { count: 0 }
  const recs = ids
    .map((id) => records.find((r) => r.id === id))
    .filter((r): r is OfferRecord => Boolean(r))
  if (!recs.length) return { count: 0 }
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet(recordsToAoa(true, recs))
  const csv = XLSX.utils.sheet_to_csv(ws)
  downloadBlob(
    new Blob([csv], { type: 'text/csv' }),
    'new_hire_requests_selected_' + dstamp() + '.csv',
  )
  return { count: recs.length }
}

// S3 495–507
export async function exportOneXlsx(rec: OfferRecord): Promise<void> {
  const XLSX = await import('xlsx')
  const head = [...HEADERS]
  const row = DATA_FIELDS.map((f) => (rec.data && rec.data[f.id]) || '')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([head, row])
  XLSX.utils.book_append_sheet(wb, ws, 'New Hire')
  const base = safeFileBase((rec.data && rec.data.employeeName) || 'New Hire', 'record')
  XLSX.writeFile(wb, base + '.xlsx')
}

/* ===================== TEMPLATE (S2 819–866) ===================== */

// S2 852
function typeLabel(f: FieldDef): string {
  return f.type === 'textarea'
    ? 'Text'
    : f.type === 'radio' || f.type === 'radio_other'
      ? 'Choice'
      : f.type.charAt(0).toUpperCase() + f.type.slice(1)
}

// S2 820–851
async function buildTemplateWb() {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const TF = DATA_FIELDS.filter((f) => !f.tmplHide) // columns shown in the template

  // Sheet 1: New Hires (headers + one example row)
  const example = TF.map((f) => (EXAMPLE[f.id] !== undefined ? EXAMPLE[f.id] : ''))
  const ws = XLSX.utils.aoa_to_sheet([TF.map((f) => f.col), example])
  ws['!cols'] = TF.map((f) => ({ wch: Math.min(Math.max(f.col.length + 2, 12), 34) }))
  XLSX.utils.book_append_sheet(wb, ws, 'New Hires')

  // Sheet 2: Instructions
  const instr: string[][] = [
    ['Offer & New Hire Request — Import Template'],
    [''],
    ['How to use:'],
    ["1. Enter one new hire per row on the 'New Hires' tab, under the matching column headers."],
    ['2. Do not rename or reorder the header row — the app matches columns by these names.'],
    ['3. Leave a cell blank if not applicable (unless the field is Required).'],
    ["4. In the app, click 'Import Spreadsheet' and choose this file."],
    [''],
    ['Column', 'Required', 'Type', 'Allowed values / format / notes'],
  ]
  TF.forEach((f) => {
    let allowed = 'Free text'
    if (f.type === 'date') allowed = 'Date (MM/DD/YYYY or YYYY-MM-DD)'
    else if (f.type === 'email') allowed = 'Email address'
    else if (f.type === 'tel') allowed = 'Phone number'
    else if (f.type === 'radio') allowed = 'One of: ' + (f.options || []).join(' | ')
    else if (f.type === 'radio_other')
      allowed = 'One of: ' + (f.options || []).join(' | ') + ' | (or your own text)'
    if (f.help) allowed += (allowed ? '  —  ' : '') + f.help
    instr.push([f.col, f.req ? 'Yes' : '', typeLabel(f), allowed])
  })
  const wsi = XLSX.utils.aoa_to_sheet(instr)
  wsi['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 14 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, wsi, 'Instructions')
  return wb
}

// S2 861–864
export async function downloadTemplate(): Promise<void> {
  const XLSX = await import('xlsx')
  XLSX.writeFile(await buildTemplateWb(), 'new_hire_import_template.xlsx')
}

/* ===================== BACKUP / RESTORE (S2 867–878) ===================== */

// S2 867–871
export function buildBackupBlob(records: OfferRecord[]): Blob {
  const payload: BackupFile = {
    app: 'onhr',
    version: '1.21',
    exported: nowIso(),
    records,
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}

export const BACKUP_FILENAME = (): string => 'new_hire_backup_' + dstamp() + '.json'

// S2 872–873 — `restore` guards on `obj && Array.isArray(obj.records)`.
export function parseBackup(text: string): BackupFile | null {
  try {
    const obj: unknown = JSON.parse(text)
    if (!obj || typeof obj !== 'object') return null
    const rec = obj as Partial<BackupFile>
    if (!Array.isArray(rec.records)) return null
    return {
      app: 'onhr',
      version: rec.version || '',
      exported: rec.exported || '',
      records: rec.records,
    }
  } catch {
    return null
  }
}

/**
 * S2 875 — the per-record half of `restore`: each backup entry becomes a fresh
 * record with a new id, keeping status/created/updated when present.
 */
export function backupRecordsToRecords(backup: BackupFile): OfferRecord[] {
  const out: OfferRecord[] = []
  backup.records.forEach((r) => {
    if (r && r.data) {
      out.push({
        id: uid(),
        data: r.data,
        status: r.status || (missingRequired(r.data).length ? 'draft' : 'complete'),
        created: r.created || nowIso(),
        updated: r.updated || nowIso(),
      })
    }
  })
  return out
}
