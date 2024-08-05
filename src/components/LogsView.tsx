"use client";

import { useState, useEffect } from "react";
//import styles from "./DbView.module.scss";

interface Log {
  message: string;
  created_at: string;
}

interface DbViewProps {
  logs: Log[];
}

export default function LogsView({ logs }: DbViewProps) {
  const [processedItems, setProcessedItems] = useState(logs);

  useEffect(() => {
    setProcessedItems(logs);
  }, [logs]);

  return (
    <div className="container">
      <div>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              {log.message + ", created at: " + log.created_at}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
