import styles from './page.module.scss'
import { getLogs } from '../lib/db'
import LogList from '../components/LogList'

export default async function Home() {
  const logs = await getLogs() || [];

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>RSS to Telegram Channel Logs</h1>
      <LogList initialLogs={logs} />
    </main>
  )
}