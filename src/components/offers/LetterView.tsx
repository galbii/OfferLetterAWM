'use client'

// Offer letter view — ported from source-3-letter-pipeline.js.
// Markup: S3 2–30. Options panel: S3 233–266 (renderOptions). Behavior: S3 280–300, 433–458.
//
// Deviation (imperative island): the contenteditable letter body is written once per
// intentional rebuild via dangerouslySetInnerHTML keyed on `contentKey`, and is NEVER
// re-rendered from React while the user types — React's virtual __html stays byte-equal
// between rebuilds, so the DOM the user is editing is left alone.
// All letter-HTML builders are client-only; they run in effects/handlers, never during SSR.

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useOffers } from '@/components/offers/OffersProvider'
import { esc, safeFileBase } from '@/lib/offers/format'
import {
  generateLetterHTML,
  letterEditIsCurrent,
  letterWrap,
  resolveLetter,
  setByPath,
} from '@/lib/offers/letter'
import {
  letterDocHTML,
  mailtoUrl,
  offerEmailBody,
  offerEmailSubject,
  offerPacketHTML,
  owaComposeUrl,
} from '@/lib/offers/letter-exports'
import { downloadBlob } from '@/lib/offers/spreadsheet'
import { getEmailPref, setEmailPref } from '@/lib/offers/storage'
import type { EmailClientPref, LetterConfig, OfferRecord, OffersApi } from '@/lib/offers/types'

/* ---------- option-panel primitives (S3 234–237: selOpt / chkOpt / txtOpt / inpOpt) ---------- */

type OptValue = string | boolean

interface OptProps {
  path: string
  label: string
  onOpt: (path: string, val: OptValue, delay: number) => void
}

function SelOpt({
  path,
  label,
  opts,
  cur,
  onOpt,
}: OptProps & { opts: [string, string][]; cur: string }): React.JSX.Element {
  return (
    <div className="lo-row">
      <label>{label}</label>
      <select
        data-opt={path}
        value={cur}
        onChange={(e) => {
          onOpt(path, e.target.value, 0)
        }}
      >
        {opts.map((o) => (
          <option key={o[0]} value={o[0]}>
            {o[1]}
          </option>
        ))}
      </select>
    </div>
  )
}

function ChkOpt({
  path,
  label,
  checked,
  onOpt,
}: OptProps & { checked: boolean }): React.JSX.Element {
  return (
    <label className="lo-check">
      <input
        type="checkbox"
        data-opt={path}
        checked={checked}
        onChange={(e) => {
          onOpt(path, e.target.checked, 0)
        }}
      />{' '}
      {label}
    </label>
  )
}

function TxtOpt({ path, label, val, onOpt }: OptProps & { val: string }): React.JSX.Element {
  return (
    <div className="lo-row">
      <label>{label}</label>
      <textarea
        data-opt={path}
        rows={2}
        style={{
          padding: '7px 9px',
          border: '1px solid var(--line)',
          borderRadius: 6,
          fontSize: '12.5px',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        value={val || ''}
        onChange={(e) => {
          onOpt(path, e.target.value, 350)
        }}
      />
    </div>
  )
}

function InpOpt({
  path,
  label,
  val,
  type,
  onOpt,
}: OptProps & { val: string; type?: 'text' | 'date' }): React.JSX.Element {
  return (
    <div className="lo-row">
      <label>{label}</label>
      <input
        type={type || 'text'}
        data-opt={path}
        value={val || ''}
        onChange={(e) => {
          onOpt(path, e.target.value, 350)
        }}
      />
    </div>
  )
}

/* ---------------------------------- the view ---------------------------------- */

type EditStatus = 'idle' | 'saving' | 'saved'

function cloneLetter(L: LetterConfig): LetterConfig {
  return JSON.parse(JSON.stringify(L)) as LetterConfig
}

/**
 * Identity of the letter state stored on a record. The view compares this against
 * what it last wrote itself, so a write from ANOTHER component (bulk signatory
 * assign, S3 609–610) is detected and re-resolved instead of being shown stale.
 */
function letterSig(
  id: string | null,
  letter: OfferRecord['letter'],
  html: OfferRecord['letterHtml'],
): string {
  return id ? id + '\u0000' + JSON.stringify([letter || null, html || null]) : ''
}

export default function LetterView(): React.JSX.Element | null {
  const api = useOffers()
  const rec: OfferRecord | null = api.records.find((r) => r.id === api.currentId) || null

  const [L, setL] = useState<LetterConfig | null>(null)
  const [contentKey, setContentKey] = useState(0)
  const [status, setStatus] = useState<EditStatus>('idle')
  const [emailClient, setEmailClient] = useState<EmailClientPref>('desktop')

  const htmlRef = useRef<string>('')
  const contentRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const wmRef = useRef<HTMLDivElement | null>(null)

  const LRef = useRef<LetterConfig | null>(null)
  const recRef = useRef<OfferRecord | null>(null)
  const apiRef = useRef<OffersApi>(api)
  const initedFor = useRef<string | null>(null)
  /** `letterSig` of the last letter state THIS view wrote or loaded. */
  const ownSigRef = useRef<string>('')
  const editTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const regenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the refs the imperative handlers read in sync. Declared first so it runs
  // before the init effect on mount.
  useEffect(() => {
    recRef.current = rec
    apiRef.current = api
  })

  /** patchRecord + remember the resulting letter state as ours, so the
   *  external-change watcher below does not mistake it for someone else's write. */
  const patchSelf = useCallback((id: string, patch: Partial<OfferRecord>) => {
    const a = apiRef.current
    const cur = a.records.find((x) => x.id === id)
    const nextLetter = 'letter' in patch ? patch.letter : cur ? cur.letter : undefined
    const nextHtml = 'letterHtml' in patch ? patch.letterHtml : cur ? cur.letterHtml : undefined
    ownSigRef.current = letterSig(id, nextLetter, nextHtml)
    a.patchRecord(id, patch)
  }, [])

  const setLetter = useCallback((next: LetterConfig) => {
    LRef.current = next
    setL(next)
  }, [])

  // S3 291 — tile the watermark layer to the current sheet height.
  const renderWatermark = useCallback(() => {
    const wl = wmRef.current
    if (!wl) return
    const cur = LRef.current
    if (!cur || !cur.watermark || !cur.watermark.on) {
      wl.className = 'watermark-layer'
      wl.innerHTML = ''
      return
    }
    wl.className = 'watermark-layer on'
    const hgt = (sheetRef.current && sheetRef.current.scrollHeight) || 1100
    const rows = Math.ceil(hgt / 120) + 2
    const n = rows * 6
    const t = esc(cur.watermark.text || 'SAMPLE')
    wl.innerHTML =
      '<div class="wm-inner">' +
      new Array<string>(n).fill('<span>' + t + '</span>').join('') +
      '</div>'
  }, [])

  // S3 289–290 — regen: rebuild from fields/options (AUTO mode); discards manual edits.
  const regen = useCallback(
    (nextL: LetterConfig, recId: string) => {
      const a = apiRef.current
      const r = a.records.find((x) => x.id === recId)
      if (!r) return
      htmlRef.current = letterWrap(generateLetterHTML(r, nextL))
      setContentKey((k) => k + 1)
      patchSelf(recId, { letterHtml: null, letterStale: false, letter: nextL })
      setStatus('idle')
      window.setTimeout(renderWatermark, 0)
    },
    [patchSelf, renderWatermark],
  )

  // S3 293–298 (openLetter): resolve the letter, keep hand-edits only when the fields
  // are unchanged, otherwise rebuild and say so.
  const recId = rec ? rec.id : null
  useEffect(() => {
    if (!recId) {
      initedFor.current = null
      return
    }
    if (initedFor.current === recId) return
    const a = apiRef.current
    const r = a.records.find((x) => x.id === recId)
    if (!r) return
    initedFor.current = recId
    const resolved = resolveLetter(r)
    LRef.current = resolved
    setL(resolved)
    if (letterEditIsCurrent(r)) {
      ownSigRef.current = letterSig(recId, r.letter, r.letterHtml)
      htmlRef.current = r.letterHtml || ''
      setContentKey((k) => k + 1)
      setStatus('saved')
      window.setTimeout(renderWatermark, 0)
    } else {
      const wasEdited = !!r.letterHtml
      regen(resolved, recId)
      if (wasEdited)
        a.toast('Details changed since your edits — letter rebuilt from the current fields.')
    }
  }, [recId, regen, renderWatermark])

  // An open letter must follow the record when someone ELSE rewrites its letter
  // state — bulk signatory assign (S3 609–610) patches `letter` and `letterHtml`
  // on records that may be the one on screen. Anything this view wrote itself is
  // recorded in `ownSigRef` and ignored here.
  const recSig = letterSig(recId, rec ? rec.letter : undefined, rec ? rec.letterHtml : undefined)
  useEffect(() => {
    if (!recId || initedFor.current !== recId) return
    if (recSig === ownSigRef.current) return
    ownSigRef.current = recSig
    const a = apiRef.current
    const r = a.records.find((x) => x.id === recId)
    if (!r) return
    const resolved = resolveLetter(r)
    LRef.current = resolved
    setL(resolved)
    if (letterEditIsCurrent(r)) {
      htmlRef.current = r.letterHtml || ''
      setContentKey((k) => k + 1)
      setStatus('saved')
      window.setTimeout(renderWatermark, 0)
    } else {
      regen(resolved, recId)
    }
  }, [recId, recSig, regen, renderWatermark])

  // S3 509–510 — remembered email-client preference (client-only read).
  useEffect(() => {
    setEmailClient(getEmailPref())
  }, [])

  useEffect(() => {
    return () => {
      if (editTimer.current) clearTimeout(editTimer.current)
      if (regenTimer.current) clearTimeout(regenTimer.current)
    }
  }, [])

  /* ---------------------------- handlers ---------------------------- */

  // S3 446–453 — persist manual edits to the letter body (debounced 500ms).
  const onContentInput = useCallback(() => {
    const r = recRef.current
    if (!r) return
    setStatus('saving')
    if (editTimer.current) clearTimeout(editTimer.current)
    editTimer.current = setTimeout(() => {
      const html = contentRef.current ? contentRef.current.innerHTML : ''
      const patch: Partial<OfferRecord> = { letterHtml: html, letterStale: false }
      if (LRef.current) patch.letter = LRef.current
      patchSelf(r.id, patch)
      setStatus('saved')
    }, 500)
  }, [patchSelf])

  // S3 454–458 — an option change on a hand-edited letter prompts the discard confirm.
  const onOpt = useCallback(
    (path: string, val: OptValue, delay: number) => {
      const r = recRef.current
      const cur = LRef.current
      if (!r || !cur) return
      const apply = (): void => {
        const next = cloneLetter(cur)
        setByPath(next, path, val)
        setLetter(next)
        patchSelf(r.id, { letter: next, letterHtml: null })
        if (regenTimer.current) clearTimeout(regenTimer.current)
        regenTimer.current = setTimeout(() => {
          regen(next, r.id)
        }, delay)
      }
      if (r.letterHtml) {
        // Cancelling needs no work: the controls are controlled by `L`, so React
        // restores the previous value on its own.
        apiRef.current.confirmDialog(
          'Discard manual edits?',
          'This letter has manual edits. Changing this option rebuilds it and discards those edits. Continue?',
          apply,
        )
      } else apply()
    },
    [patchSelf, regen, setLetter],
  )

  // S3 435–438 — Regenerate, confirming first when the letter was hand-edited.
  const onRegenClick = useCallback(() => {
    const r = recRef.current
    const cur = LRef.current
    if (!r || !cur) return
    if (letterEditIsCurrent(r)) {
      apiRef.current.confirmDialog(
        'Regenerate?',
        'Discard your manual edits and rebuild this letter from the current fields?',
        () => {
          regen(cur, r.id)
          apiRef.current.toast('Letter rebuilt from the current fields.')
        },
      )
    } else {
      regen(cur, r.id)
      apiRef.current.toast('Letter regenerated from the current fields.')
    }
  }, [regen])

  // S3 439–442 — watermark toggle; independent of manual edits.
  const onWatermarkToggle = useCallback(
    (on: boolean) => {
      const r = recRef.current
      const cur = LRef.current
      if (!r || !cur) return
      const next = cloneLetter(cur)
      next.watermark = { on, text: (cur.watermark && cur.watermark.text) || 'SAMPLE' }
      setLetter(next)
      patchSelf(r.id, { letter: next })
      renderWatermark()
    },
    [patchSelf, renderWatermark, setLetter],
  )

  // S3 443 — print only the sheet.
  const onPrint = useCallback(() => {
    document.body.classList.add('printing-letter')
    window.print()
    window.setTimeout(() => {
      document.body.classList.remove('printing-letter')
    }, 700)
  }, [])

  // S3 314–350 — self-contained shareable offer packet.
  const onShare = useCallback(() => {
    const r = recRef.current
    if (!r) {
      apiRef.current.toast('Add the new hire details first, then export.', true)
      return
    }
    const o = offerPacketHTML(r)
    downloadBlob(
      new Blob([o.doc], { type: 'text/html' }),
      'Offer_Packet_' + safeFileBase(o.name, 'record') + '.html',
    )
    apiRef.current.toast('Shareable offer packet exported.')
  }, [])

  // S3 386–391 — editable Word (.doc) export.
  const onWord = useCallback(() => {
    const r = recRef.current
    if (!r) {
      apiRef.current.toast('Add the new hire details first, then export.', true)
      return
    }
    const o = letterDocHTML(r, null)
    downloadBlob(
      new Blob(['﻿' + o.doc], { type: 'application/msword' }),
      'Offer_Letter_' + safeFileBase(o.name, 'letter') + '.doc',
    )
    apiRef.current.toast('Word document exported. Open in Word to edit, then Save As .docx.')
  }, [])

  // S3 531–552 — compose in whichever client the user picked.
  const onEmail = useCallback(() => {
    const r = recRef.current
    const a = apiRef.current
    if (!r) {
      a.toast('Open a new hire first.', true)
      return
    }
    const email = ((r.data && r.data.email) || '').trim()
    if (!email) {
      a.toast('No email on this record — add one on the New Hire Details tab.', true)
      return
    }
    const subject = offerEmailSubject(r)
    const body = offerEmailBody(r)
    if (getEmailPref() === 'web') {
      window.open(owaComposeUrl(email, subject, body), '_blank', 'noopener')
      a.toast('Opening Outlook on the web — attach the saved PDF, then send.')
    } else {
      window.location.href = mailtoUrl(email, subject, body)
      a.toast('Opening your desktop mail app — attach the saved PDF, then send.')
    }
  }, [])

  if (!rec) return null

  // S3 280–286 — edit-status chip.
  const edited = !!rec.letterHtml
  const statusText =
    status === 'saving'
      ? 'Saving…'
      : edited
        ? status === 'saved'
          ? '✓ Edits saved'
          : '✎ Hand-edited'
        : ''
  const statusColor = status === 'saving' ? '#ffe6b3' : '#bff0dd'

  return (
    <div className="letter-overlay" id="letterOverlay">
      <div className="letter-toolbar">
        <strong>Offer Letter</strong>
        <span id="letterName" style={{ opacity: 0.85 }}>
          {rec.data.employeeName || 'New hire'}
        </span>
        <span
          id="letterEditStatus"
          style={{ fontSize: 12, opacity: 0.9, marginLeft: 8, color: statusColor }}
        >
          {statusText}
        </span>
        <div className="lt-actions">
          <label className="wm-ctl" title="Show a SAMPLE watermark on this letter (print / PDF)">
            <input
              type="checkbox"
              id="letterWmOn"
              checked={!!(L && L.watermark && L.watermark.on)}
              onChange={(e) => {
                onWatermarkToggle(e.target.checked)
              }}
            />{' '}
            Watermark
          </label>
          <button
            type="button"
            className="btn-light"
            id="letterRegen"
            title="Rebuild the letter from the current fields (replaces manual edits)"
            onClick={onRegenClick}
          >
            Regenerate
          </button>
          <button type="button" className="btn-light" id="letterShare" onClick={onShare}>
            Export / Share (HTML)
          </button>
          <button type="button" className="btn-light" id="letterDoc" onClick={onWord}>
            Word (.doc)
          </button>
          <label className="email-pref">
            Email in
            <select
              id="emailClientPref"
              value={emailClient}
              onChange={(e) => {
                const v = e.target.value as EmailClientPref
                setEmailClient(v)
                setEmailPref(v)
              }}
            >
              <option value="desktop">Desktop Outlook</option>
              <option value="web">Outlook Web</option>
            </select>
          </label>
          <button type="button" className="btn-light" id="letterEmail" onClick={onEmail}>
            ✉ Email
          </button>
          <button type="button" className="btn-primary" id="letterPrint" onClick={onPrint}>
            Print / Save as PDF
          </button>
          <button
            type="button"
            className="btn-ghost"
            id="letterClose"
            onClick={() => {
              api.showView('pipeline')
            }}
          >
            Back to Pipeline
          </button>
        </div>
      </div>
      <div className="letter-body-wrap">
        <div className="letter-options" id="letterOptions">
          {L ? (
            <>
              <h4>Letter</h4>
              <InpOpt path="date" label="Letter date" val={L.date} type="date" onOpt={onOpt} />
              <SelOpt
                path="opening"
                label="Opening style"
                opts={[
                  ['manager', 'Manager (leadership / agreed start)'],
                  ['dated', 'Dated start (“beginning …”)'],
                  ['licensed', 'Licensed (license transfer)'],
                ]}
                cur={L.opening}
                onOpt={onOpt}
              />
              <SelOpt
                path="compIntro"
                label="Compensation intro"
                opts={[
                  ['transition', 'To support your successful transition…'],
                  ['simple', 'We are pleased to offer…'],
                ]}
                cur={L.compIntro}
                onOpt={onOpt}
              />
              <SelOpt
                path="expectFamily"
                label="What You Can Expect"
                opts={[
                  ['manager', 'Manager – empowered'],
                  ['operations', 'Operations – benefit from'],
                  ['licensed', 'Licensed – supportive/growth'],
                ]}
                cur={L.expectFamily}
                onOpt={onOpt}
              />
              <h4>Classification (Base Salary)</h4>
              <SelOpt
                path="fullPart"
                label="Full/Part time"
                opts={[
                  ['full-time', 'full-time'],
                  ['part-time', 'part-time'],
                ]}
                cur={L.fullPart}
                onOpt={onOpt}
              />
              <SelOpt
                path="exempt"
                label="Exempt status"
                opts={[
                  ['non-exempt', 'non-exempt'],
                  ['exempt', 'exempt'],
                ]}
                cur={L.exempt}
                onOpt={onOpt}
              />
              <ChkOpt
                path="taxesClause"
                label="Include “all pay subject to withholding…” line"
                checked={L.taxesClause}
                onOpt={onOpt}
              />
              <h4>Sections</h4>
              <ChkOpt
                path="nmlsLine"
                label="Next Steps: NMLS transfer line"
                checked={L.nmlsLine}
                onOpt={onOpt}
              />
              <ChkOpt
                path="onboardingLine"
                label="Next Steps: onboarding docs line"
                checked={L.onboardingLine}
                onOpt={onOpt}
              />
              <SelOpt
                path="pathAhead"
                label="The Path Ahead"
                opts={[
                  ['thrilled', 'Thrilled / if you’re happy'],
                  ['confirm', 'Excited / to confirm'],
                  ['accept', 'Excited / to accept'],
                ]}
                cur={L.pathAhead}
                onOpt={onOpt}
              />
              <SelOpt
                path="closing"
                label="Closing line"
                opts={[
                  ['welcome', '…welcome.'],
                  ['aboard', '…welcome aboard.'],
                  ['team', '…welcome to the team.'],
                ]}
                cur={L.closing}
                onOpt={onOpt}
              />
              <SelOpt
                path="signatory"
                label="Signatory"
                opts={[
                  ['biaggi', 'Chris Biaggi – CEO'],
                  ['kauffman', 'Jeff Kauffman – National Sales Manager'],
                  ['kern', 'Ty Kern – CSO'],
                  ['lin', 'Peter Lin – Senior VP of Strategy'],
                ]}
                cur={L.signatory}
                onOpt={onOpt}
              />
              <h4>Compensation table (auto-included)</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '0 0 8px' }}>
                Every component with a value is included automatically — salary, sign-on, guarantee,
                per-file, production, override. Edit the wording below; clear a box to drop that
                row.
              </p>
              <TxtOpt
                path="rows.base.wyr"
                label="Base Salary"
                val={L.rows.base.wyr}
                onOpt={onOpt}
              />
              <TxtOpt
                path="rows.signon.wyr"
                label="Sign-On Bonus"
                val={L.rows.signon.wyr}
                onOpt={onOpt}
              />
              <SelOpt
                path="rows.guarantee.style"
                label="Guarantee wording"
                opts={[
                  ['advance', 'Advance on commissions'],
                  ['greater', 'Greater-of (bulleted)'],
                ]}
                cur={L.rows.guarantee.style}
                onOpt={onOpt}
              />
              <InpOpt
                path="rows.guarantee.amt"
                label="Guarantee – per pay-period amount"
                val={L.rows.guarantee.amt}
                onOpt={onOpt}
              />
              <InpOpt
                path="rows.guarantee.periods"
                label="Guarantee – # pay periods"
                val={L.rows.guarantee.periods}
                onOpt={onOpt}
              />
              <TxtOpt
                path="rows.guarantee.wyr"
                label="Guaranteed Pay"
                val={L.rows.guarantee.wyr}
                onOpt={onOpt}
              />
              <TxtOpt
                path="rows.perfile.wyr"
                label="Per-File Bonus"
                val={L.rows.perfile.wyr}
                onOpt={onOpt}
              />
              <TxtOpt
                path="rows.production.wyr"
                label="Production Bonus"
                val={L.rows.production.wyr}
                onOpt={onOpt}
              />
              <TxtOpt
                path="rows.override.wyr"
                label="Override"
                val={L.rows.override.wyr}
                onOpt={onOpt}
              />
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '6px' }}>
                Standard Commission and Benefits are added automatically for commissioned /
                non-part-time roles. The AWM commission-plan % section appears whenever any Q28–34
                percentages are filled. You can also click into the letter to fine-tune wording.
              </p>
            </>
          ) : null}
        </div>
        <div className="letter-preview-area">
          <div className="letter-sheet" id="letterSheet" ref={sheetRef}>
            <div className="watermark-layer" id="wmLayer" ref={wmRef} />
            <div
              key={contentKey}
              ref={contentRef}
              className="letter-content"
              id="letterContent"
              contentEditable
              suppressContentEditableWarning
              onInput={onContentInput}
              dangerouslySetInnerHTML={{ __html: htmlRef.current }}
            />
            <div className="letter-print-footer">
              All Western Mortgage, Inc. &nbsp;&bull;&nbsp; 8345 W. Sunset Rd. #380
              <br />
              Las Vegas, NV 89113 &nbsp;&bull;&nbsp; Main 702.369.0905 &nbsp;&bull;&nbsp; Fax
              702.920.8421
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
