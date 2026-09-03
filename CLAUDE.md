# OfferLetterAWM — AI Agent Guide

**Offer & New Hire Request Manager** for All Western Mortgage: an internal HR
tool that takes new-hire requests (42-question comp/equipment/setup form),
generates legally-worded offer letters (PDF / Word / HTML / email), and tracks
a Pipeline → Hired → Archived funnel with analytics.

Built on Payload CMS v3.88 + Next.js 15 App Router + Bun. The app serves at
**`/`**; the Payload CMS (admin at `/admin`, pages at their slugs, posts,
search) still exists underneath and is untouched by app work.

## The one rule that outranks everything: PARITY

This app is a **port** of a standalone HTML app. The original's application
code is committed at `docs/superpowers/specs/offer-manager-v1.6-source/`
(3 files: markup+CSS, form/storage logic, letter/pipeline logic). Letter
language, compensation math, defaults, and edge-case behavior were ported
**character-for-character** and verified by differential testing.

- Never "improve" letter wording, comp math, or defaults without an explicit
  request — the letters carry legal language (sign-on repayment, guarantee
  terms). When behavior is ambiguous, the source files win.
- Most `src/lib/offers/*` functions carry `// S2 <line>` / `// S3 <line>`
  comments mapping back to the source. Keep them accurate when editing.
- Design spec + port history: `docs/superpowers/specs/2026-09-03-offer-manager-port-design.md`
  and `docs/superpowers/plans/2026-09-03-offer-manager-port.md`.

## Architecture

```
src/app/(app)/            → the Offer Manager at "/" (own root layout; imports
                            offers.css + letter.css — plain global CSS, verbatim
                            from the source app; NOT Tailwind, NOT CSS modules)
src/app/(frontend)/       → CMS site (slugs, posts, search) — template code
src/app/(payload)/        → /admin — generated Payload UI
src/lib/offers/           → ALL app logic, framework-free, unit-tested
src/components/offers/    → React UI ('use client'), consumes lib via OffersApi
```

### `src/lib/offers/` — pure logic (no React, server-import-safe)

| Module | Owns |
|---|---|
| `types.ts` | Frozen contracts: `OfferRecord`, `LetterConfig`, `OffersApi`, `FieldDef` |
| `schema.ts` | The 68 field definitions (42 questions, groups A–F), validation, xlsx headers |
| `format.ts` | Money/date/address/esc utilities |
| `calc.ts` | Base-wage conversion, guarantee math, bonus sentence builders |
| `letter.ts` | Letter language constants + HTML generation (`resolveLetter`, `generateLetterHTML`) |
| `letter-exports.ts` | Word `.doc` + shareable HTML packet + Outlook email helpers |
| `logo.ts` | Base64 logo data-URI (embedded in exports so files work offline) |
| `spreadsheet.ts` | xlsx/CSV import+export, template workbook, backup/restore (dynamic `import('xlsx')`) |
| `pdf.ts` | Letter → paginated PDF via jspdf+html2canvas (client-only, dynamic imports) |
| `zip.ts` | Hand-rolled STORE zip writer (mass-export bundles) |
| `intake.ts` | Intake code/link encode/decode |
| `storage.ts` | **THE persistence seam** — see below |

### `src/components/offers/` — UI

`OffersProvider` owns all state and implements the `OffersApi` context
(records, currentId, view/sub navigation, toasts, confirm dialogs, autosave
flush, intake polling). Every component consumes `useOffers()`; **nothing
mutates records around the API**. `OfferManager` is the shell (header, tabs,
view switching). Views: `RequestForm`+`fields/*`+`RecordList` (editor),
`StageTable`×3 + `BulkToolbar` (pipeline/hired/archived), `AnalysisView`,
`LetterView` (contenteditable letter sheet — an imperative island rendered
once via `dangerouslySetInnerHTML`; never re-render it while the user types).

## Data & persistence

**Draft-1 storage is browser localStorage** — per-device, no server. Keys are
FROZEN for backward compat with the original app's backups:
`onhr_records_v121` (records), `onhr_email_client`, `onhr_imported_sids`,
`onhr_inbox`. Record shape (also frozen):

```ts
{ id, data: Record<fieldId, string>, status: 'complete'|'draft',
  stage?: 'pipeline'|'hired'|'archived', created, updated,
  letter?, letterHtml?, letterStale? }
```

**To move to the database later:** replace the internals of
`src/lib/offers/storage.ts` (`loadRecords`/`persistRecords`) with Payload
Local API calls against an `offer-requests` collection. Nothing else should
need to change. Mongo (Atlas) is already wired for the CMS via
`DATABASE_URL`.

## Commands

| Command | Use |
|---|---|
| `bun dev` | Dev server → http://localhost:3000 (app) / /admin (CMS) |
| `bun run build` | Production build. MUST PASS before work is complete. Needs a reachable `DATABASE_URL`. |
| `bun run typecheck` | `tsc --noEmit` — lint does NOT typecheck |
| `bun test tests/int/offers/` | The app's unit tests (schema/calc/letter/io/roundtrip) |
| `bun run test:e2e` | Playwright smoke of the app at `/` |
| `bun run generate:types` | After Payload schema changes only |

Bun only — npm/pnpm/yarn desync `bun.lock`. `xlsx` is pinned to the SheetJS
CDN tarball (npm's is stale + vulnerable) — don't "upgrade" it to npm.

## Common tasks

**Add/change a form question:** edit `src/lib/offers/schema.ts` (FieldDef —
`col` header powers xlsx import/export; `req` powers validation), then check
whether the letter should react to it (`letter.ts` rows / `calc.ts`
builders). Update `tests/int/offers/` counts (FIELDS length, required-count).

**Change letter language:** `letter.ts` constants (`LB`, `PATH`, `CLOSING`,
expect-bullets) or the row builders in `calc.ts`. This is the legal-language
zone — get explicit sign-off, and update `letter.int.spec.ts`.

**Add a signatory:** `SIGNATORY` map in `letter.ts` (key + name + title) —
flows to options panel, bulk-assign, and `swapSigInHtml` automatically.

**Styling:** the app's look lives in `src/app/(app)/offers.css` +
`letter.css` — plain CSS, verbatim class names from the source (generated
letter HTML references them as strings). Don't Tailwind-ify; don't rename
classes. `letter.css` includes `@media print` rules the PDF/print path
depends on. (Tailwind + `@/utilities/ui` `cn()` still apply to CMS-side code.)

## Gotchas

- **`/` shadows any CMS Page with slug `home`** — the app owns the root. CMS
  pages live at their other slugs.
- LetterView's hand-edit invalidation: editing any form field sets
  `letterStale`; the letter rebuilds (discarding hand edits, with a toast)
  only when the letter subview is opened. Don't trigger resolve/regen from
  anywhere else.
- `RequestForm` autosaves on a 600ms debounce; record switches flush through
  `registerPendingFlush` — preserve that path if touching navigation.
- Bulk operations must batch: use `patchRecords` (single persist), never
  `patchRecord` in a loop.
- `applyImport` is pure and must stay pure (returns new arrays; the provider
  merges against `recordsRef.current` to avoid racing the intake poller).
- Letter/PDF/spreadsheet functions are client-only at call time; lib modules
  must stay import-safe on the server (dynamic imports inside functions,
  `typeof window` guards in storage.ts).
- Exported Word/HTML letters must embed the logo as a data URI (`logo.ts`) —
  a URL path breaks once the file leaves the browser.
- Strict TS, no `as any`. No `process.env` outside `src/lib/env.ts`.

## CMS / template layer (unchanged from the Payload starter)

Env flows through `.env.local` → `src/lib/env.ts` (import `env`, never read
`process.env`; use `||` not `??` for optional vars). `DATABASE_URL` must
include the db name. Payload rules: pass `overrideAccess: false` with `user`;
pass `req` to nested Local API calls in hooks; guard hook loops with
`context` flags. Local storage vs R2 via `STORAGE_MODE`. `NEXT_PUBLIC_*` vars
are baked at build time (Dockerfile needs matching ARG+ENV). Full details:
`.env.example` and `README.md`.
