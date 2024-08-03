"use client";

import { useState, useEffect } from "react";
import StatusDisplay from "./StatusDisplay";
import { getMonitorStatus } from "@/lib/rssMonitor";
import { MonitorStatus, FeedStatus } from "@/types/monitor";

interface StatusDisplayWrapperProps {
  initialMonitorStatus: MonitorStatus;
  initialFeedStatus: FeedStatus;
}

export default function StatusDisplayWrapper({
  initialMonitorStatus,
  initialFeedStatus,
}: StatusDisplayWrapperProps) {
  const [monitorStatus, setMonitorStatus] =
    useState<MonitorStatus>(initialMonitorStatus);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>(initialFeedStatus);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentMonitorStatus = getMonitorStatus();
      setMonitorStatus(currentMonitorStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StatusDisplay monitorStatus={monitorStatus} feedStatus={feedStatus} />
  );
}
