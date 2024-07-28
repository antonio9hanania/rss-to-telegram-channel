import { sql } from '@vercel/postgres';

export interface Log {
  message: string;
  created_at: string;
}

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS processed_items (
      id SERIAL PRIMARY KEY,
      item_id TEXT UNIQUE NOT NULL,
      published_at TIMESTAMP NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function getLogs(limit: number = 20): Promise<Log[]> {
  const result = await sql<Log>`
    SELECT message, created_at FROM logs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function isItemProcessed(itemId: string): Promise<boolean> {
    const result = await sql`
      SELECT COUNT(*) as count FROM processed_items
      WHERE item_id = ${itemId}
    `;
    return result.rows[0].count > 0;
  }

export async function addLog(message: string) {
  await sql`
    INSERT INTO logs (message)
    VALUES (${message})
  `;
}

export async function addProcessedItem(itemId: string, publishedAt: Date) {
  await sql`
    INSERT INTO processed_items (item_id, published_at)
    VALUES (${itemId}, ${publishedAt.toISOString()})
    ON CONFLICT (item_id) DO NOTHING
  `;
}

export async function getProcessedItems(limit: number = 50): Promise<string[]> {
  const result = await sql`
    SELECT item_id FROM processed_items
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return result.rows.map(row => row.item_id);
}