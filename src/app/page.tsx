import { Suspense } from "react";
import styles from "@/styles/Home.module.scss";
import Link from "next/link";
import { startRssMonitor } from "@/lib/rssMonitor";
import StatusDisplayWrapper from "@/components/StatusDisplayWrapper";

export default function Home() {
  startRssMonitor();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>RSS to Telegram Channel Monitor</h1>
        <Suspense fallback={<div>Loading status...</div>}>
          <StatusDisplayWrapper />
        </Suspense>
        <div className={styles.links}>
          <Link href="/logs" className={styles.link}>
            View Logs
          </Link>
          <Link href="/db-view" className={styles.link}>
            View Processed Items
          </Link>
        </div>
      </div>
    </main>
  );
}
