'use client'

// Port of S2 881–885. One instance for the whole app; each new message restarts
// the 2600 ms timer. When hidden the class is exactly `toast` (the `err`
// modifier drops with `show`, as in the source).

import React, { useEffect, useState } from 'react'

export interface ToastState {
  msg: string
  err: boolean
}

export default function Toast({ state }: { state: ToastState | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!state) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(t)
  }, [state])

  const cls = visible ? 'toast show' + (state && state.err ? ' err' : '') : 'toast'

  return <div className={cls}>{state ? state.msg : ''}</div>
}
