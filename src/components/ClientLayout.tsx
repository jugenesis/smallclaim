'use client'

import '@/styles/globals.css'
import Navigation from '@/components/Navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="main-content">
        {children}
      </div>
      <style jsx>{`
        .main-content {
          padding-bottom: 80px;
        }
        @media (min-width: 1024px) {
          .main-content {
            margin-left: 240px;
            padding-bottom: 0;
          }
        }
      `}</style>
    </>
  )
}