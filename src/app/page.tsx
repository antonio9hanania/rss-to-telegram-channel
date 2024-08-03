import styles from "@/styles/Home.module.scss";
import Link from "next/link";
import { getMonitorStatus } from "@/lib/rssMonitor";
import { getRssFeedStatus } from "@/lib/db";
import StatusDisplayWrapper from "@/components/StatusDisplayWrapper";

export default async function Home() {
  const initialMonitorStatus = getMonitorStatus();
  const initialFeedStatus = await getRssFeedStatus();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>RSS to Telegram Channel Monitor</h1>
        <StatusDisplayWrapper
          initialMonitorStatus={initialMonitorStatus}
          initialFeedStatus={initialFeedStatus}
        />
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
