// Regenerates src/lib/offers/logo.ts from public/offers/awm-logo.png.
// The letterhead must be an inline data URI (S3 34): generated Word docs and
// shareable HTML packets are opened from disk or an email client, where a
// root-relative asset path resolves to nothing.
//
//   node scripts/gen-offers-logo.mjs

import { readFileSync, statSync, writeFileSync } from 'node:fs'

const PNG = 'public/offers/awm-logo.png'
const OUT = 'src/lib/offers/logo.ts'

const bytes = statSync(PNG).size
const b64 = readFileSync(PNG).toString('base64')

writeFileSync(
  OUT,
  `// Generated from ${PNG} (${bytes.toLocaleString('en-US')} bytes) — do not hand-edit.
// Source parity: S3 34 defined the AWM letterhead as an inline base64 data URI so that
// generated letters (Word .doc exports, shareable HTML packets, print/PDF) render the
// logo when opened from disk or an email client, where a root-relative URL is dead.
//
// Regenerate with \`node scripts/gen-offers-logo.mjs\` after replacing the PNG.
export const AWM_LOGO_DATA_URI = 'data:image/png;base64,${b64}'
`,
)

console.log(`wrote ${OUT} (${bytes} byte PNG → ${b64.length} base64 chars)`)
