import { getMonitorStatus } from "@/lib/rssMonitor";
import { formatIsraelTime } from "@/lib/utils";

import { getRssFeedStatus } from "@/lib/db";
import StatusDisplay from "./StatusDisplay";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function StatusDisplayWrapper() {
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
