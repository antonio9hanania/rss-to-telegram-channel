"use client";

import { useState, useEffect } from "react";
import styles from "./StatusDisplay.module.scss";

interface StatusDisplayProps {
  monitorStatus: {
    status: "working" | "stopped";
    lastCheckTime: string | null;
  };
  feedStatus: {
    itemsProcessed: number;
    errors: number;
  };
}

export default function StatusDisplay({
  monitorStatus,
  feedStatus,
}: StatusDisplayProps) {
  const [lastCheckTime, setLastCheckTime] = useState(
    monitorStatus.lastCheckTime
  );

  useEffect(() => {
    setLastCheckTime(monitorStatus.lastCheckTime);
  }, [monitorStatus.lastCheckTime]);

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
      <p>Last Check: {lastCheckTime || "Never"}</p>
      <p>Items Processed: {feedStatus.itemsProcessed}</p>
      <p>Errors: {feedStatus.errors}</p>
    </div>
  );
}
