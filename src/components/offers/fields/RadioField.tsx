'use client'

// Radio / radio_other control — ported from S2 365–387 (renderField radio branch)
// plus the radio-other read/write semantics of S2 574–587.
import { useState } from 'react'

import type { FieldDef } from '@/lib/offers/types'

export interface RadioFieldProps {
  field: FieldDef
  value: string
  onChange: (value: string) => void
}

export default function RadioField({ field, value, onChange }: RadioFieldProps) {
  // The DOM app kept "Other is selected" in the radio itself; here it needs a
  // little local state so an empty Other stays checked while it is being typed.
  const [otherPicked, setOtherPicked] = useState(false)

  const options = field.options || []
  const isOther = field.type === 'radio_other'
  // Value not in options + type radio_other -> Other is checked and holds it. (S2 578–586)
  const otherActive = isOther && (otherPicked || (value !== '' && !options.includes(value)))

  return (
    <div className={'radios' + (field.inline ? ' inline' : '')}>
      {options.map((o) => (
        <label className="radio" key={o}>
          <input
            type="radio"
            name={field.id}
            value={o}
            checked={!otherActive && value === o}
            onChange={() => {
              setOtherPicked(false)
              onChange(o)
            }}
          />
          <span>{o}</span>
        </label>
      ))}

      {isOther && (
        <label className={'radio other-wrap' + (field.otherLong ? ' other-wrap-long' : '')}>
          <input
            type="radio"
            name={field.id}
            value="__other__"
            checked={otherActive}
            onChange={() => {
              setOtherPicked(true)
              onChange('')
            }}
          />
          <span className="other-lbl">Other:</span>
          {field.otherLong ? (
            <textarea
              className="other-input other-long"
              placeholder="please specify"
              rows={2}
              value={otherActive ? value : ''}
              onChange={(e) => {
                setOtherPicked(true)
                onChange(e.target.value)
              }}
            />
          ) : (
            <input
              type="text"
              className="other-input"
              placeholder="please specify"
              value={otherActive ? value : ''}
              onChange={(e) => {
                setOtherPicked(true)
                onChange(e.target.value)
              }}
            />
          )}
        </label>
      )}
    </div>
  )
}
