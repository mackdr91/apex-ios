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

export async function seedStarterSneakersForUser(userId: string): Promise<void> {
  await pool.query(
    `INSERT INTO sneakers
      (user_id, brand, model, colorway, sku, size, condition, status, purchase_price, market_value, purchase_date, box_condition, storage_location, notes)
     VALUES
      ($1, 'Nike', 'Ja 1', 'Tiger Iridescent', 'FV1288-800', '10.5', 'DS', 'in_stock', 120.00, 245.00, '2026-08-14', 'OG All', 'Vault Shelf A1', 'Pony-hair tiger stripe upper with holographic iridescent mudguard and dual black/pink lace setup.'),
      ($1, 'Jordan', 'Air Jordan 1 Retro High OG', 'Travis Scott Mocha', 'CD4487-100', '10.5', 'DS', 'in_stock', 175.00, 1450.00, '2026-03-19', 'OG All', 'Vault Shelf A2', 'Reverse Swoosh in Sail leather, stash pocket on collar, pink extra laces included.'),
      ($1, 'Jordan', 'Air Jordan 4 Retro SB', 'Pine Green', 'DR5415-103', '11', 'VNDS', 'in_stock', 225.00, 520.00, '2026-05-02', 'OG All', 'Vault Shelf A3', 'Nike SB heel tab, gum outsole, re-engineered forefoot flex.'),
      ($1, 'Nike', 'Kobe 6 Protro', 'Reverse Grinch', 'FV4921-600', '10.5', 'DS', 'reserved', 190.00, 465.00, '2026-06-15', 'OG All', 'Vault Shelf B1', 'Bright Crimson snakeskin textured upper with Electric Green laces.'),
      ($1, 'New Balance', '990v6 Made in USA', 'Action Bronson Baklava', 'M990AB6', '10.5', 'DS', 'in_stock', 220.00, 410.00, '2026-07-21', 'OG All', 'Vault Shelf B2', 'Multi-color mesh and pigskin suede overlays with FuelCell midsole.'),
      ($1, 'Jordan', 'Air Jordan 11 Retro', 'Gratitude / Defining Moments', 'CT8012-170', '10.5', 'DS', 'reserved', 230.00, 315.00, '2026-09-10', 'OG All', 'Vault Shelf B3', 'Metallic gold Jumpman emblem with high-cut black patent leather mudguard.')`,
    [userId]
  );
}

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
