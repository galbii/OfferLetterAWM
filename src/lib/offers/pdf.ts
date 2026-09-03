// Letter → PDF rasterizer. Ported from S3 679–715 (drawLetterFooter, drawWatermark,
// letterToPdfBytes with its safeBreak pagination scan).
//
// Client-only: `jspdf` and `html2canvas` are dynamically imported inside the
// function, and the off-screen stage is created and torn down per call (the source
// used a static `#pdfStage` div in its markup — S1 434).

import { letterInnerFor, resolveLetter } from '@/lib/offers/letter'
import type { OfferRecord, WatermarkOpt } from '@/lib/offers/types'

type PdfDoc = {
  setFontSize(size: number): unknown
  setTextColor(...args: number[]): unknown
  setFont(family: string, style: string): unknown
  text(text: string, x: number, y: number, options?: { align?: string; angle?: number }): unknown
  saveGraphicsState(): unknown
  restoreGraphicsState(): unknown
  setGState(gState: unknown): unknown
  addPage(): unknown
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): unknown
  output(type: 'arraybuffer'): ArrayBuffer
}

// S3 679–681
function drawLetterFooter(doc: PdfDoc, pageW: number, pageH: number): void {
  doc.setFontSize(8.5)
  doc.setTextColor(70)
  doc.text('All Western Mortgage, Inc.  •  8345 W. Sunset Rd. #380', pageW / 2, pageH - 34, {
    align: 'center',
  })
  doc.text(
    'Las Vegas, NV 89113  •  Main 702.369.0905  •  Fax 702.920.8421',
    pageW / 2,
    pageH - 22,
    { align: 'center' },
  )
}

// S3 682–687
function drawWatermark(
  doc: PdfDoc,
  pageW: number,
  pageH: number,
  text: string,
  makeGState: (o: { opacity: number }) => unknown,
): void {
  const t = String(text || 'SAMPLE')
  try {
    doc.saveGraphicsState()
    doc.setGState(makeGState({ opacity: 0.12 }))
  } catch {
    /* renderer without graphics-state support */
  }
  doc.setTextColor(200, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(44)
  for (let yy = 70; yy < pageH + 130; yy += 130) {
    for (let xx = -30; xx < pageW + 170; xx += 185) {
      doc.text(t, xx, yy, { angle: 30 })
    }
  }
  try {
    doc.restoreGraphicsState()
  } catch {
    /* ignore */
  }
  doc.setTextColor(70)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
}

// S3 688–715
export async function letterToPdfBytes(
  rec: OfferRecord,
  wm: WatermarkOpt | null,
): Promise<Uint8Array> {
  if (typeof document === 'undefined')
    throw new Error('PDF export is only available in the browser.')

  const L = resolveLetter(rec)
  const body = letterInnerFor(rec, L)

  const stage = document.createElement('div')
  stage.setAttribute(
    'style',
    'position:fixed;left:-10000px;top:0;background:#fff;z-index:-1;pointer-events:none',
  )
  document.body.appendChild(stage)
  try {
    stage.innerHTML =
      '<div class="letter-content" style="width:720px;padding:0;background:#fff">' + body + '</div>'
    const el = stage.firstChild as HTMLElement

    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })

    const { jsPDF, GState } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'letter' }) as unknown as PdfDoc
    const makeGState = (o: { opacity: number }): unknown => new GState(o)

    const pageW = 612,
      pageH = 792,
      mL = 54,
      mR = 54,
      mT = 42,
      mB = 52
    const contentW = pageW - mL - mR,
      contentH = pageH - mT - mB
    const cw = canvas.width,
      ch = canvas.height,
      pxPerPt = cw / contentW,
      slicePx = Math.floor(contentH * pxPerPt)
    const fctx = canvas.getContext('2d')

    // Find a near-blank horizontal line between target and minY so a page break never cuts through
    // a line of text or a table row. Rows crossing only thin vertical borders count as blank.
    function safeBreak(target: number, minY: number): number {
      if (target >= ch) return ch
      if (target <= minY) return target
      const h = target - minY
      let data: Uint8ClampedArray
      try {
        if (!fctx) return target
        data = fctx.getImageData(0, minY, cw, h).data
      } catch {
        return target
      }
      const limit = Math.max(6, Math.floor(cw * 0.015))
      for (let ry = h - 1; ry >= 0; ry--) {
        const b = ry * cw * 4
        let ink = 0,
          bad = false
        for (let x = 0; x < cw; x++) {
          const p = b + x * 4
          if (data[p] < 245 || data[p + 1] < 245 || data[p + 2] < 245) {
            if (++ink > limit) {
              bad = true
              break
            }
          }
        }
        if (!bad) return minY + ry
      }
      return target
    }

    let y = 0,
      page = 0
    while (y < ch) {
      let sh: number
      if (ch - y <= slicePx) {
        sh = ch - y
      } else {
        const cut = safeBreak(y + slicePx, y + Math.floor(slicePx * 0.55))
        sh = cut - y
        if (sh < 40) sh = Math.min(slicePx, ch - y)
      }
      const tmp = document.createElement('canvas')
      tmp.width = cw
      tmp.height = sh
      const ctx = tmp.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, cw, sh)
        ctx.drawImage(canvas, 0, y, cw, sh, 0, 0, cw, sh)
      }
      const img = tmp.toDataURL('image/jpeg', 0.92)
      if (page > 0) doc.addPage()
      doc.addImage(img, 'JPEG', mL, mT, contentW, sh / pxPerPt)
      if (wm && wm.on) drawWatermark(doc, pageW, pageH, wm.text, makeGState)
      drawLetterFooter(doc, pageW, pageH)
      y += sh
      page++
    }

    return new Uint8Array(doc.output('arraybuffer'))
  } finally {
    stage.remove()
  }
}
