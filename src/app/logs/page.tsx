import { getLogs } from '@/lib/db';

export default async function LogsPage() {
  const logs = await getLogs(100); // Get the last 100 logs

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RSS Monitor Logs</h1>
      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li key={index} className="bg-gray-100 p-2 rounded">
            <span className="text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</span>
            <p>{log.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}