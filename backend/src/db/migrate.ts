/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Idempotent database migration and seed routine for the users and sneakers inventory tables.
 */

import { pool } from './index.js';
import { hashPassword } from '../utils/authCrypto.js';

export const DEFAULT_COLLECTOR_EMAIL = 'domonick@apexvault.io';
export const DEFAULT_COLLECTOR_PASSWORD = 'vault1234';
export const DEFAULT_COLLECTOR_NAME = 'Domonick Mack';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL DEFAULT 'Sneaker Collector',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sneakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

ALTER TABLE sneakers
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sneakers_sku ON sneakers(sku);
CREATE INDEX IF NOT EXISTS idx_sneakers_brand ON sneakers(brand);
CREATE INDEX IF NOT EXISTS idx_sneakers_user_id ON sneakers(user_id);
`;

/**
 * Creates the users and sneakers schemas if missing, seeds the default collector account,
 * and ensures the starter Nike Ja 1 'Tiger Iridescent' pair is linked.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(SCHEMA_SQL);

    // Ensure default collector user exists
    let defaultUserId: string;
    const existingUser = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [DEFAULT_COLLECTOR_EMAIL]
    );

    if (existingUser.rows.length > 0) {
      defaultUserId = existingUser.rows[0].id;
    } else {
      const passwordHash = await hashPassword(DEFAULT_COLLECTOR_PASSWORD);
      const insertedUser = await client.query<{ id: string }>(
        `INSERT INTO users (email, display_name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [DEFAULT_COLLECTOR_EMAIL, DEFAULT_COLLECTOR_NAME, passwordHash]
      );
      defaultUserId = insertedUser.rows[0].id;
    }

    // Attach any unowned sneakers to the default collector user
    await client.query(
      'UPDATE sneakers SET user_id = $1 WHERE user_id IS NULL',
      [defaultUserId]
    );

    // Seed starter pair if the sneakers table is empty
    const { rows } = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM sneakers'
    );
    if (Number(rows[0].count) === 0) {
      await client.query(
        `INSERT INTO sneakers
          (user_id, brand, model, colorway, sku, size, condition, status, purchase_price, market_value, box_condition, storage_location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          defaultUserId,
          'Nike',
          'Ja 1',
          'Tiger Iridescent',
          'FV1288-800',
          '10.5',
          'DS',
          'in_stock',
          120,
          210,
          'OG All',
          'Shelf A - Box 01',
          'Pony-hair tiger upper, holographic mudguard.',
        ]
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
