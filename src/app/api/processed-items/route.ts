import { NextResponse } from 'next/server';
import { getProcessedItems } from '@/lib/db';

export async function GET() {
  try {
    const items = await getProcessedItems(10);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching processed items:', error);
    return NextResponse.json({ error: 'Failed to fetch processed items' }, { status: 500 });
  }
}