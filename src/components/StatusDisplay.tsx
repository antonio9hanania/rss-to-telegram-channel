// src/components/StatusDisplay.tsx
import styles from "./StatusDisplay.module.scss";
import { RssFeedStatus } from "@/lib/db";

interface StatusDisplayProps {
  status: "working" | "stopped";
  feedStatus: RssFeedStatus;
}

export default function StatusDisplay({
  status,
  feedStatus,
}: StatusDisplayProps) {
  return (
    <div className={styles.statusDisplay}>
      <p className={styles.status}>
        Status:{" "}
        <span
          className={status === "working" ? styles.working : styles.stopped}
        >
          {status}
        </span>
      </p>
      <p>Items Processed: {feedStatus.itemsProcessed}</p>
      <p>Errors: {feedStatus.errors}</p>
    </div>
  );
}
