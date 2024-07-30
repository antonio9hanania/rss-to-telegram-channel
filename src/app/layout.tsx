import './globals.css'
import { Inter } from 'next/font/google'
import { startRssMonitor } from '@/lib/rssMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RSS to Telegram Monitor',
  description: 'Monitor RSS feeds and send updates to Telegram',
}

startRssMonitor(); // Start the monitor when the server starts

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}