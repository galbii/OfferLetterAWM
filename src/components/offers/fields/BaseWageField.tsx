'use client'

// Q15 Base Wage composite — markup from S2 469–483, live preview from S2 531–537.
import { baseWageCalc, baseWageWYR } from '@/lib/offers/calc'
import type { FieldDef, OfferData } from '@/lib/offers/types'

export interface BaseWageFieldProps {
  field: FieldDef
  data: OfferData
  onChange: (id: string, value: string) => void
  onDollarBlur: (id: string) => void
}

export default function BaseWageField({ field, data, onChange, onDollarBlur }: BaseWageFieldProps) {
  // computeBaseWage (S2 531–537): only the four base inputs feed the preview.
  const calc = baseWageCalc({
    baseHourly: data.baseHourly || '',
    baseHoursWeek: data.baseHoursWeek || '',
    baseMonthly: data.baseMonthly || '',
    baseAnnual: data.baseAnnual || '',
  })
  const previewText = calc
    ? 'Offer letter reads: ' +
      baseWageWYR({
        baseHourly: data.baseHourly || '',
        baseHoursWeek: data.baseHoursWeek || '',
        baseMonthly: data.baseMonthly || '',
        baseAnnual: data.baseAnnual || '',
      })
    : ''

  return (
    <div className="basewage">
      <div className="bw-inputs">
        <div className="bf">
          <span className="bf-lbl">Hourly rate</span>
          <input
            type="text"
            placeholder="$ / hour"
            value={data.baseHourly || ''}
            onChange={(e) => onChange('baseHourly', e.target.value)}
          />
        </div>
        <div className="bf">
          <span className="bf-lbl">Hours / week</span>
          <input
            type="number"
            min="1"
            max="80"
            step="0.5"
            placeholder="40"
            value={data.baseHoursWeek || ''}
            onChange={(e) => onChange('baseHoursWeek', e.target.value)}
          />
        </div>
        <div className="bf">
          <span className="bf-lbl">Monthly</span>
          <input
            type="text"
            placeholder="$ / month"
            value={data.baseMonthly || ''}
            onChange={(e) => onChange('baseMonthly', e.target.value)}
            onBlur={() => onDollarBlur('baseMonthly')}
          />
        </div>
        <div className="bf">
          <span className="bf-lbl">Annually</span>
          <input
            type="text"
            placeholder="$ / year"
            value={data.baseAnnual || ''}
            onChange={(e) => onChange('baseAnnual', e.target.value)}
            onBlur={() => onDollarBlur('baseAnnual')}
          />
        </div>
      </div>
      <div className="bw-preview" style={{ display: calc ? 'block' : 'none' }} data-fid={field.id}>
        {previewText}
      </div>
    </div>
  )
}
