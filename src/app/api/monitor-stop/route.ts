import { NextResponse } from 'next/server';
import { stopRssMonitor } from '@/lib/rssMonitor';

export async function POST() {
  stopRssMonitor();
  return NextResponse.json({ success: true });
}