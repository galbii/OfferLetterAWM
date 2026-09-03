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

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

/** Stored on a record: a deep-partial override of the defaults (deepAssign semantics). */
export type StoredLetterConfig = DeepPartial<LetterConfig>

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
  /**
   * Register (or clear, with null) the form's pending-autosave flush.
   * `openRecord` / `newRecord` run it before switching, which is the source's
   * `if(dirty)commitCurrent(true)` guard (S2 670, 680).
   */
  registerPendingFlush(fn: (() => void) | null): void
  /** Removes the record; the CALLER toasts (S2 934 "Request deleted." vs S3 748 "Deleted."). */
  deleteRecord(id: string): void
  /** Bulk removal; the CALLER toasts (S3 737). */
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
  /**
   * S3 292–293 (`currentLetterRecord` + `openLetter`): flush the form's pending
   * edits, then show the letter sub-tab — or toast when there is no record yet.
   */
  openLetter(): void
}
