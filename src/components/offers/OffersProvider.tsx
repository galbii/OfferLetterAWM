'use client'

// The app-shell state container. Owns the record list, the current selection,
// view/sub-tab routing, the single toast and the confirm modal, and is the only
// place that writes to localStorage.
//
// Ported behaviour: S2 618–636 (commitCurrent), 670–686 (openRecord/newRecord),
// 930–944 (delete / duplicate), 881–897 (toast / modal), S3 465 (setStage).

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { missingRequired, nowIso, uid } from '@/lib/offers/schema'
import { loadRecords, persistRecords } from '@/lib/offers/storage'
import type {
  EditorSub,
  OfferData,
  OfferRecord,
  OffersApi,
  RecordStatus,
  Stage,
  View,
} from '@/lib/offers/types'

import Modal from './Modal'
import Toast, { type ToastState } from './Toast'

interface ConfirmState {
  title: string
  msg: string
  onYes: () => void
  onCancel?: () => void
}

const OffersContext = createContext<OffersApi | null>(null)

export function useOffers(): OffersApi {
  const ctx = useContext(OffersContext)
  if (!ctx) throw new Error('useOffers() must be used inside <OffersProvider>')
  return ctx
}

function scrollTop(): void {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
}

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<OfferRecord[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [view, setView] = useState<View>('pipeline')
  const [sub, setSub] = useState<EditorSub>('letter')
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  // Mirrors of the state that mutators read synchronously, so a handler never
  // works from a stale closure.
  const recordsRef = useRef<OfferRecord[]>([])
  const currentIdRef = useRef<string | null>(null)

  // Records hydrate here, never during SSR render — localStorage does not exist
  // on the server and an initial mismatch would break hydration.
  useEffect(() => {
    const loaded = loadRecords()
    recordsRef.current = loaded
    setRecords(loaded)
  }, [])

  const toast = useCallback((msg: string, err?: boolean) => {
    setToastState({ msg, err: Boolean(err) })
  }, [])

  /** The single write path: state + localStorage, together. */
  const commit = useCallback(
    (next: OfferRecord[]) => {
      recordsRef.current = next
      setRecords(next)
      if (!persistRecords(next)) toast('Could not save to browser storage.', true)
    },
    [toast],
  )

  const setCurrent = useCallback((id: string | null) => {
    currentIdRef.current = id
    setCurrentId(id)
  }, [])

  const showView = useCallback((v: View) => {
    setView(v)
    scrollTop()
  }, [])

  const showSub = useCallback((s: EditorSub) => {
    setSub(s)
    scrollTop()
  }, [])

  // S2 618–636 (commitCurrent). `manual` is the source's `!isAuto`.
  const commitForm = useCallback(
    (d: OfferData, manual: boolean): string | null => {
      const anyData = Object.values(d).some((v) => v && String(v).trim() !== '')
      const status: RecordStatus = missingRequired(d).length === 0 ? 'complete' : 'draft'
      const list = recordsRef.current
      const cur = currentIdRef.current

      if (cur) {
        const idx = list.findIndex((r) => r.id === cur)
        if (idx >= 0) {
          const next = list.slice()
          next[idx] = { ...next[idx], data: d, status, updated: nowIso() }
          commit(next)
        }
        if (manual) toast('Request saved')
        return cur
      }

      // Never create a record for an untouched new form.
      if (!anyData) return null

      const id = uid()
      const now = nowIso()
      commit([{ id, data: d, status, created: now, updated: now }, ...list])
      setCurrent(id)
      if (manual) toast('Request saved')
      return id
    },
    [commit, setCurrent, toast],
  )

  // S2 670–678. View switching stays with the caller (S3 742 does
  // showView → openRecord → showSub).
  const openRecord = useCallback(
    (id: string) => {
      if (!recordsRef.current.some((r) => r.id === id)) return
      setCurrent(id)
      scrollTop()
    },
    [setCurrent],
  )

  // S2 679–685 plus S3 758: "+ New Request" always lands on the details sub-tab.
  const newRecord = useCallback(() => {
    setCurrent(null)
    setView('editor')
    setSub('details')
    scrollTop()
  }, [setCurrent])

  // S3 748. The editor's own delete (S2 936–939) toasts "Request deleted." —
  // that caller re-toasts after this returns.
  const deleteRecord = useCallback(
    (id: string) => {
      commit(recordsRef.current.filter((r) => r.id !== id))
      if (currentIdRef.current === id) setCurrent(null)
      toast('Deleted.')
    },
    [commit, setCurrent, toast],
  )

  // S3 737 (bulk delete from the pipeline table).
  const deleteRecords = useCallback(
    (ids: string[]) => {
      commit(recordsRef.current.filter((r) => ids.indexOf(r.id) < 0))
      if (currentIdRef.current && ids.indexOf(currentIdRef.current) >= 0) setCurrent(null)
      toast('Deleted ' + ids.length + ' record' + (ids.length !== 1 ? 's' : '') + '.')
    },
    [commit, setCurrent, toast],
  )

  // S2 940–944. The caller commits any pending edit first, then hands us the
  // form values to copy.
  const duplicateRecord = useCallback(
    (d: OfferData) => {
      const anyData = Object.values(d).some((v) => v && String(v).trim() !== '')
      if (!anyData) {
        toast('Nothing to duplicate.', true)
        return
      }
      const copy: OfferData = { ...d }
      copy.employeeName = (copy.employeeName || '') + ' (copy)'
      const id = uid()
      const now = nowIso()
      commit([
        {
          id,
          data: copy,
          status: missingRequired(copy).length ? 'draft' : 'complete',
          created: now,
          updated: now,
        },
        ...recordsRef.current,
      ])
      setCurrent(id)
      toast('Duplicated.')
    },
    [commit, setCurrent, toast],
  )

  // S3 465.
  const setStage = useCallback(
    (id: string, stage: Stage) => {
      const list = recordsRef.current
      const idx = list.findIndex((r) => r.id === id)
      if (idx < 0) return
      const next = list.slice()
      next[idx] = { ...next[idx], stage }
      commit(next)
      const lbl = stage === 'pipeline' ? 'Pipeline' : stage === 'hired' ? 'Hired' : 'Archived'
      toast('Moved to ' + lbl + '.')
    },
    [commit, toast],
  )

  const addRecords = useCallback(
    (recs: OfferRecord[]) => {
      if (!recs.length) return
      commit([...recs, ...recordsRef.current])
    },
    [commit],
  )

  const replaceRecords = useCallback(
    (recs: OfferRecord[]) => {
      commit(recs)
    },
    [commit],
  )

  const patchRecord = useCallback(
    (id: string, patch: Partial<OfferRecord>) => {
      const list = recordsRef.current
      const idx = list.findIndex((r) => r.id === id)
      if (idx < 0) return
      const next = list.slice()
      next[idx] = { ...next[idx], ...patch, id: next[idx].id }
      commit(next)
    },
    [commit],
  )

  // S2 895–897 (confirmModal).
  const confirmDialog = useCallback(
    (title: string, msg: string, onYes: () => void, onCancel?: () => void) => {
      setConfirm({ title, msg, onYes, onCancel })
    },
    [],
  )

  const api = useMemo<OffersApi>(
    () => ({
      records,
      currentId,
      view,
      sub,
      commitForm,
      openRecord,
      newRecord,
      deleteRecord,
      deleteRecords,
      duplicateRecord,
      setStage,
      addRecords,
      replaceRecords,
      patchRecord,
      toast,
      confirmDialog,
      showView,
      showSub,
    }),
    [
      records,
      currentId,
      view,
      sub,
      commitForm,
      openRecord,
      newRecord,
      deleteRecord,
      deleteRecords,
      duplicateRecord,
      setStage,
      addRecords,
      replaceRecords,
      patchRecord,
      toast,
      confirmDialog,
      showView,
      showSub,
    ],
  )

  const closeConfirm = useCallback(() => setConfirm(null), [])

  return (
    <OffersContext.Provider value={api}>
      {children}
      <Toast state={toastState} />
      <Modal
        open={confirm !== null}
        title={confirm ? confirm.title : 'Notice'}
        onBackdrop={closeConfirm}
        foot={
          <>
            <button
              className="btn-light"
              onClick={() => {
                const c = confirm
                closeConfirm()
                if (c && c.onCancel) c.onCancel()
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                const c = confirm
                closeConfirm()
                if (c) c.onYes()
              }}
            >
              Continue
            </button>
          </>
        }
      >
        <p>{confirm ? confirm.msg : ''}</p>
      </Modal>
    </OffersContext.Provider>
  )
}
