import '../styles/globals.scss'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RSS to Telegram Monitor',
  description: 'Monitor RSS feeds and send updates to Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}