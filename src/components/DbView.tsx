"use client";

import { useState, useEffect } from "react";
import styles from "./DbView.module.scss";

interface ProcessedItem {
  item_id: string;
  published_at: string;
  processed_at: string;
}

interface DbViewProps {
  items: ProcessedItem[];
}

export default function DbView({ items }: DbViewProps) {
  const [processedItems, setProcessedItems] = useState(items);

  useEffect(() => {
    setProcessedItems(items);
  }, [items]);

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
