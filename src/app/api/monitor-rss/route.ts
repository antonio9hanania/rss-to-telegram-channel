import { NextResponse } from 'next/server';
import { startRssMonitor } from '@/lib/rssMonitor';
import { createTables } from '@/lib/db';

let monitorStarted = false;

export async function GET() {
  try {
    if (!monitorStarted) {
      await createTables();
      startRssMonitor();
      monitorStarted = true;
      return NextResponse.json({ success: true, message: "RSS monitor started successfully" });
    } else {
      return NextResponse.json({ success: true, message: "RSS monitor already running" });
    }
  } catch (error) {
    console.error('Error starting RSS monitor:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}