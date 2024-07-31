// src/components/StatusDisplay.tsx
import styles from "./StatusDisplay.module.scss";
import { RssFeedStatus } from "@/lib/db";

interface StatusDisplayProps {
  monitorStatus: {
    status: "working" | "stopped";
    lastCheckTime: Date | null;
  };
  feedStatus: RssFeedStatus;
}

export default function StatusDisplay({
  monitorStatus,
  feedStatus,
}: StatusDisplayProps) {
  return (
    <div className={styles.statusDisplay}>
      <p className={styles.status}>
        Status:{" "}
        <span
          className={
            monitorStatus.status === "working" ? styles.working : styles.stopped
          }
        >
          {monitorStatus.status}
        </span>
      </p>
      <p>
        Last Check:{" "}
        {monitorStatus.lastCheckTime
          ? monitorStatus.lastCheckTime.toLocaleString()
          : "Never"}
      </p>
      <p>Items Processed: {feedStatus.itemsProcessed}</p>
      <p>Errors: {feedStatus.errors}</p>
    </div>
  );
}
