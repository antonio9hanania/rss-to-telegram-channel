import '../styles/globals.scss'
import type { Metadata } from 'next'
import { checkDatabaseConnection } from '@/lib/db';


export const metadata: Metadata = {
  title: 'RSS to Telegram Monitor',
  description: 'Monitor RSS feeds and send updates to Telegram',
}

checkDatabaseConnection().then((connected) => {
  if (connected) {
    console.log('Database connection established');
  } else {
    console.error('Failed to connect to the database');
  }
});

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