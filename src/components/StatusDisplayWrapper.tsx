import { getMonitorStatus } from "@/lib/rssMonitor";
import { formatIsraelTime } from "@/lib/utils";

import { getRssFeedStatus } from "@/lib/db";
import StatusDisplay from "./StatusDisplay";

async function getStatus() {
  const monitorStatus = getMonitorStatus();
  const feedStatus = await getRssFeedStatus();

  const formattedStatus = {
    ...monitorStatus,
    lastCheckTime: monitorStatus.lastCheckTime
      ? formatIsraelTime(monitorStatus.lastCheckTime)
      : "",
  };

  return (
    <StatusDisplay monitorStatus={formattedStatus} feedStatus={feedStatus} />
  );
}
export default async function StatusDisplayWrapper() {
  setInterval(getStatus, 5000);

  return getStatus();
}
