'use client'

import { createContext, useContext } from 'react'

import type { OffersApi } from '@/lib/offers/types'

/** Minimal placeholder — Task 6's full provider supersedes this file at merge. */
export const OffersContext = createContext<OffersApi | null>(null)

export function useOffers(): OffersApi {
  const ctx = useContext(OffersContext)
  if (!ctx) throw new Error('useOffers must be used inside an OffersProvider')
  return ctx
}
