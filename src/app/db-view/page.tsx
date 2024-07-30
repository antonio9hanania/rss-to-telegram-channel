'use client';

import { useState, useEffect } from 'react';
import styles from './db-view.module.scss';

interface ProcessedItem {
  item_id: string;
  published_at: string;
  processed_at: string;
}

export default function DbViewPage() {
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const response = await fetch('/api/processed-items');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setProcessedItems(result);
      } catch (error) {
        console.error('Error fetching data:', error);   
        setError(error instanceof Error ? error.message : 'An unknown error occurred');

      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1 className={styles.title}>Processed Items</h1>
      {error && <div className={`${styles.error} card`}>{error}</div>}
      <div className={`${styles.itemList} card`}>
        {processedItems.map((item, index) => (
          <div 
            key={item.item_id} 
            className={`${styles.item} ${index === 0 ? styles.newItem : ''}`}
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