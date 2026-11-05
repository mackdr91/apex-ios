/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Idempotent database migration and seed routine for the sneakers inventory table.
 */

import { pool } from './index.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sneakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  colorway VARCHAR(200) NOT NULL DEFAULT '',
  sku VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  condition VARCHAR(20) NOT NULL DEFAULT 'DS',
  status VARCHAR(20) NOT NULL DEFAULT 'in_stock',
  purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  market_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  purchase_date DATE,
  box_condition VARCHAR(50) NOT NULL DEFAULT 'OG All',
  storage_location VARCHAR(100) NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  image_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sneakers_sku ON sneakers(sku);
CREATE INDEX IF NOT EXISTS idx_sneakers_brand ON sneakers(brand);
`;

/**
 * Creates the schema if missing and seeds one sample pair into an empty table.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(SCHEMA_SQL);

    const { rows } = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM sneakers');
    if (Number(rows[0].count) === 0) {
      await client.query(
        `INSERT INTO sneakers
          (brand, model, colorway, sku, size, condition, status, purchase_price, market_value, box_condition, storage_location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          'Nike', 'Ja 1', 'Tiger Iridescent', 'FV1288-800', '10.5', 'DS', 'in_stock',
          120, 210, 'OG All', 'Shelf A - Box 01', 'Pony-hair tiger upper, holographic mudguard.',
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
