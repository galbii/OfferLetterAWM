# Offer Manager Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the standalone "Offer & New Hire Request Manager v1.6" HTML app into this repo as a self-contained `/offers` route (localStorage persistence, no DB yet) that runs under `bun run build && bun run start`.

**Architecture:** Pure logic ported near-verbatim into framework-free modules under `src/lib/offers/`; React UI under `src/components/offers/` consuming an `OffersApi` context; own route group `src/app/(app)/offers/` with its own root layout and verbatim-ported global CSS. The contenteditable letter sheet is an imperative island.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Bun. New deps: `xlsx`, `jspdf`, `html2canvas` (all dynamically imported, client-only).

**Spec:** `docs/superpowers/specs/2026-09-03-offer-manager-port-design.md` — read it first. The executable spec is the committed source extract in `docs/superpowers/specs/offer-manager-v1.6-source/` (three files; line numbers below refer to them as S1/S2/S3).

## Global Constraints

- **Parity rule:** port logic verbatim — same strings, math, defaults, edge cases — except the spec's six Named Deviations. The source wins over your taste. Do not "improve" wording, defaults, or algorithms.
- **The source extracts are the code blocks of this plan.** Where a task says "port S2 lines A–B", the content of those lines is the required implementation, transcribed to TS with only the changes the task names.
- **Record shape & localStorage keys are frozen** (spec "Data contract"): keys `onhr_records_v121`, `onhr_email_client`, `onhr_imported_sids`, `onhr_inbox`, `onhr_user_name`; record fields `id,data,status,stage?,created,updated,letter?,letterHtml?,letterStale?`.
- Bun only. After every task: `bun run typecheck` and `bun run build` pass (build needs `docker compose up -d` mongo). Commit at the end of every task on branch `feature/offer-manager`.
- Strict TS: no `any`, no `as any`, handle nullables explicitly. `esc()`-everything discipline from the source is preserved in generated HTML.
- No `process.env` reads anywhere in offers code.
- Imports use `@/` aliases. All new code lives in `src/app/(app)/offers/`, `src/lib/offers/`, `src/components/offers/`, `public/offers/`, `tests/int/offers/`.
- `src/lib/offers/*` must not import React. `pdf.ts` and `spreadsheet.ts` may touch DOM/browser APIs but only inside functions (module top-level must be import-safe on the server).
- Components are `'use client'`. Nothing in the offers route imports from `src/app/(frontend)` or Payload.
- Unit tests (bun test) are required for Tasks 2–4 lib modules; component tasks (6–9) are verified by typecheck + build (repo has no React unit-test rig — do not add one).
- Dead code in the source is not ported: `buildLettersDoc` (S3 647–664), `exportAppWithData` (S3 404–425), all data-file/presence code (S2 140–345), `migrateLetterStyles` (S2 123–137), concurrent banner & reconnect overlay markup (S1 294–304).

---

### Task 1: Dependencies, logo asset, route scaffold, shared types

**Files:**
- Modify: `package.json` (via `bun add`)
- Create: `public/offers/awm-logo.png` (extracted from S3 line 34)
- Create: `src/lib/offers/types.ts`
- Create: `src/app/(app)/offers/layout.tsx`
- Create: `src/app/(app)/offers/page.tsx`

**Interfaces:**
- Produces: every type below, verbatim — later tasks import from `@/lib/offers/types`.

- [ ] **Step 1: Install deps**

```bash
bun add xlsx jspdf html2canvas
```

- [ ] **Step 2: Extract the logo**

S3 line 34 is `const AWM_LOGO="data:image/png;base64,....."`. Extract and decode:

```bash
mkdir -p public/offers
node -e "
const fs=require('fs');
const line=fs.readFileSync('docs/superpowers/specs/offer-manager-v1.6-source/source-3-letter-pipeline.js','utf8').split('\n')[33];
const m=line.match(/base64,([A-Za-z0-9+/=]+)/);
fs.writeFileSync('public/offers/awm-logo.png',Buffer.from(m[1],'base64'));
"
file public/offers/awm-logo.png   # expect: PNG image data, 500 x 125 (approx)
```

- [ ] **Step 3: Write `src/lib/offers/types.ts`** — exactly this content:

```ts
// Shared types for the Offer & New Hire Request Manager port.
// The record shape and localStorage contract are frozen — see the design spec.

export type FieldType =
  | 'text' | 'email' | 'tel' | 'date' | 'textarea'
  | 'radio' | 'radio_other' | 'bonus' | 'base'

export interface FieldDef {
  id: string
  q: number
  g: string
  label: string
  /** Spreadsheet column header — absent on composite pseudo-fields (bonus/base). */
  col?: string
  type: FieldType
  req?: boolean
  help?: string
  options?: string[]
  inline?: boolean
  otherLong?: boolean
  /** Sub-field rendered inside a bonus/base composite, not on its own. */
  hidden?: boolean
  /** Excluded from the import template workbook. */
  tmplHide?: boolean
}

export interface GroupDef {
  n: string
  title: string
}

/** Form values keyed by field id. Always strings (the source app trims on read). */
export type OfferData = Record<string, string>

export type Stage = 'pipeline' | 'hired' | 'archived'
export type RecordStatus = 'complete' | 'draft'

export type SignatoryKey = 'biaggi' | 'kauffman' | 'kern' | 'lin'
export interface Signatory { name: string; title: string }

export interface LetterRow { on: boolean; wyr: string }

export interface LetterConfig {
  date: string // ISO yyyy-mm-dd
  opening: 'manager' | 'dated' | 'licensed'
  expectFamily: 'manager' | 'operations' | 'licensed'
  compIntro: 'transition' | 'simple'
  nmlsLine: boolean
  onboardingLine: boolean
  pathAhead: 'thrilled' | 'confirm' | 'accept'
  closing: 'welcome' | 'aboard' | 'team'
  signatory: SignatoryKey
  fullPart: 'full-time' | 'part-time'
  exempt: 'exempt' | 'non-exempt'
  taxesClause: boolean
  includeCommissionPlan: boolean
  includeBrokered: boolean
  watermark: { on: boolean; text: string }
  rows: {
    base: LetterRow
    signon: LetterRow
    pnl: LetterRow & { note: string }
    guarantee: LetterRow & {
      amt: string
      periods: string
      style: 'advance' | 'greater'
      custom: boolean
    }
    perfile: LetterRow
    production: LetterRow
    override: LetterRow
    accel: LetterRow
    stdCommission: { on: boolean }
    benefits: { on: boolean }
  }
}

/** Stored on a record: a deep-partial override of the defaults (deepAssign semantics). */
export type StoredLetterConfig = {
  [K in keyof LetterConfig]?: LetterConfig[K] extends object
    ? Partial<LetterConfig[K]>
    : LetterConfig[K]
}

export interface OfferRecord {
  id: string
  data: OfferData
  status: RecordStatus
  stage?: Stage // absent = 'pipeline'
  created: string // ISO datetime
  updated: string // ISO datetime
  letter?: StoredLetterConfig
  letterHtml?: string | null
  letterStale?: boolean
}

export interface BackupFile {
  app: 'onhr'
  version: string
  exported: string
  records: OfferRecord[]
}

export interface IntakeSubmission {
  sid?: string
  submitted?: string
  data: OfferData
}

export type EmailClientPref = 'desktop' | 'web'

export type View = 'pipeline' | 'hired' | 'archived' | 'analysis' | 'editor'
export type EditorSub = 'letter' | 'details'

export interface ImportResult {
  records: OfferRecord[]
  added: number
  updated: number
  sheetName: string
}

export interface WatermarkOpt { on: boolean; text: string }

/**
 * Context contract between OfferManager (Task 6) and the view components
 * (Tasks 7–9). Task 6 implements it; consumers must not reach around it
 * to mutate records.
 */
export interface OffersApi {
  records: OfferRecord[]
  currentId: string | null
  view: View
  sub: EditorSub
  /** commitCurrent (S2 618–636): update current or create; returns the record id, or null when an empty new form was a no-op. */
  commitForm(data: OfferData, manual: boolean): string | null
  openRecord(id: string): void
  newRecord(): void
  deleteRecord(id: string): void
  deleteRecords(ids: string[]): void
  duplicateRecord(data: OfferData): void
  setStage(id: string, stage: Stage): void
  /** Prepend records (import/restore/intake paths). */
  addRecords(recs: OfferRecord[]): void
  /** Full replacement (spreadsheet import merge result). */
  replaceRecords(recs: OfferRecord[]): void
  /** Merge a patch into one record (letter/letterHtml/letterStale/stage) and persist. */
  patchRecord(id: string, patch: Partial<OfferRecord>): void
  toast(msg: string, err?: boolean): void
  confirmDialog(title: string, msg: string, onYes: () => void, onCancel?: () => void): void
  showView(v: View): void
  showSub(s: EditorSub): void
}
```

- [ ] **Step 4: Write the route-group layout** `src/app/(app)/offers/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Offer & New Hire Request Manager',
  robots: { index: false, follow: false },
}

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

(Global CSS imports are added in Task 5.)

- [ ] **Step 5: Placeholder page** `src/app/(app)/offers/page.tsx`:

```tsx
export default function OffersPage() {
  return <main style={{ padding: 40 }}>Offer Manager — under construction</main>
}
```

- [ ] **Step 6: Verify** — `bun run typecheck` then `bun run build` (start mongo first: `docker compose up -d`). Expected: both pass; `/offers` appears in the route list.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(offers): deps, logo asset, route scaffold, shared types"`

---

### Task 2: Pure core — schema, formatting, calculations

**Files:**
- Create: `src/lib/offers/schema.ts`
- Create: `src/lib/offers/format.ts`
- Create: `src/lib/offers/calc.ts`
- Test: `tests/int/offers/calc.int.spec.ts`

**Interfaces:**
- Consumes: `@/lib/offers/types`.
- Produces (later tasks import these exact names):
  - `schema.ts`: `GROUPS: GroupDef[]`, `FIELDS: FieldDef[]`, `FIELD_BY_ID: Record<string, FieldDef>`, `DATA_FIELDS: FieldDef[]`, `HEADERS: string[]`, `META_COLS: string[]`, `BONUS_GROUPS: Record<string, string[]>`, `DOLLAR_FIELD_IDS: string[]`, `EXAMPLE: OfferData`, `uid(): string`, `nowIso(): string`, `missingRequired(d: OfferData): FieldDef[]`
  - `format.ts`: `esc(s: unknown): string`, `parseMoney(s: string | null | undefined): number | null`, `fmtMoney(n: number): string`, `usd(n: number, dec: number): string`, `fmtDollarStr(s: string): string`, `moneyStr(s: string): string`, `nl2br(s: string): string`, `todayISO(): string`, `longDate(iso: string): string`, `fmtShort(iso: string): string`, `fmtMonthKey(k: string): string`, `fmtDate(iso: string): string`, `normDate(v: string): string`, `dstamp(): string`, `splitAddr(s: string): string[]`, `firstNameOf(d: OfferData): string`, `article(t: string): string`, `pnlWhenPhrase(m: string): string`, `cssEsc(s: string): string`, `normHeader(h: unknown): string`, `safeFileBase(name: string, fallback: string): string`
  - `calc.ts`: `baseWageCalc(d)`, `baseWageWYR(d): string`, `guaranteeCalc(d)`, `isCommissionedRec(d): boolean`, `defaultSignon(d)`, `defaultPnl(d)`, `defaultGuarantee(d)`, `defaultPerfile(d)`, `defaultProduction(d)`, `defaultOverride(d)`, `defaultAccel(d)`, `accelBpsStr(v)`, `defaultExempt(d)`, `cpPct(v): string` — all `d: OfferData`, all returning the exact source strings.

**Port map (verbatim, typed):**
- `schema.ts` ← S2 lines 3–99 (`T` enum becomes the `FieldType` union; `GROUPS`, all 42 `FIELDS` entries with every property copied character-for-character including help text), S2 853–860 (`EXAMPLE`), S2 346 (`uid`), S2 637 (`nowIso`), S2 598–600 (`missingRequired`), S2 488 (`DOLLAR_FIELD_IDS`), S2 98–99 (`META_COLS`, `BONUS_GROUPS`).
- `format.ts` ← S2 388, 486–491, 513, 595, 637–638, 688, 768–776, 816; S3 77–85. `safeFileBase` is the repeated `name.replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||fallback` idiom (S3 348, 388, 397) extracted once.
- `calc.ts` ← S2 492–537 (the DOM-reading `computeGuarantee`/`computeProduction`/`computeBaseWage` stay in the form component — only `baseWageCalc`, `baseWageWYR`, `guaranteeCalc` and helpers move here); S3 87–122 (`isCommissionedRec` … `defaultExempt`), S3 186 (`cpPct`).

- [ ] **Step 1: Write the failing tests** `tests/int/offers/calc.int.spec.ts` (bun test):

```ts
import { describe, expect, test } from 'bun:test'
import { parseMoney, fmtMoney, normDate, longDate, splitAddr, esc } from '@/lib/offers/format'
import { baseWageCalc, baseWageWYR, guaranteeCalc, cpPct, accelBpsStr, defaultExempt, isCommissionedRec } from '@/lib/offers/calc'
import { FIELDS, DATA_FIELDS, HEADERS, missingRequired } from '@/lib/offers/schema'

describe('format', () => {
  test('parseMoney', () => {
    expect(parseMoney('$4,333')).toBe(4333)
    expect(parseMoney('')).toBeNull()
    expect(parseMoney('abc')).toBeNull()
  })
  test('fmtMoney rounds and formats', () => expect(fmtMoney(41600)).toBe('$41,600'))
  test('normDate', () => {
    expect(normDate('7/24/26')).toBe('2026-07-24')
    expect(normDate('2026-7-4')).toBe('2026-07-04')
    expect(normDate('July 4')).toBe('July 4')
  })
  test('longDate', () => expect(longDate('2026-09-03')).toBe('September 3, 2026'))
  test('splitAddr comma fallback', () =>
    expect(splitAddr('1313 Disneyland Dr, Anaheim, CA 92802')).toEqual(['1313 Disneyland Dr', 'Anaheim, CA 92802']))
  test('esc', () => expect(esc('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;'))
})

describe('calc', () => {
  test('hourly basis defaults 40h and annualizes', () => {
    const c = baseWageCalc({ baseHourly: '$20', baseHoursWeek: '', baseMonthly: '', baseAnnual: '' })
    expect(c?.basis).toBe('hourly')
    expect(c?.annual).toBe(41600)
    expect(baseWageWYR({ baseHourly: '$20', baseHoursWeek: '', baseMonthly: '', baseAnnual: '' })).toBe('$20.00 per hour')
  })
  test('guaranteeCalc', () => {
    const g = guaranteeCalc({ bonusGuaranteeAmount: '$10,000', bonusGuaranteeMonths: '3' })
    expect(g).toEqual({ perPeriod: 5000, periods: 6, weeks: 12, total: 30000, perS: '$5,000', totalS: '$30,000' })
  })
  test('cpPct converts bps', () => {
    expect(cpPct('125')).toBe('1.25 %')
    expect(cpPct('')).toBe('N/A')
    expect(cpPct('n/a')).toBe('N/A')
  })
  test('accelBpsStr', () => expect(accelBpsStr('250')).toBe('250 bps (2.50%)'))
  test('defaultExempt', () => {
    expect(defaultExempt({ employmentType: 'Full Time - Operations' })).toBe('non-exempt')
    expect(defaultExempt({ employmentType: 'Commissioned Sales' })).toBe('exempt')
  })
  test('isCommissionedRec by title', () =>
    expect(isCommissionedRec({ employmentType: '', position: 'Loan Officer' })).toBe(true))
})

describe('schema', () => {
  test('68 field entries (42 numbered questions), headers match cols', () => {
    expect(FIELDS.length).toBe(68)
    expect(DATA_FIELDS.length).toBe(66) // all but the two composite pseudo-fields (baseWage, bonusStructure)
    expect(HEADERS).toEqual(DATA_FIELDS.map((f) => f.col))
  })
  test('missingRequired counts empty required fields', () => {
    expect(missingRequired({}).length).toBe(14)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `bun test tests/int/offers/calc.int.spec.ts` → FAIL (modules missing).
- [ ] **Step 3: Port the three modules** per the port map. Keep source comments where they explain behavior.
- [ ] **Step 4: Run tests** — expect all pass. The 14 `req:true` fields are: employeeName, email, phone, fullAddress, branchName, branchManager, workLocation, position, employmentType, reportsTo, startDate, bonusFunding, equipment, branchPricing. If your transcription disagrees, re-check it against S2 before touching the test — the source wins.
- [ ] **Step 5: Verify + commit** — `bun run typecheck && bun run build`; `git add -A && git commit -m "feat(offers): port schema, format, calc modules"`

---

### Task 3: Letter generator + letter exports

**Files:**
- Create: `src/lib/offers/letter.ts`
- Create: `src/lib/offers/letter-exports.ts`
- Test: `tests/int/offers/letter.int.spec.ts`

**Interfaces:**
- Consumes: types, `schema.ts` (`GROUPS`, `DATA_FIELDS`), `format.ts`, `calc.ts`.
- Produces:
  - `letter.ts`: `LB`, `PATH`, `CLOSING`, `SIGNATORY: Record<SignatoryKey, Signatory>`, `EXPECT_MANAGER/OPS/LICENSED`, `LETTER_FOOT`, `AWM_LOGO_SRC = '/offers/awm-logo.png'`, `defaultLetter(rec: OfferRecord): LetterConfig`, `resolveLetter(rec: OfferRecord): LetterConfig` (deepAssign of `rec.letter`, rows re-derived), `deepAssign`, `setByPath(obj, path, val)`, `generateLetterHTML(rec: OfferRecord, L: LetterConfig): string`, `compTableHTML(rec, L)`, `commissionPlanHTML(d: OfferData)`, `letterWrap(body: string): string`, `letterEditIsCurrent(rec): boolean`, `letterInnerFor(rec: OfferRecord, L: LetterConfig): string`, `advanceHIW`, `greaterHIW`, `swapSigInHtml(html: string, sg: Signatory): string`
  - `letter-exports.ts`: `letterDocHTML(rec, wm: WatermarkOpt | null): { name: string; doc: string }`, `offerPacketHTML(rec): { name: string; doc: string }`, `offerEmailSubject(rec): string`, `offerEmailBody(rec): string`, `mailtoUrl(email, subject, body): string`, `owaComposeUrl(email, subject, body): string`

**Port map:** `letter.ts` ← S3 35–74 (constants), 124–159 (`defaultLetter`/`deepAssign`/`resolveLetter`), 161–231 (HIW builders through `generateLetterHTML`), 267 (`setByPath`), 269–279 (`LETTER_FOOT`, `letterWrap`, `letterEditIsCurrent`, `letterInnerFor` — the DOM extraction inside `letterInnerFor` uses `document.createElement`; keep it but guard: it is only called client-side), 583–590 (`swapSigInHtml`). `letter-exports.ts` ← S3 303–350 (`shareSummaryHTML` + packet builder — the packet's CSS/JS strings verbatim), 358–385 (`letterDocHTML`), 508–528 (email helpers; the localStorage pref stays OUT — storage.ts owns it).

**Named deviation 2 applies here:** every function that read the globals `L`/`curRec` takes `(rec, L)` parameters instead; `letterDocHTML`/`offerPacketHTML` call `resolveLetter(rec)` internally (no save/restore dance). `generateLetterHTML` uses `AWM_LOGO_SRC` instead of the base64 constant (deviation 4).

- [ ] **Step 1: Failing tests** `tests/int/offers/letter.int.spec.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { defaultLetter, resolveLetter, generateLetterHTML, compTableHTML } from '@/lib/offers/letter'
import { offerEmailBody, mailtoUrl } from '@/lib/offers/letter-exports'
import type { OfferRecord } from '@/lib/offers/types'

const rec = (data: Record<string, string>, extra: Partial<OfferRecord> = {}): OfferRecord => ({
  id: 'r1', data, status: 'draft', created: '2026-09-01T00:00:00.000Z', updated: '2026-09-01T00:00:00.000Z', ...extra,
})

test('Branch Manager without start date: commissioned wins → licensed opening', () => {
  const L = defaultLetter(rec({ position: 'Branch Manager', employmentType: 'Commissioned Sales' }))
  expect(L.opening).toBe('licensed')
  expect(L.pathAhead).toBe('accept')
  expect(L.closing).toBe('team')
  expect(L.signatory).toBe('kauffman')
})

test('Branch Manager WITH start date: manager opening', () => {
  const L = defaultLetter(rec({ position: 'Branch Manager', employmentType: 'Commissioned Sales', startDate: '2026-10-01' }))
  expect(L.opening).toBe('manager')
  expect(L.pathAhead).toBe('thrilled')
  expect(L.closing).toBe('welcome')
  expect(L.expectFamily).toBe('manager')
})

test('defaultLetter dated opening for ops hire with start date', () => {
  const L = defaultLetter(rec({ position: 'Processor', employmentType: 'Full Time - Operations', startDate: '2026-10-01' }))
  expect(L.opening).toBe('dated')
  expect(L.expectFamily).toBe('operations')
})

test('resolveLetter merges stored options but re-derives rows', () => {
  const r = rec({ position: 'Processor', employmentType: 'Full Time - Operations', baseAnnual: '$52,000' },
    { letter: { signatory: 'kern', rows: { base: { on: false, wyr: 'stale' } } as never } })
  const L = resolveLetter(r)
  expect(L.signatory).toBe('kern')
  expect(L.rows.base.on).toBe(true)
  expect(L.rows.base.wyr).toBe('$52,000 annually')
})

test('generateLetterHTML contains name, logo path, comp table, signatory', () => {
  const r = rec({ employeeName: 'Mickey Mouse', position: 'Processor', employmentType: 'Full Time - Operations', baseAnnual: '$52,000', fullAddress: '1313 Disneyland Dr, Anaheim, CA 92802' })
  const html = generateLetterHTML(r, resolveLetter(r))
  expect(html).toContain('/offers/awm-logo.png')
  expect(html).toContain('Mickey Mouse')
  expect(html).toContain('Base Salary')
  expect(html).toContain('Benefits Package')
  expect(html).toContain('Jeff Kauffman')
})

test('part-time drops benefits row', () => {
  const r = rec({ employmentType: 'Part Time - Operations', baseHourly: '$20' })
  expect(compTableHTML(r, resolveLetter(r))).not.toContain('Benefits Package')
})

test('email helpers', () => {
  expect(offerEmailBody(rec({ preferredName: 'Mickey' }))).toContain('Hi Mickey,')
  expect(mailtoUrl('a@b.c', 'S', 'x\ny')).toBe('mailto:a@b.c?subject=S&body=x%0D%0Ay')
})
```

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Port both modules** per the port map and deviation notes. Language constants character-for-character.
- [ ] **Step 4: Run tests** → pass. Also eyeball one full `generateLetterHTML` output against S3 202–231 ordering (logo → date → addr → Dear → opening → understand → [licenseTransfer] → lookForward → Compensation h3 → intro → table → expect → next steps → path ahead → [commission plan] → closing → signature → ack → sign row).
- [ ] **Step 5: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): port letter generator and letter exports"`.

---

### Task 4: Storage seam, zip, spreadsheet, PDF, intake

**Files:**
- Create: `src/lib/offers/storage.ts`
- Create: `src/lib/offers/zip.ts`
- Create: `src/lib/offers/spreadsheet.ts`
- Create: `src/lib/offers/pdf.ts`
- Create: `src/lib/offers/intake.ts`
- Test: `tests/int/offers/io.int.spec.ts`

**Interfaces:**
- Consumes: types, schema, format, letter (`letterInnerFor`, `resolveLetter`, `LETTER_FOOT`).
- Produces:
  - `storage.ts` (THE seam — guard every fn with `typeof window === 'undefined'` no-ops): `loadRecords(): OfferRecord[]`, `persistRecords(records: OfferRecord[]): void`, `getEmailPref(): EmailClientPref`, `setEmailPref(v: EmailClientPref): void`, `importedSids(): string[]`, `markImported(sid: string | undefined): void`, `readAndClearInbox(): IntakeSubmission[]`, plus the key constants.
  - `zip.ts`: `makeZip(files: { name: string; bytes: Uint8Array }[]): Uint8Array` ← S3 665–678 verbatim.
  - `spreadsheet.ts` (all async, `await import('xlsx')` inside): `applyImport(records: OfferRecord[], fileData: ArrayBuffer): Promise<ImportResult>` (← S2 700–767, pure merge: returns the new array, never mutates input), `exportXlsxAll(records): Promise<void>`, `exportCsvAll(records): Promise<void>`, `exportSelectedCsv(records, ids): Promise<{ count: number }>`, `exportOneXlsx(rec): Promise<void>`, `downloadTemplate(): Promise<void>` (← S2 779–864), `downloadBlob(blob: Blob, name: string): void` (← S2 817), `buildBackupBlob(records): Blob` + `parseBackup(text: string): BackupFile | null` (← S2 867–878).
  - `pdf.ts` (client-only, dynamic `await import('jspdf')`/`await import('html2canvas')`): `letterToPdfBytes(rec: OfferRecord, wm: WatermarkOpt | null): Promise<Uint8Array>` ← S3 679–715 verbatim including `safeBreak`, but creating its own off-screen stage div (source used `#pdfStage`): create, position `fixed;left:-10000px`, append to body, remove in `finally`.
  - `intake.ts`: `encRec(obj: unknown): string`, `decRec(s: string): IntakeSubmission`, `parseIntakeCode(str: string): IntakeSubmission | null` (← S3 761–770: hash/`AWM1-` handling + decode, returns null on garbage), `submissionToRecord(sub: IntakeSubmission): OfferRecord` (← S3 766–769 mapping).

- [ ] **Step 1: Failing tests** `tests/int/offers/io.int.spec.ts` for the pure parts:

```ts
import { describe, expect, test } from 'bun:test'
import { makeZip } from '@/lib/offers/zip'
import { encRec, decRec, parseIntakeCode } from '@/lib/offers/intake'
import { parseBackup } from '@/lib/offers/spreadsheet'

test('makeZip produces a valid empty-ish zip with EOCD', () => {
  const z = makeZip([{ name: 'a.txt', bytes: new TextEncoder().encode('hello') }])
  expect(z[0]).toBe(0x50); expect(z[1]).toBe(0x4b) // PK
  expect(z.length).toBeGreaterThan(100)
})

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

test('parseBackup validates shape', () => {
  expect(parseBackup('{"records":[]}')?.records).toEqual([])
  expect(parseBackup('{"nope":1}')).toBeNull()
  expect(parseBackup('garbage')).toBeNull()
})
```

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Port the five modules.** `applyImport`'s merge semantics are the subtle part — keep S2 727–762 exactly: key = normalized `employeeName|email`, existing records updated only in matched columns, status recomputed, duplicates within one import update in place.
- [ ] **Step 4: Run tests** → pass.
- [ ] **Step 5: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): storage seam, zip, spreadsheet, pdf, intake modules"`.

---

### Task 5: Global CSS port

**Files:**
- Create: `src/app/(app)/offers/offers.css` (← S1 lines 8–150, 235–290: root vars, chrome, form, tabs, tables, analysis, toast, modal)
- Create: `src/app/(app)/offers/letter.css` (← S1 lines 152–234: letter overlay, subtabs, stage toolbar/filters/table column rules, letter toolbar/options/sheet/comp-table/watermark, both `@media print` blocks)
- Modify: `src/app/(app)/offers/layout.tsx` (add the two imports)

**Interfaces:** class names stay byte-identical to the source — every component task writes `className="btn-primary"` etc. against these sheets.

- [ ] **Step 1: Transcribe the CSS.** Verbatim, with only these edits: delete rules for dropped features (`.concurrent-banner`, `.reconnect-*`, `#dataFileBtn.*`); keep the `aside{display:none}`/`.wrap{grid-template-columns:1fr!important}` overrides at S1 236–238 exactly as-is (the source hides its own sidebar — parity means we keep that); keep both print blocks including `body.printing-letter`.
- [ ] **Step 2: Import in layout** — `import './offers.css'` and `import './letter.css'` at the top of `layout.tsx`.
- [ ] **Step 3: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): port app + letter stylesheets"`.

---

### Task 6: App shell — provider, toast, modal, tab navigation

**Files:**
- Create: `src/components/offers/OffersProvider.tsx` (context + `useOffers()` hook implementing `OffersApi`)
- Create: `src/components/offers/Toast.tsx`
- Create: `src/components/offers/Modal.tsx`
- Create: `src/components/offers/OfferManager.tsx`
- Modify: `src/app/(app)/offers/page.tsx`

**Interfaces:**
- Consumes: `OffersApi` from types; `storage.ts`; `schema.ts` (`uid`, `nowIso`, `missingRequired`).
- Produces: `OffersProvider`, `useOffers(): OffersApi` — Tasks 7–9 consume; `OfferManager` renders header (`header.app` with title, ver chip, toolbar buttons New Request / Import Spreadsheet / Download Template / Export-Backup dropdown), tabbar (S1 334–340 incl. counts per S3 576–578), and the five view sections, rendering `null` placeholders for views delivered by Tasks 7–9 (wire them as they land — each later task replaces its placeholder).

**Implementation notes:**
- Records state: `useState<OfferRecord[]>([])`, hydrated in a `useEffect` from `loadRecords()` (avoids SSR/localStorage mismatch). Every mutation goes through one `commit(next: OfferRecord[])` helper that `setRecords(next)` + `persistRecords(next)`.
- `commitForm` implements S2 618–636 semantics exactly (empty new form → no-op returning null; status from `missingRequired`; unshift on create).
- `deleteRecord`/`deleteRecords`/`setStage`/`duplicateRecord` per S2 930–944, S3 465.
- Toast: port S2 882–885 as a component (message, err class, 2600ms timer). Modal: port S2 886–897 as a controlled component with `confirmDialog` wiring.
- Export/Backup dropdown (S1 314–328 minus data-file items): Export All (.xlsx), Export (.csv), Share Current, Backup (.json), Restore, Import from Code / Link. Handlers call Task 4 modules; Share Current and code-import may be stubbed with `toast('…coming in a later task', true)` ONLY if Task 9/intake wiring isn't in yet — final wiring lands in Task 10 regardless.
- Hidden file inputs for import/restore per S2 946–968.
- `page.tsx` becomes `'use client'`? No — keep the page a server component that renders `<OfferManager />`; `OfferManager` and everything under it is `'use client'`.

- [ ] **Step 1: Implement the four components.**
- [ ] **Step 2: Manual check** — `bun dev`, open `/offers`: header + tabs render, empty pipeline placeholder, New Request switches to editor view (blank placeholder), toast fires on template download, backup downloads an empty-records JSON.
- [ ] **Step 3: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): app shell — provider, toast, modal, tab nav"`.

---

### Task 7: Editor — request form, composite widgets, record list

**Files:**
- Create: `src/components/offers/RequestForm.tsx`
- Create: `src/components/offers/fields/RadioField.tsx` (radio + radio_other, ← S2 365–387)
- Create: `src/components/offers/fields/BonusField.tsx` (← S2 391–467 markup, S2 539–548 open/format sync, live previews S2 492–511)
- Create: `src/components/offers/fields/BaseWageField.tsx` (← S2 469–483, preview S2 531–537)
- Create: `src/components/offers/RecordList.tsx` (← S1 404–413 + S2 646–668)
- Modify: `src/components/offers/OfferManager.tsx` (editor view: subtabs + details subview per S1 396–432)

**Interfaces:**
- Consumes: `useOffers()`, schema/calc/format.
- Produces: `<RequestForm />` — controlled by a single `data: OfferData` state; exposes nothing to later tasks (letter view reads records via the api).

**Implementation notes:**
- React-controlled translation of the source's DOM form: one `data` object in state; `readForm` disappears (state IS the data); `writeForm` = `setData(rec.data)` on `openRecord`. Radio-other semantics per S2 574–587: value not in options + type radio_other → check Other and fill its input.
- Autosave: 600ms debounce → `api.commitForm(data, false)` (S2 613–617); Save button = `commitForm(data, true)` + missing-field marking (S2 925–929); dollar-field blur formatting per S2 908–910; bonus checkbox clear-on-uncheck per S2 911–919; editing a data field sets `letterStale` on the current record via `api.patchRecord` (S2 900–907, 920–922).
- Save-status dot, validation note, Duplicate/Delete/Print buttons per S1 415–427 + S2 930–945 (`Print` = `window.print()`).
- RecordList: search filter is `JSON.stringify(r.data).toLowerCase().includes(q)` — verbatim.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Manual check** — create a record, watch autosave dot, required-field marks on Save, bonus sections open on check and clear on uncheck, guarantee breakdown and base-wage preview compute live, duplicate/delete work, record list search filters.
- [ ] **Step 3: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): editor form, composite widgets, record list"`.

---

### Task 8: Pipeline / Hired / Archived tables + Analysis

**Files:**
- Create: `src/components/offers/StageTable.tsx` (one component, `stage` prop — markup ← S1 342–393, logic ← S3 463–507, 555–580)
- Create: `src/components/offers/AnalysisView.tsx` (← S3 623–646)
- Create: `src/components/offers/BulkToolbar.tsx` (← S1 343–352 + S3 579–614, 716–726: selection state, mass signatory assign, mass PDF zip, mass Word zip, selected CSV, delete selected, watermark toggle)
- Modify: `src/components/offers/OfferManager.tsx` (mount the three stage views + analysis; row actions navigate per S3 738–754)

**Interfaces:**
- Consumes: `useOffers()`, format (`fmtShort`), letter (`SIGNATORY`, `swapSigInHtml`, `resolveLetter`), letter-exports (email helpers, `letterDocHTML`), pdf (`letterToPdfBytes`), zip (`makeZip`), spreadsheet (`exportSelectedCsv`, `exportOneXlsx`, `downloadBlob`), storage (email pref).
- Produces: row action `letter` calls `api.openRecord(id)` + `api.showView('editor')` + `api.showSub('letter')` — Task 9's LetterView must open from exactly this path.

**Implementation notes:**
- Filters (name substring, branch select, title select) + distinct-value dropdowns per S3 471–484; selection checkboxes only on pipeline; check-all per S3 752.
- `offerDateISO` = `letter.date || created.slice(0,10)` (S3 466).
- Mass PDF/Word: iterate selected ids sequentially, name-dedupe (`base_2` style), zip, download — S3 393–402 and 716–726 verbatim; button labels carry the live count.
- Bulk signatory: dropdown + Assign per S3 604–614 including the "no rows checked → confirm assign-to-all" flow and letterHtml in-place patching via `swapSigInHtml`.
- Analysis: stat cards + monthly bar chart + breakdown table, all derived in render — no state.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Manual check** — records flow pipeline→hired→archived and back; filters and counts update; mass CSV + delete work with selection counts; analysis renders sane numbers.
- [ ] **Step 3: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): stage tables, bulk actions, analysis"`.

---

### Task 9: Letter view

**Files:**
- Create: `src/components/offers/LetterView.tsx` (markup ← S3 2–30; options panel ← S3 233–266; behavior ← S3 280–300, 433–458)
- Modify: `src/components/offers/OfferManager.tsx` (letter subtab opens LetterView; subtab click behavior per S3 759)

**Interfaces:**
- Consumes: `useOffers()`, letter.ts (everything), letter-exports, pdf, storage (email pref get/set), spreadsheet (`downloadBlob`).
- Produces: complete — Task 10 only wires the header's "Share Current".

**Implementation notes:**
- On open (from subtab or row action): resolve `L = resolveLetter(rec)` into state; if `letterEditIsCurrent(rec)` load `rec.letterHtml`, else regenerate (and toast "Details changed since your edits — letter rebuilt…" if an edit was discarded — S3 293–298).
- The sheet: `<div className="letter-content" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: html }} />` rendered from a ref-stable html string; NEVER re-render it from React while the user types. `onInput` debounces 500ms → `api.patchRecord(id, { letterHtml, letterStale: false, letter: L })` (S3 446–453).
- Options panel: build from `renderOptions`-equivalent JSX (keep the option groups/labels/values verbatim); a change on a hand-edited letter prompts the discard confirm (S3 454–458); text-ish inputs debounce regen 350ms.
- Regenerate button with confirm-if-edited (S3 435–438); watermark toggle re-renders the tile layer (S3 291, 439–442); Print adds `printing-letter` class to body then `window.print()` (S3 443); Word export + Export/Share HTML packet + Email button per S3 352–354, 386–391.
- Edit-status chip per S3 280–286.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Manual check** — letter renders with logo and comp table; options change wording live; hand-edit persists across tab switches; field edit invalidates hand-edit with toast; watermark tiles; print preview shows only the sheet; Word/HTML/email produce output.
- [ ] **Step 3: Verify + commit** — `bun run typecheck && bun run build`; commit `"feat(offers): letter view with options, editing, exports"`.

---

### Task 10: Integration — intake sync, share-current, spreadsheet import wiring, final polish

**Files:**
- Modify: `src/components/offers/OfferManager.tsx` (+ any stubs left in Tasks 6–9)
- Create: `tests/int/offers/roundtrip.int.spec.ts`

**Interfaces:** consumes everything; produces the finished app.

- [ ] **Step 1: Wire remaining flows** — spreadsheet import file input → `applyImport` → `replaceRecords` + toast with added/updated counts; Restore → `parseBackup` → confirm → `addRecords`; Share Current (header menu) → `offerPacketHTML(currentRecord)` download; Import from Code / Link modal (S3 774) → `parseIntakeCode` → `submissionToRecord` → dedupe by sid → `addRecords`; inbox polling `setInterval(2500)` + `storage` event listener in a `useEffect` (S3 771–773), respecting `importedSids`.
- [ ] **Step 2: Roundtrip test** — `tests/int/offers/roundtrip.int.spec.ts`: build a record from `EXAMPLE`, run `recordsToAoa`-equivalent export through `applyImport` on a generated workbook buffer (use `xlsx` write→read in-memory) and assert added=1 then re-import updates instead of duplicating. (This exercises the header-matching path end-to-end without a browser.)
- [ ] **Step 3: Full verification** — `bun run typecheck && bun run lint && bun test tests/int/offers && bun run build && bun run start` (spot-check `/offers` serves). Fix anything that fails.
- [ ] **Step 4: Commit** — `"feat(offers): integration — intake sync, import/restore wiring, roundtrip test"`.

---

## Self-review notes

- Spec coverage: kept-features list maps to Tasks 6–10; dropped features are named in Global Constraints so no task ports them.
- Type consistency: `OffersApi`, `LetterConfig`, and all module signatures are defined once in Task 1/2/3 Interfaces blocks; later tasks reference those names verbatim.
- The one intentional "not in this plan" item: no Playwright e2e (repo has the rig, draft 1 relies on typecheck/build/unit + manual smoke).
