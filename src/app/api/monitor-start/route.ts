import { NextResponse } from 'next/server';
import { startRssMonitor } from '@/lib/rssMonitor';

export async function POST() {
  startRssMonitor();
  return NextResponse.json({ success: true });
}