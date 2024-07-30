import { NextResponse } from 'next/server';
import { getMonitorStatus } from '@/lib/rssMonitor';

export async function GET() {
  const status = getMonitorStatus();
  return NextResponse.json({ status });
}