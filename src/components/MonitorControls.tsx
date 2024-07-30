"use client";

import { useState } from "react";
import styles from "./MonitorControls.module.scss";

interface MonitorControlsProps {
  isRunning: boolean;
}

const MonitorControls = ({ isRunning }: MonitorControlsProps) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const action = isRunning ? "stop" : "start";
      const response = await fetch(`/api/monitor-${action}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to toggle monitor");
      window.location.reload();
    } catch (error) {
      console.error("Error toggling monitor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${styles.button} ${isRunning ? styles.stop : styles.start}`}
    >
      {loading ? "Processing..." : isRunning ? "Stop Monitor" : "Start Monitor"}
    </button>
  );
};

export default MonitorControls;
