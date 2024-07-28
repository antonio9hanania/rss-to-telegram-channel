import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/db';

export async function GET() {
  try {
    const logs = await getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}