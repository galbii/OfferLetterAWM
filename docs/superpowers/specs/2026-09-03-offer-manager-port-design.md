# Offer Manager Port — Design Spec

**Date:** 2026-09-03 · **Status:** Approved (in-chat, architectural path)

## What we're building

Port the standalone single-file app **"Offer & New Hire Request Manager v1.6"**
(All Western Mortgage internal HR tool) into this Payload/Next.js template as a
self-contained route at `/offers`. Draft 1 has **no database integration**:
records live in `localStorage`, exactly as the source app stores them. It must
run under `bun run build && bun run start`.

## Source of truth

The original app is the executable spec. Its app code (vendored xlsx/jspdf/
html2canvas libraries stripped) is committed beside this spec:

| File | Contents |
|---|---|
| `offer-manager-v1.6-source/source-1-markup-css.html` | `<head>` + full CSS (lines 7–291) + all body markup |
| `offer-manager-v1.6-source/source-2-form-storage.js` | Field schema (68 field entries across 42 numbered questions, 6 groups), form render/read/write, validation, autosave, record list, xlsx/csv import/export, template workbook, backup/restore, modal/toast, events, init |
| `offer-manager-v1.6-source/source-3-letter-pipeline.js` | Letter overlay markup, AWM logo (base64, line 34), letter language constants, letter generator, options panel, Word/HTML-packet/email exports, pipeline/hired/archived tables, analysis view, zip writer, PDF pagination, intake code sync |

**Parity rule:** port logic verbatim (same strings, same math, same defaults,
same edge-case behavior) except the Named Deviations below. When in doubt, the
source wins.

## Feature scope (draft 1)

**Kept:** Pipeline / Hired / Archived / Analysis tabs · Editor with New Hire
Details form (composite Base Wage + Bonus widgets, live previews, autosave,
required-field validation) and Offer Letter subtab (options sidebar,
contenteditable sheet, watermark, regenerate, print/PDF) · single + mass PDF
(zip) · single + mass Word .doc (zip) · shareable HTML offer packet · Outlook
desktop/web email compose · xlsx/csv import + template download · per-record
and bulk CSV/xlsx export · backup/restore JSON · bulk signatory assignment ·
intake code/link import + localStorage inbox polling.

**Dropped:** File System Access "data file" + presence/heartbeat/concurrent
banner/reconnect overlay (DB replaces it later) · "Export App (with data)".

## Named deviations from the source

1. **No data file / presence system** (dropped features above). `persist()`
   becomes localStorage-only.
2. **Letter functions take arguments.** Source uses module globals `L` (letter
   config) and `curRec`. Ported functions take `(rec, letter)` explicitly; no
   global save/restore dances.
3. **Vendored libs → npm:** `xlsx`, `jspdf`, `html2canvas`, dynamically
   imported client-side. The hand-rolled STORE zip writer is kept verbatim.
4. **Logo:** the base64 PNG becomes `public/offers/awm-logo.png`; the letter
   generator references `/offers/awm-logo.png`.
5. **Styling:** the source CSS is copied near-verbatim into plain global CSS
   files imported only by the `/offers` route-group layout (NOT CSS modules —
   generated letter HTML and table HTML reference class names as strings).
   This deliberately deviates from the repo's Tailwind-token rule: the letter's
   print output depends on these exact rules, and the tool's navy palette must
   not couple to the site theme. The `(app)` route group does not import the
   frontend `globals.css`, so no collision.
6. **React ownership vs. imperative islands:** the contenteditable letter sheet
   is rendered once via `dangerouslySetInnerHTML` and then left alone; edits
   debounce into `rec.letterHtml` with the source's `letterStale` invalidation
   rule.

## Architecture

- **Route:** `src/app/(app)/offers/` — own route-group root layout (html/body,
  offers CSS, no site Header/Footer/Theme). CMS site untouched. No auth.
- **Pure logic:** `src/lib/offers/` — framework-free TS modules:
  `types.ts`, `schema.ts`, `format.ts`, `calc.ts`, `letter.ts`,
  `letter-exports.ts`, `spreadsheet.ts`, `zip.ts`, `pdf.ts` (client-only),
  `storage.ts` (THE seam — localStorage now, Payload later), `intake.ts`.
- **UI:** `src/components/offers/` — `OfferManager` (state owner),
  `StageTable`, `AnalysisView`, `RecordList`, `RequestForm` + field widgets,
  `LetterView`, `Toast`, `Modal`.

## Data contract (unchanged from source)

```ts
type OfferRecord = {
  id: string                 // uid(): "r" + base36 timestamp + random
  data: Record<string, string> // keyed by field id, always strings
  status: 'complete' | 'draft'
  stage?: 'pipeline' | 'hired' | 'archived'  // absent = pipeline
  created: string            // ISO
  updated: string            // ISO
  letter?: LetterConfig      // saved letter options
  letterHtml?: string | null // hand-edited letter body (letterWrap'd)
  letterStale?: boolean      // fields changed since hand-edit
}
```

localStorage keys (verbatim): `onhr_records_v121`, `onhr_draft_v121`,
`onhr_email_client`, `onhr_imported_sids`, `onhr_inbox`, `onhr_user_name`.
Existing backup JSON files must restore unchanged.

## Verification

`bun run build` passes with blank env for the new code paths; `bun run
typecheck` clean; manual smoke: create → validate → letter → options →
PDF/Word/CSV/packet → template download → re-import roundtrip → backup/restore.
