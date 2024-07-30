import { NextResponse } from 'next/server';
import { startRssMonitor, stopRssMonitor, isMonitorRunning } from '@/lib/rssMonitor';

export async function GET() {
  const status = isMonitorRunning();
  return NextResponse.json({ status });
}

export async function POST(request: Request) {
  const { action } = await request.json();
  
  if (action === 'start') {
    await startRssMonitor();
    return NextResponse.json({ status: 'started' });
  } else if (action === 'stop') {
    stopRssMonitor();
    return NextResponse.json({ status: 'stopped' });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}