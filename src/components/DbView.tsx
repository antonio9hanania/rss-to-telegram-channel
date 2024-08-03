"use client";

import { useState, useEffect } from "react";
import { ProcessedItem } from "@/types/db";
import styles from "./DbView.module.scss";

interface DbViewProps {
  initialProcessedItems: ProcessedItem[];
}

export default function DbView({ initialProcessedItems }: DbViewProps) {
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>(
    initialProcessedItems
  );

  return (
    <div className="container">
      <h1 className={styles.title}>Processed Items</h1>
      <div className={`${styles.itemList} card`}>
        {processedItems.map((item, index) => (
          <div
            key={item.item_id}
            className={`${styles.item} ${index === 0 ? styles.newItem : ""}`}
          >
            <div className={styles.itemId}>{item.item_id}</div>
            <div className={styles.itemDate}>
              Published: {new Date(item.published_at).toLocaleString()}
            </div>
            <div className={styles.itemDate}>
              Processed: {new Date(item.processed_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
