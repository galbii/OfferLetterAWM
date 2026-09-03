'use client'

// Pipeline bulk-action toolbar.
// Markup ← S1 343–352.  Logic ← S3 579–614 (bulk signatory), 393–402 (mass Word),
// 716–726 (mass PDF), S2 791–799 (selected CSV), S3 745 (delete selected).

import { useState } from 'react'

import { dstamp, safeFileBase } from '@/lib/offers/format'
import { SIGNATORY, swapSigInHtml } from '@/lib/offers/letter'
import { letterDocHTML } from '@/lib/offers/letter-exports'
import { letterToPdfBytes } from '@/lib/offers/pdf'
import { downloadBlob, exportSelectedCsv } from '@/lib/offers/spreadsheet'
import type { OfferRecord, SignatoryKey, WatermarkOpt } from '@/lib/offers/types'
import { makeZip, type ZipFile } from '@/lib/offers/zip'

import { useOffers } from './OffersProvider'

const SIG_KEYS = Object.keys(SIGNATORY) as SignatoryKey[]

function plural(n: number, one: string, many: string): string {
  return n !== 1 ? many : one
}

/** Copy the zip bytes into a plain ArrayBuffer so they satisfy BlobPart. */
function zipBlob(files: ZipFile[]): Blob {
  const bytes = makeZip(files)
  const buf = new ArrayBuffer(bytes.length)
  new Uint8Array(buf).set(bytes)
  return new Blob([buf], { type: 'application/zip' })
}

export interface BulkToolbarProps {
  /** Ids of the checked rows currently visible in the pipeline table. */
  selectedIds: string[]
  /** Ids of every row currently visible in the pipeline table (after filters). */
  visibleIds: string[]
  /** Clear the table's checkbox selection (after a destructive bulk action). */
  onClearSelection: () => void
}

export default function BulkToolbar({
  selectedIds,
  visibleIds,
  onClearSelection,
}: BulkToolbarProps) {
  const api = useOffers()
  const [sigKey, setSigKey] = useState<string>('')
  const [wmOn, setWmOn] = useState(false)
  const [busy, setBusy] = useState(false)

  const n = selectedIds.length
  const wm = (): WatermarkOpt => ({ on: wmOn, text: 'SAMPLE' })

  const recFor = (id: string): OfferRecord | undefined => api.records.find((r) => r.id === id)

  // S3 604–612
  function applySignatory(ids: string[], key: SignatoryKey) {
    const sg = SIGNATORY[key]
    if (!sg) return
    let count = 0
    let patched = 0
    let custom = 0
    ids.forEach((id) => {
      const rec = recFor(id)
      if (!rec) return
      const patch: Partial<OfferRecord> = { letter: { ...(rec.letter || {}), signatory: key } }
      if (rec.letterHtml) {
        const np = swapSigInHtml(rec.letterHtml, sg)
        if (np !== rec.letterHtml) {
          patch.letterHtml = np
          patched++
        } else {
          custom++
        }
      }
      api.patchRecord(id, patch)
      count++
    })
    let msg =
      'Signer set to ' + sg.name + ' on ' + count + ' request' + plural(count, '', 's') + '.'
    if (patched)
      msg +=
        ' ' + patched + ' finalized letter' + plural(patched, '', 's') + ' updated in place.'
    if (custom)
      msg +=
        ' ' +
        custom +
        ' edited letter' +
        (custom !== 1 ? 's have' : ' has') +
        ' a custom signature — open to change.'
    api.toast(msg)
  }

  // S3 613–614
  function bulkAssignSignatory() {
    if (!sigKey) {
      api.toast('Pick a signer from the dropdown first.', true)
      return
    }
    const key = sigKey as SignatoryKey
    const sg = SIGNATORY[key]
    if (selectedIds.length) {
      applySignatory(selectedIds, key)
      return
    }
    if (!visibleIds.length) {
      api.toast('No requests in this list.', true)
      return
    }
    api.confirmDialog(
      'Assign signer to all?',
      'No rows are checked. Set ' +
        sg.name +
        ' as the AWM signing party on all ' +
        visibleIds.length +
        ' request' +
        plural(visibleIds.length, '', 's') +
        ' in this list?',
      () => applySignatory(visibleIds, key),
    )
  }

  // S3 716–726
  async function exportMassLetters(ids: string[]) {
    if (!ids.length) {
      api.toast('Select at least one candidate.', true)
      return
    }
    const w = wm()
    api.toast(
      'Generating ' +
        ids.length +
        ' PDF' +
        plural(ids.length, '', 's') +
        (w.on ? ' (watermarked)' : '') +
        '…',
    )
    const used: Record<string, number> = {}
    const files: ZipFile[] = []
    for (const id of ids) {
      const r = recFor(id)
      if (!r) continue
      try {
        const bytes = await letterToPdfBytes(r, w)
        let base = safeFileBase(r.data.employeeName || 'New Hire', 'letter')
        const seen = used[base]
        if (seen) {
          used[base] = seen + 1
          base = base + '_' + (seen + 1)
        } else {
          used[base] = 1
        }
        files.push({ name: 'Offer_Letter_' + base + '.pdf', bytes })
      } catch {
        /* skip this record, as the source does */
      }
    }
    if (!files.length) {
      api.toast('Could not generate PDFs.', true)
      return
    }
    downloadBlob(zipBlob(files), 'Offer_Letters_' + dstamp() + '.zip')
    api.toast(
      'Generated a zip with ' + files.length + ' PDF' + plural(files.length, '', 's') + '.',
    )
  }

  // S3 393–402 — a zip of individual .doc files (respects the Watermark toggle).
  function exportMassLettersWord(ids: string[]) {
    if (!ids.length) {
      api.toast('Select at least one candidate.', true)
      return
    }
    const w = wm()
    const enc = new TextEncoder()
    const used: Record<string, number> = {}
    const files: ZipFile[] = []
    for (const id of ids) {
      const r = recFor(id)
      if (!r) continue
      try {
        const o = letterDocHTML(r, w)
        let base = safeFileBase(o.name || 'New Hire', 'letter')
        const seen = used[base]
        if (seen) {
          used[base] = seen + 1
          base = base + '_' + (seen + 1)
        } else {
          used[base] = 1
        }
        files.push({ name: 'Offer_Letter_' + base + '.doc', bytes: enc.encode('﻿' + o.doc) })
      } catch {
        /* skip this record, as the source does */
      }
    }
    if (!files.length) {
      api.toast('Could not generate Word docs.', true)
      return
    }
    downloadBlob(zipBlob(files), 'Offer_Letters_Word_' + dstamp() + '.zip')
    api.toast(
      'Generated a zip with ' +
        files.length +
        ' Word doc' +
        plural(files.length, '', 's') +
        (w.on ? ' (watermarked)' : '') +
        '.',
    )
  }

  // S2 791–799
  async function exportSelected(ids: string[]) {
    if (!ids.length) {
      api.toast('Check at least one person to export.', true)
      return
    }
    const { count } = await exportSelectedCsv(api.records, ids)
    if (!count) {
      api.toast("Couldn't find the selected records.", true)
      return
    }
    api.toast(
      'Exported ' + count + ' selected request' + (count === 1 ? '' : 's') + ' to CSV.',
    )
  }

  // S3 745
  function deleteSelected(ids: string[]) {
    if (!ids.length) {
      api.toast('Select at least one to delete.', true)
      return
    }
    api.confirmDialog(
      'Delete selected',
      'Permanently delete ' +
        ids.length +
        ' selected record' +
        plural(ids.length, '', 's') +
        '? This cannot be undone.',
      () => {
        api.deleteRecords(ids)
        onClearSelection()
        api.toast('Deleted ' + ids.length + ' record' + plural(ids.length, '', 's') + '.')
      },
    )
  }

  async function run(fn: () => void | Promise<void>) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stage-toolbar">
      <button
        className="btn-light"
        type="button"
        onClick={() => {
          api.showView('editor')
          api.newRecord()
          api.showSub('details')
        }}
      >
        + New Request
      </button>
      <span className="st-spacer" />
      <span className="mass-sig">
        <span className="ms-lbl">AWM signer:</span>
        <select
          title="Bulk-assign the signing party for our side"
          value={sigKey}
          onChange={(e) => setSigKey(e.target.value)}
        >
          <option value="">Set signer to…</option>
          {SIG_KEYS.map((k) => (
            <option key={k} value={k}>
              {SIGNATORY[k].name + ' – ' + SIGNATORY[k].title}
            </option>
          ))}
        </select>
        <button className="btn-light" type="button" onClick={bulkAssignSignatory}>
          {'Assign (' + n + ')'}
        </button>
      </span>
      <label className="wm-toggle">
        <input type="checkbox" checked={wmOn} onChange={(e) => setWmOn(e.target.checked)} />{' '}
        Watermark
      </label>
      <button
        className="btn-primary"
        type="button"
        disabled={busy}
        onClick={() => void run(() => exportMassLetters(selectedIds))}
      >
        {'Generate Offer Letters PDF (' + n + ')'}
      </button>
      <button
        className="btn-primary"
        type="button"
        disabled={busy}
        onClick={() => exportMassLettersWord(selectedIds)}
      >
        {'Generate Offer Letters Word (' + n + ')'}
      </button>
      <button
        className="btn-light"
        type="button"
        disabled={busy}
        onClick={() => void run(() => exportSelected(selectedIds))}
      >
        {'Export CSV (' + n + ')'}
      </button>
      <button className="btn-danger" type="button" onClick={() => deleteSelected(selectedIds)}>
        {'Delete Selected (' + n + ')'}
      </button>
    </div>
  )
}
