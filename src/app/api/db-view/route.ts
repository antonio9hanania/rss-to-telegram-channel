import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const allowedTables = ['logs', 'processed_items']; // Add all your table names here

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    if (!table || !allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 });
    }

    let result;
    switch (table) {
      case 'logs':
        result = await sql`SELECT * FROM logs LIMIT 100`;
        break;
      case 'processed_items':
        result = await sql`SELECT * FROM processed_items LIMIT 100`;
        break;
      // Add cases for other tables as needed
      default:
        return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Failed to query database' }, { status: 500 });
  }
}