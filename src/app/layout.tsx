import '../styles/globals.scss'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RSS to Telegram Channel',
  description: 'Monitor RSS feeds and send updates to Telegram channel',
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