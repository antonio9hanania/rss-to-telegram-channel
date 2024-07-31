import { Pool } from "pg";
import { sql } from "@vercel/postgres";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface ProcessedItem {
  item_id: string;
  published_at: string;
  processed_at: string;
}

async function getClient() {
  if (process.env.NODE_ENV === "production") {
    console.log("production client");
    return { sql };
  } else {
    return {
      sql: (strings: TemplateStringsArray, ...values: any[]) => {
        const query = strings.reduce(
          (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
          ""
        );
        return pool.query(query, values);
      },
    };
  }
}

export interface Log {
  message: string;
  created_at: string;
}

export interface RssFeedStatus {
  itemsProcessed: number;
  errors: number;
}

export async function getRssFeedStatus(): Promise<RssFeedStatus> {
  const client = await getClient();
  const result = await client.sql`
    SELECT 
      (SELECT COUNT(*) FROM processed_items) as items_processed,
      (SELECT COUNT(*) FROM logs WHERE message LIKE 'Error%') as errors
  `;
  return {
    itemsProcessed: parseInt(result.rows[0].items_processed),
    errors: parseInt(result.rows[0].errors),
  };
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
  try {
    const result = await client.sql`
      INSERT INTO processed_items (item_id, published_at, processed_at)
      VALUES (${itemId}, ${publishedAt.toISOString()}, CURRENT_TIMESTAMP)
      ON CONFLICT (item_id) DO NOTHING
      RETURNING *;
    `;
    console.log("Item added to processed_items:", result.rows[0]);
  } catch (error) {
    console.error("Error adding processed item:", error);
  }
}

export async function getProcessedItems(
  limit: number = 10
): Promise<ProcessedItem[]> {
  const client = await getClient();

  const result = await client.sql`
  SELECT item_id, published_at, processed_at
    FROM processed_items
    ORDER BY processed_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function isItemProcessed(itemId: string): Promise<boolean> {
  const client = await getClient();
  const result = await client.sql`
    SELECT COUNT(*) as count FROM processed_items WHERE item_id = ${itemId}
  `;
  const isProcessed = result.rows[0].count > 0;
  console.log(`Checking if item ${itemId} is processed: ${isProcessed}`);
  return isProcessed;
}

export async function checkDatabaseConnection() {
  const client = await getClient();
  try {
    const result = await client.sql`SELECT NOW()`;
    console.log("Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
