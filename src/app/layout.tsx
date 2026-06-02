import type { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Small Claims Automation',
  description: 'Automates the California small claims process for dental lab accounts receivable recovery.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}