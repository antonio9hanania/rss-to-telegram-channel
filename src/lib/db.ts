import { Pool } from 'pg';
import { sql as vercelSql } from '@vercel/postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getClient() {
  if (process.env.NODE_ENV === 'production') {
    return { sql: vercelSql };
  } else {
    return {
      sql: (strings: TemplateStringsArray, ...values: any[]) => {
        const query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
        return pool.query(query, values);
      }
    };
  }
}

export interface Log {
  message: string;
  created_at: string;
}

export async function createTables() {
  const client = await getClient();
  await client.sql`
    CREATE TABLE IF NOT EXISTS processed_items (
      id SERIAL PRIMARY KEY,
      item_id TEXT UNIQUE NOT NULL,
      published_at TIMESTAMP NOT NULL
    )
  `;

  await client.sql`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function getLogs(limit: number = 20): Promise<Log[]> {
  const client = await getClient();
  const result = await client.sql`
    SELECT message, created_at FROM logs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function addLog(message: string) {
  const client = await getClient();
  await client.sql`
    INSERT INTO logs (message)
    VALUES (${message})
  `;
}

export async function addProcessedItem(itemId: string, publishedAt: Date) {
  const client = await getClient();
  await client.sql`
    INSERT INTO processed_items (item_id, published_at)
    VALUES (${itemId}, ${publishedAt.toISOString()})
    ON CONFLICT (item_id) DO NOTHING
  `;
}

export async function getProcessedItems(limit: number = 50): Promise<string[]> {
  const client = await getClient();
  const result = await client.sql`
    SELECT item_id FROM processed_items
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return result.rows.map(row => row.item_id);
}

export async function isItemProcessed(itemId: string): Promise<boolean> {
  const client = await getClient();
  const result = await client.sql`
    SELECT COUNT(*) as count FROM processed_items
    WHERE item_id = ${itemId}
  `;
  return result.rows[0].count > 0;
}