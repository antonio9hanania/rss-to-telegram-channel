"use client";

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
  return (
    <div className={styles.dbView}>
      <table className={styles.itemTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Published At</th>
            <th>Processed At</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item_id}>
              <td>{item.item_id}</td>
              <td>{item.published_at}</td>
              <td>{item.processed_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
