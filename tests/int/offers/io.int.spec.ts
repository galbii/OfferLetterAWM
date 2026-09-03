import { describe, expect, test } from 'bun:test'
import { makeZip } from '@/lib/offers/zip'
import { encRec, decRec, parseIntakeCode, submissionToRecord } from '@/lib/offers/intake'
import { applyImport, parseBackup, buildBackupBlob } from '@/lib/offers/spreadsheet'
import type { OfferRecord } from '@/lib/offers/types'

describe('zip', () => {
  test('makeZip produces a valid empty-ish zip with EOCD', () => {
    const z = makeZip([{ name: 'a.txt', bytes: new TextEncoder().encode('hello') }])
    expect(z[0]).toBe(0x50)
    expect(z[1]).toBe(0x4b) // PK
    expect(z.length).toBeGreaterThan(100)
  })
})

describe('intake', () => {
  test('encRec/decRec roundtrip with unicode', () => {
    const sub = { sid: 's1', data: { employeeName: 'Ana María' } }
    expect(decRec(encRec(sub))).toEqual(sub)
  })

  test('parseIntakeCode accepts link, AWM1- prefix, and rejects junk', () => {
    const code = encRec({ sid: 'x', data: { employeeName: 'A' } })
    expect(parseIntakeCode('https://x/#rec=' + code)?.sid).toBe('x')
    expect(parseIntakeCode('AWM1-' + code)?.sid).toBe('x')
    expect(parseIntakeCode('!!!not-base64!!!')).toBeNull()
  })

  test('submissionToRecord blanks all data fields, sets status and stage', () => {
    const rec = submissionToRecord({ sid: 's2', data: { employeeName: 'Zoe' } })
    expect(rec.data.employeeName).toBe('Zoe')
    expect(rec.data.email).toBe('') // blanked, not undefined
    expect(rec.status).toBe('draft')
    expect(rec.stage).toBe('pipeline')
  })
})

describe('backup', () => {
  test('parseBackup validates shape', () => {
    expect(parseBackup('{"records":[]}')?.records).toEqual([])
    expect(parseBackup('{"nope":1}')).toBeNull()
    expect(parseBackup('garbage')).toBeNull()
  })

  test('buildBackupBlob round-trips through parseBackup', async () => {
    const rec: OfferRecord = {
      id: 'r1',
      data: { employeeName: 'Mickey Mouse' },
      status: 'draft',
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-01T00:00:00.000Z',
    }
    const parsed = parseBackup(await buildBackupBlob([rec]).text())
    expect(parsed?.app).toBe('onhr')
    expect(parsed?.records[0].data.employeeName).toBe('Mickey Mouse')
  })
})

// ---- applyImport (S2 700–767) -------------------------------------------------
async function sheetBytes(
  aoa: unknown[][],
  sheetName = 'New Hires',
  extra?: { name: string; aoa: unknown[][] },
): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  if (extra) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(extra.aoa), extra.name)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), sheetName)
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return out
}

describe('applyImport', () => {
  test('adds new records, normalizing dates and dollars', async () => {
    const buf = await sheetBytes([
      ['Employee Name', 'Email', 'Start Date', 'Base - Monthly Amount'],
      ['Ada Lovelace', 'ada@example.com', '7/24/26', '4333'],
    ])
    const res = await applyImport([], buf)
    expect(res.added).toBe(1)
    expect(res.updated).toBe(0)
    expect(res.sheetName).toBe('New Hires')
    expect(res.records[0].data.startDate).toBe('2026-07-24')
    expect(res.records[0].data.baseMonthly).toBe('$4,333')
    expect(res.records[0].status).toBe('draft')
  })

  test('tolerates a legend band above the header row', async () => {
    const buf = await sheetBytes([
      ['Offer & New Hire Request — Import Template'],
      [''],
      ['Employee Name', 'Email'],
      ['Grace Hopper', 'grace@example.com'],
    ])
    const res = await applyImport([], buf)
    expect(res.added).toBe(1)
    expect(res.records[0].data.employeeName).toBe('Grace Hopper')
  })

  test('prefers a New Hires/requests/data sheet over an instructions sheet', async () => {
    const buf = await sheetBytes(
      [
        ['Employee Name', 'Email'],
        ['Alan Turing', 'alan@example.com'],
      ],
      'New Hires',
      {
        name: 'Instructions',
        aoa: [
          ['Employee Name', 'Email'],
          ['Nope', 'nope@example.com'],
        ],
      },
    )
    const res = await applyImport([], buf)
    expect(res.sheetName).toBe('New Hires')
    expect(res.records[0].data.employeeName).toBe('Alan Turing')
  })

  test('updates existing matched record in matched columns only, without mutating input', async () => {
    const existing: OfferRecord = {
      id: 'r1',
      data: { employeeName: 'Ada Lovelace', email: 'ada@example.com', position: 'Analyst' },
      status: 'draft',
      stage: 'hired',
      created: 'c',
      updated: 'u',
      letterHtml: '<p>keep me</p>',
    }
    const snapshot = JSON.stringify(existing)
    const buf = await sheetBytes([
      ['Employee Name', 'Email', 'Branch Name'],
      ['ADA  LOVELACE', 'Ada@Example.com', 'Branch Disneyland'],
    ])
    const res = await applyImport([existing], buf)
    expect(res.added).toBe(0)
    expect(res.updated).toBe(1)
    // input array and record untouched
    expect(JSON.stringify(existing)).toBe(snapshot)
    const hit = res.records.find((r) => r.id === 'r1')!
    expect(hit).not.toBe(existing)
    expect(hit.data.branchName).toBe('Branch Disneyland')
    expect(hit.data.position).toBe('Analyst') // unmatched column preserved
    expect(hit.stage).toBe('hired')
    expect(hit.letterHtml).toBe('<p>keep me</p>')
    expect(hit.updated).not.toBe('u')
  })

  test('duplicate rows within one import update in place instead of double-adding', async () => {
    const buf = await sheetBytes([
      ['Employee Name', 'Email', 'Branch Name'],
      ['Ada Lovelace', 'ada@example.com', 'Branch A'],
      ['Ada Lovelace', 'ada@example.com', 'Branch B'],
    ])
    const res = await applyImport([], buf)
    expect(res.added).toBe(1)
    expect(res.updated).toBe(1)
    expect(res.records.length).toBe(1)
    expect(res.records[0].data.branchName).toBe('Branch B')
  })

  test('throws the source message when no header row matches', async () => {
    const buf = await sheetBytes([
      ['Nonsense', 'Gibberish'],
      ['a', 'b'],
    ])
    await expect(applyImport([], buf)).rejects.toThrow(/header row/i)
  })
})
