// Export → import roundtrip: the workbook this app writes must be one it can read
// back, matching records by Employee Name + Email instead of duplicating them.
// Exercises recordsToAoa (S2 779–790) against applyImport (S2 700–767) with a real
// in-memory xlsx workbook — the header-matching path end to end, no browser needed.

import { describe, expect, test } from 'bun:test'

import { EXAMPLE, missingRequired, nowIso, uid } from '@/lib/offers/schema'
import { applyImport, recordsToAoa } from '@/lib/offers/spreadsheet'
import type { OfferRecord } from '@/lib/offers/types'

function exampleRecord(): OfferRecord {
  const data = { ...EXAMPLE }
  const now = nowIso()
  return {
    id: uid(),
    data,
    status: missingRequired(data).length ? 'draft' : 'complete',
    created: now,
    updated: now,
  }
}

/** The write half of exportXlsxAll (S2 800–808), into memory rather than a file. */
async function exportToBuffer(recs: OfferRecord[]): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(recordsToAoa(true, recs)), 'New Hires')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

describe('spreadsheet roundtrip', () => {
  test('exported workbook re-imports as one added record, then updates in place', async () => {
    const rec = exampleRecord()
    const buf = await exportToBuffer([rec])

    // First import into an empty list: one new record.
    const first = await applyImport([], buf)
    expect(first.added).toBe(1)
    expect(first.updated).toBe(0)
    expect(first.sheetName).toBe('New Hires')
    expect(first.records.length).toBe(1)

    const imported = first.records[0]
    expect(imported.data.employeeName).toBe(EXAMPLE.employeeName)
    expect(imported.data.email).toBe(EXAMPLE.email)
    expect(imported.data.branchName).toBe(EXAMPLE.branchName)
    expect(imported.data.position).toBe(EXAMPLE.position)
    expect(imported.data.branchPricing).toBe(EXAMPLE.branchPricing)
    // normalized on the way in (S2 745–748)
    expect(imported.data.startDate).toBe('2026-07-24')
    expect(imported.data.baseMonthly).toBe('$4,333')

    // Re-importing the SAME file matches on Employee Name + Email: no duplicate.
    const second = await applyImport(first.records, buf)
    expect(second.added).toBe(0)
    expect(second.updated).toBe(1)
    expect(second.records.length).toBe(1)
    expect(second.records[0].id).toBe(imported.id)
    // Idempotent: a second pass changes no field values.
    expect(second.records[0].data).toEqual(imported.data)
  })

  test('a record exported after import still re-imports without duplicating', async () => {
    const first = await applyImport([], await exportToBuffer([exampleRecord()]))
    const again = await applyImport(first.records, await exportToBuffer(first.records))
    expect(again.added).toBe(0)
    expect(again.updated).toBe(1)
    expect(again.records.length).toBe(1)
  })
})
