import { getMonitorStatus } from '@/lib/rssMonitor';
import { getRssFeedStatus } from '@/lib/db';
import StatusDisplay from '@/components/StatusDisplay';

export default async function Home() {
  const monitorStatus = getMonitorStatus();
  const feedStatus = await getRssFeedStatus();

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RSS to Telegram Channel Monitor</h1>
      <StatusDisplay monitorStatus={monitorStatus} feedStatus={feedStatus} />
    </main>
  );
}