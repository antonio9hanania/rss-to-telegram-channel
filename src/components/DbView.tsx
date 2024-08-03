"use client";

import styles from "./DbView.module.scss";

interface ProcessedItem {
  item_id: string;
  published_at: Date;
  processed_at: Date;
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
              <td>
                {item.published_at.toLocaleString("he-IL", {
                  timeZone: "Asia/Jerusalem",
                })}
              </td>
              <td>
                {item.processed_at.toLocaleString("he-IL", {
                  timeZone: "Asia/Jerusalem",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
