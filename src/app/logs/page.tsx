import { getLogs } from "@/lib/db";

export default async function LogsPage() {
  try {
    const logs = await getLogs();
    return (
      <div>
        <h1>Logs</h1>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log.message}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Error fetching logs:", error);
    return <div>Error loading logs. Please try again later.</div>;
  }
}
