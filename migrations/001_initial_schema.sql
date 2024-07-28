CREATE TABLE IF NOT EXISTS processed_items (
  id SERIAL PRIMARY KEY,
  item_id TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);