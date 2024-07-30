'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

export default function Home() {
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const response = await fetch('/api/monitor-status');
    const data = await response.json();
    setStatus(data.status ? 'running' : 'stopped');
  };

  const toggleMonitor = async () => {
    const action = status === 'running' ? 'stop' : 'start';
    await fetch('/api/monitor-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchStatus();
  };

  const routes = [
    { path: '/logs', description: 'View application logs' },
    { path: '/db-view', description: 'View database contents' },
    { path: '/api/monitor-rss', description: 'Trigger RSS check manually' },
  ];

  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>RSS to Telegram Channel Monitor</h1>
        
        <div className={`${styles.statusCard} card`}>
          <p className={styles.statusText}>
            Status: <span className={status === 'running' ? styles.statusRunning : styles.statusStopped}>{status}</span>
          </p>
          <button 
            onClick={toggleMonitor}
            className={`btn ${status === 'running' ? 'btn-secondary' : 'btn-primary'}`}
          >
            {status === 'running' ? 'Stop Monitor' : 'Start Monitor'}
          </button>
        </div>

        {status === 'running' && (
          <div className={`${styles.routesCard} card`}>
            <h2 className={styles.subtitle}>Available Routes:</h2>
            <ul className={styles.routeList}>
              {routes.map((route, index) => (
                <li key={index} className={styles.routeItem}>
                  <Link href={route.path} className={styles.routeLink}>
                    {route.path}
                  </Link>
                  <span className={styles.routeDescription}>- {route.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}