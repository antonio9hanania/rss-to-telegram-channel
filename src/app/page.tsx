// src/app/page.tsx
import styles from "@/styles/Home.module.scss";
import { getMonitorStatus } from "@/lib/rssMonitor";
import { getRssFeedStatus } from "@/lib/db";
import StatusDisplay from "@/components/StatusDisplay";
import Link from "next/link";

export default async function Home() {
  const monitorStatus = getMonitorStatus();
  const feedStatus = await getRssFeedStatus();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>RSS to Telegram Channel Monitor</h1>
        <StatusDisplay monitorStatus={monitorStatus} feedStatus={feedStatus} />
        <div className={styles.links}>
          <Link href="/logs" className={styles.link}>
            View Logs
          </Link>
          <Link href="/processed-items" className={styles.link}>
            View Processed Items
          </Link>
        </div>
      </div>
    </main>
  );
}
