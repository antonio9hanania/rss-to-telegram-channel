'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import styles from './LogList.module.scss';

export default function LogList({ initialLogs }) {
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    };

    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ul className={styles.logList}>
      {logs.map((log, index) => (
        <li key={index} className={`${styles.logItem} ${index === 19 ? styles.fadeOut : ''}`}>
          <span className={styles.timestamp}>
            {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
          </span>
          <span className={styles.message}>{log.message}</span>
        </li>
      ))}
    </ul>
  );
}