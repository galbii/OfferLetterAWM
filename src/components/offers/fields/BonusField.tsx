'use client'

// Q16 Bonus Structure composite — markup from S2 391–467, open/format sync from
// S2 539–548, live previews (guarantee breakdown + production) from S2 492–511.
import { useState } from 'react'
import type { ReactNode } from 'react'

import { fmtMoney, parseMoney } from '@/lib/offers/format'
import { BONUS_GROUPS } from '@/lib/offers/schema'
import type { FieldDef, OfferData } from '@/lib/offers/types'

export interface BonusFieldProps {
  field: FieldDef
  data: OfferData
  onChange: (id: string, value: string) => void
  onDollarBlur: (id: string) => void
  /** Clears every sub-field of a bonus group in one write (uncheck behaviour, S2 916). */
  onClearFields: (ids: string[]) => void
}

interface BonusItemProps {
  bonusKey: string
  label: ReactNode
  open: boolean
  onToggle: (key: string, checked: boolean) => void
  children: ReactNode
}

function BonusItem({ bonusKey, label, open, onToggle, children }: BonusItemProps) {
  return (
    <div className={'bonus-item' + (open ? ' open' : '')} data-bonus={bonusKey}>
      <label className="bchk">
        <input
          type="checkbox"
          checked={open}
          onChange={(e) => onToggle(bonusKey, e.target.checked)}
        />
        <span>{label}</span>
      </label>
      <div className="bonus-fields">{children}</div>
    </div>
  )
}

// computeGuarantee — S2 492–501
function GuaranteeBreakdown({ data }: { data: OfferData }) {
  const amtRaw = (data.bonusGuaranteeAmount || '').trim()
  const mon = parseInt((data.bonusGuaranteeMonths || '').trim(), 10)
  if (!amtRaw || !mon || mon < 1) {
    return <div className="gb-empty">Enter monthly amount &amp; # of months to see the breakdown.</div>
  }
  const shown = Math.min(mon, 12)
  const amtNum = parseMoney(amtRaw)
  const rows: ReactNode[] = []
  for (let i = 1; i <= shown; i++) {
    rows.push(
      <div className="gb-row" key={i}>
        <span>Month {i}</span>
        <span>{amtNum != null ? fmtMoney(amtNum) : amtRaw}</span>
      </div>,
    )
  }
  return (
    <>
      {rows}
      {amtNum != null && (
        <div className="gb-row gb-total">
          <span>Total ({mon} mo)</span>
          <span>{fmtMoney(amtNum * mon)}</span>
        </div>
      )}
      {amtNum != null && (
        <div className="gb-note">
          Offer letter: {fmtMoney(amtNum / 2)} every two weeks × {mon * 2} pay periods (~ {mon * 4}{' '}
          wks)
        </div>
      )}
      {mon > 12 && <div className="gb-note">Showing first 12 of {mon} months.</div>}
    </>
  )
}

// computeProduction — S2 502–511
function ProductionPreview({ data }: { data: OfferData }) {
  const a = (data.bonusProductionAmount || '').trim()
  const v = (data.bonusProductionVolume || '').trim()
  const m = (data.bonusProductionMaxMonths || '').trim()
  if (!a && !v && !m) return <div className="prod-preview" style={{ display: 'none' }} />
  const aN = parseMoney(a)
  const vN = parseMoney(v)
  const aS = aN != null ? fmtMoney(aN) : a || '___'
  const vS = vN != null ? fmtMoney(vN) : v || '___'
  const mS = m || '___'
  return (
    <div className="prod-preview" style={{ display: 'block' }}>
      {`Production bonus of ${aS} if ${vS} of production is achieved within the first ${mS} month(s) of onboarding.`}
    </div>
  )
}

export default function BonusField({
  field,
  data,
  onChange,
  onDollarBlur,
  onClearFields,
}: BonusFieldProps) {
  // syncBonusUI (S2 539–548): a group is open when any sub-field holds a value.
  // The extra state keeps a hand-checked-but-still-empty group open.
  const [pinned, setPinned] = useState<Record<string, boolean>>({})

  const hasVal = (key: string): boolean =>
    (BONUS_GROUPS[key] || []).some((id) => (data[id] || '').trim() !== '')
  const isOpen = (key: string): boolean => Boolean(pinned[key]) || hasVal(key)

  // S2 911–919 — unchecking clears every sub-field of the group.
  const toggle = (key: string, checked: boolean): void => {
    if (checked) {
      setPinned((p) => ({ ...p, [key]: true }))
      return
    }
    setPinned((p) => {
      const next = { ...p }
      delete next[key]
      return next
    })
    onClearFields(BONUS_GROUPS[key] || [])
  }

  const text = (id: string, placeholder: string, dollar?: boolean) => (
    <input
      type="text"
      placeholder={placeholder}
      value={data[id] || ''}
      onChange={(e) => onChange(id, e.target.value)}
      onBlur={dollar ? () => onDollarBlur(id) : undefined}
    />
  )

  const num = (id: string, placeholder: string, min: string, max?: string) => (
    <input
      type="number"
      min={min}
      max={max}
      placeholder={placeholder}
      value={data[id] || ''}
      onChange={(e) => onChange(id, e.target.value)}
    />
  )

  return (
    <div className="bonus" data-fid={field.id}>
      <BonusItem bonusKey="signon" label="Sign-On Bonus" open={isOpen('signon')} onToggle={toggle}>
        <div className="prod-inputs">
          <div className="bf">
            <span className="bf-lbl">Month 1 amount</span>
            {text('bonusSignOnAmount', '$ amount', true)}
          </div>
          <div className="bf">
            <span className="bf-lbl">Month 2 amount</span>
            {text('bonusSignOnMonth2', '$ (optional)', true)}
          </div>
          <div className="bf">
            <span className="bf-lbl">Month 3 amount</span>
            {text('bonusSignOnMonth3', '$ (optional)', true)}
          </div>
        </div>
        <div className="bf-note">
          Enter Month 1 only for a one-time sign-on, or add Month 2 / Month 3 for a staged sign-on.
        </div>
      </BonusItem>

      <BonusItem bonusKey="guarantee" label="Guarantee" open={isOpen('guarantee')} onToggle={toggle}>
        <div className="guar-grid">
          <div className="guar-inputs">
            <div className="bf">
              <span className="bf-lbl">Amount / month</span>
              {text('bonusGuaranteeAmount', '$ per month', true)}
            </div>
            <div className="bf">
              <span className="bf-lbl"># of months</span>
              {num('bonusGuaranteeMonths', 'e.g. 3', '1', '12')}
            </div>
          </div>
          <div className="guar-breakdown">
            <GuaranteeBreakdown data={data} />
          </div>
        </div>
      </BonusItem>

      <BonusItem bonusKey="pnl" label="P&L Credit" open={isOpen('pnl')} onToggle={toggle}>
        <div className="bf">
          <span className="bf-lbl">Credit 1 — amount</span>
          {text('bonusPnlAmount', '$ amount', true)}
        </div>
        <div className="bf">
          <span className="bf-lbl">Credit 1 — month applies</span>
          {text('bonusPnlMonth', 'e.g. September')}
        </div>
        <div className="bf">
          <span className="bf-lbl">Credit 2 — amount</span>
          {text('bonusPnlAmount2', '$ (optional)', true)}
        </div>
        <div className="bf">
          <span className="bf-lbl">Credit 2 — month applies</span>
          {text('bonusPnlMonth2', 'e.g. October')}
        </div>
        <div className="bf">
          <span className="bf-lbl">Credit 3 — amount</span>
          {text('bonusPnlAmount3', '$ (optional)', true)}
        </div>
        <div className="bf">
          <span className="bf-lbl">Credit 3 — month applies</span>
          {text('bonusPnlMonth3', 'e.g. November')}
        </div>
        <div className="bf" style={{ flexBasis: '100%' }}>
          <span className="bf-lbl">How the P&amp;L credit is earned (note)</span>
          <textarea
            rows={2}
            placeholder="Spell out how the P&L credit is earned and any conditions — shown in the letter's How It Works column."
            value={data.bonusPnlNote || ''}
            onChange={(e) => onChange('bonusPnlNote', e.target.value)}
          />
        </div>
      </BonusItem>

      <BonusItem
        bonusKey="production"
        label="Production Bonus"
        open={isOpen('production')}
        onToggle={toggle}
      >
        <div className="prod-inputs">
          <div className="bf">
            <span className="bf-lbl">Bonus amount</span>
            {text('bonusProductionAmount', '$100,000', true)}
          </div>
          <div className="bf">
            <span className="bf-lbl">Volume to achieve</span>
            {text('bonusProductionVolume', '$2,000,000', true)}
          </div>
          <div className="bf">
            <span className="bf-lbl">Max months to achieve</span>
            {num('bonusProductionMaxMonths', '5', '1')}
          </div>
        </div>
        <ProductionPreview data={data} />
      </BonusItem>

      <BonusItem
        bonusKey="perfile"
        label="Per File Bonus"
        open={isOpen('perfile')}
        onToggle={toggle}
      >
        <div className="bf">
          <span className="bf-lbl">Amount ($)</span>
          {text('bonusPerFileDollar', '$ per file', true)}
        </div>
        <div className="bf">
          <span className="bf-lbl">Basis points</span>
          <div className="unit-input">
            {num('bonusPerFileBps', '25', '0')}
            <span className="unit">bps</span>
          </div>
        </div>
        <div className="bf-note">Enter a dollar amount, bps, or both.</div>
      </BonusItem>

      <BonusItem bonusKey="override" label="Override" open={isOpen('override')} onToggle={toggle}>
        <div className="bf">
          <span className="bf-lbl">Basis points</span>
          <div className="unit-input">
            {num('bonusOverrideBps', '50', '0')}
            <span className="unit">bps</span>
          </div>
        </div>
      </BonusItem>

      <BonusItem bonusKey="accel" label="Accelerated Bps" open={isOpen('accel')} onToggle={toggle}>
        <div className="bf">
          <span className="bf-lbl">Month 1</span>
          <div className="unit-input">
            {num('bonusAccelBps1', 'e.g. 250', '0')}
            <span className="unit">bps</span>
          </div>
        </div>
        <div className="bf">
          <span className="bf-lbl">Month 2</span>
          <div className="unit-input">
            {num('bonusAccelBps2', 'optional', '0')}
            <span className="unit">bps</span>
          </div>
        </div>
        <div className="bf">
          <span className="bf-lbl">Month 3</span>
          <div className="unit-input">
            {num('bonusAccelBps3', 'optional', '0')}
            <span className="unit">bps</span>
          </div>
        </div>
      </BonusItem>
    </div>
  )
}
