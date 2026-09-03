'use client'

// Saved-request sidebar — markup from S1 404–413, filtering/rendering from S2 646–668.
import { useState } from 'react'

import { useOffers } from '@/components/offers/OffersProvider'

export default function RecordList() {
  const api = useOffers()
  const [query, setQuery] = useState('')

  const q = query.toLowerCase()
  // S2 649–652 — verbatim: whole-record substring match.
  const filtered = api.records.filter((r) => {
    if (!q) return true
    return JSON.stringify(r.data).toLowerCase().includes(q)
  })

  return (
    <aside>
      <div className="aside-head">
        <input
          className="search"
          id="search"
          placeholder="Search saved requests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="reclist" id="reclist">
        {filtered.length === 0 ? (
          <div className="empty">
            {api.records.length ? (
              'No matches.'
            ) : (
              <>
                No saved requests yet.
                <br />
                Fill the form or import a spreadsheet.
              </>
            )}
          </div>
        ) : (
          filtered.map((r) => {
            const d = r.data || {}
            const name = d.employeeName || d.preferredName || '(no name)'
            const sub = [d.position, d.branchName].filter(Boolean).join(' · ') || d.email || '—'
            return (
              <div
                key={r.id}
                className={'rec' + (r.id === api.currentId ? ' active' : '')}
                onClick={() => api.openRecord(r.id)}
              >
                <div className="nm">{name}</div>
                <div className="sub">{sub}</div>
                {r.status === 'complete' ? (
                  <span className="badge b-complete">Complete</span>
                ) : (
                  <span className="badge b-draft">Draft</span>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="aside-foot">
        <span>
          <span className="count-pill" id="recCount">
            {api.records.length}
          </span>{' '}
          saved
        </span>
        <span id="autosaveNote">Auto-saves to this browser</span>
      </div>
    </aside>
  )
}
