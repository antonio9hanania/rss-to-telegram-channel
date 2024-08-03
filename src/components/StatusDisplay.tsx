"use client";

import styles from "./StatusDisplay.module.scss";
import { MonitorStatus, FeedStatus } from "@/types/monitor";

interface StatusDisplayProps {
  monitorStatus: MonitorStatus;
  feedStatus: FeedStatus;
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
          ? new Date(monitorStatus.lastCheckTime).toLocaleString()
          : "Never"}
      </p>
      <p>Items Processed: {feedStatus.itemsProcessed}</p>
      <p>Errors: {feedStatus.errors}</p>
    </div>
  );
}
