import styles from './page.module.scss';
import { getMonitorStatus } from '@/lib/rssMonitor';
import { getRssFeedStatus } from '@/lib/db';
import StatusDisplay from '@/components/StatusDisplay';
import MonitorControls from '@/components/MonitorControls';

export default async function Home() {
  const monitorStatus = getMonitorStatus();
  const feedStatus = await getRssFeedStatus();

  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>RSS to Telegram Channel Monitor</h1>
        <StatusDisplay monitorStatus={monitorStatus} feedStatus={feedStatus} />
        <MonitorControls isRunning={monitorStatus.isRunning} />
      </div>
    </main>
  );
}
