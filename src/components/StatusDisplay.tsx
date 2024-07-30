import { RssFeedStatus } from '@/lib/db';

interface StatusDisplayProps {
  monitorStatus: {
    isRunning: boolean;
    lastCheckTime: Date | null;
  };
  feedStatus: RssFeedStatus;
}

export default function StatusDisplay({ monitorStatus, feedStatus }: StatusDisplayProps) {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Monitor Status</h2>
      <p>Status: {monitorStatus.isRunning ? 'Running' : 'Stopped'}</p>
      <p>Last Check: {monitorStatus.lastCheckTime ? monitorStatus.lastCheckTime.toLocaleString() : 'Never'}</p>
      <h2 className="text-xl font-bold mt-6 mb-4">Feed Status</h2>
      <p>Items Processed: {feedStatus.itemsProcessed}</p>
      <p>Errors: {feedStatus.errors}</p>
    </div>
  );
}