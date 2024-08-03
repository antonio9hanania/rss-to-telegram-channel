import { getLogs, Log } from "@/lib/db";
import LogsView from "./LogsView";

export default async function LogsViewWrapper() {
  const Logs = await getLogs();

  if (!Logs) {
    throw new Error("Failed to fetch logs");
  }

  return <LogsView logs={Logs} />;
}
