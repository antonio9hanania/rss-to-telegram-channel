import styles from './StatusDisplay.module.scss';
import { RssFeedStatus } from '@/lib/db';

interface StatusDisplayProps {
  monitorStatus: {
    isRunning: boolean;
    lastCheckTime: Date | null;
  };
  feedStatus: RssFeedStatus;
}

 function StatusDisplay({ monitorStatus, feedStatus }: StatusDisplayProps) {
  return (
    <div className={styles.statusCard}>
      <h2 className={styles.subtitle}>Monitor Status</h2>
      <p className={styles.statusItem}>Status: {monitorStatus.isRunning ? 'Running' : 'Stopped'}</p>
      <p className={styles.statusItem}>Last Check: {monitorStatus.lastCheckTime ? monitorStatus.lastCheckTime.toLocaleString() : 'Never'}</p>
      <h2 className={styles.subtitle}>Feed Status</h2>
      <p className={styles.statusItem}>Items Processed: {feedStatus.itemsProcessed}</p>
      <p className={styles.statusItem}>Errors: {feedStatus.errors}</p>
    </div>
  );
}

export default StatusDisplay