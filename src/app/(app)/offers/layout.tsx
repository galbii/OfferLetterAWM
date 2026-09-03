import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Offer & New Hire Request Manager',
  robots: { index: false, follow: false },
}

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
