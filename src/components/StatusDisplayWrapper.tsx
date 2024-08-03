import { getMonitorStatus } from "@/lib/rssMonitor";
import { getRssFeedStatus } from "@/lib/db";
import StatusDisplay from "./StatusDisplay";

// This will cause the component to be re-rendered every 5 seconds on the server
export const revalidate = 5;

export default async function StatusDisplayWrapper() {
  const monitorStatus = getMonitorStatus();
  const feedStatus = await getRssFeedStatus();

  return (
    <StatusDisplay monitorStatus={monitorStatus} feedStatus={feedStatus} />
  );
}
