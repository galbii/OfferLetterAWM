'use client'

// Minimal placeholder context for the offers app. The real provider (Task 6)
// supersedes this file at merge — the contract is `OffersApi` either way.
import { createContext, useContext } from 'react'

import type { OffersApi } from '@/lib/offers/types'

export const OffersContext = createContext<OffersApi | null>(null)

export function useOffers(): OffersApi {
  const api = useContext(OffersContext)
  if (!api) throw new Error('useOffers must be used inside an OffersProvider')
  return api
}
