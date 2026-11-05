/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: REST CRUD routes for the sneaker inventory scoped by authenticated user, including collection metrics and QR payloads.
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { pool } from '../db/index.js';
import { extractBearerPayload } from '../utils/authCrypto.js';
import { DEFAULT_COLLECTOR_EMAIL } from '../db/migrate.js';

const CONDITIONS = ['DS', 'VNDS', 'Used', 'Beater'];
const STATUSES = ['in_stock', 'reserved', 'sold'];
const BOX_CONDITIONS = ['OG All', 'OG Box (Damaged)', 'Replacement Box', 'No Box'];

interface SneakerRow {
  id: string;
  user_id: string | null;
  brand: string;
  model: string;
  colorway: string;
  sku: string;
  size: string;
  condition: string;
  status: string;
  purchase_price: string;
  market_value: string;
  purchase_date: string | null;
  box_condition: string;
  storage_location: string;
  notes: string;
  image_data: string | null;
  created_at: string;
  updated_at: string;
}

interface SneakerBody {
  brand: string;
  model: string;
  colorway?: string;
  sku: string;
  size: string;
  condition?: string;
  status?: string;
  purchasePrice?: number;
  marketValue?: number;
  purchaseDate?: string | null;
  boxCondition?: string;
  storageLocation?: string;
  notes?: string;
  imageData?: string | null;
}

const sneakerBodySchema = {
  type: 'object',
  required: ['brand', 'model', 'sku', 'size'],
  additionalProperties: false,
  properties: {
    brand: { type: 'string', minLength: 1, maxLength: 100 },
    model: { type: 'string', minLength: 1, maxLength: 200 },
    colorway: { type: 'string', maxLength: 200 },
    sku: { type: 'string', minLength: 1, maxLength: 100 },
    size: { type: 'string', minLength: 1, maxLength: 20 },
    condition: { type: 'string', enum: CONDITIONS },
    status: { type: 'string', enum: STATUSES },
    purchasePrice: { type: 'number', minimum: 0 },
    marketValue: { type: 'number', minimum: 0 },
    purchaseDate: { type: ['string', 'null'], format: 'date' },
    boxCondition: { type: 'string', enum: BOX_CONDITIONS },
    storageLocation: { type: 'string', maxLength: 100 },
    notes: { type: 'string', maxLength: 2000 },
    imageData: { type: ['string', 'null'] },
  },
} as const;

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
} as const;

/** Resolves the active user ID from the Bearer token, or falls back to the seeded collector account. */
async function resolveUserId(request: FastifyRequest): Promise<string> {
  const tokenPayload = extractBearerPayload(request.headers.authorization);
  if (tokenPayload?.userId) {
    return tokenPayload.userId;
  }

  const { rows } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1 LIMIT 1',
    [DEFAULT_COLLECTOR_EMAIL]
  );
  return rows[0]?.id ?? '';
}

/** Builds the payload encoded into each pair's box-tag QR code. */
function buildQrPayload(row: SneakerRow): string {
  return `apexvault://sneaker/${row.id}?sku=${encodeURIComponent(row.sku)}&size=${encodeURIComponent(row.size)}`;
}

/** Maps a snake_case DB row to the camelCase API shape. */
function toApi(row: SneakerRow) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    colorway: row.colorway,
    sku: row.sku,
    size: row.size,
    condition: row.condition,
    status: row.status,
    purchasePrice: Number(row.purchase_price),
    marketValue: Number(row.market_value),
    purchaseDate: row.purchase_date,
    boxCondition: row.box_condition,
    storageLocation: row.storage_location,
    notes: row.notes,
    imageData: row.image_data,
    qrCodeData: buildQrPayload(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Ordered parameter list shared by INSERT and UPDATE statements. */
function toParams(b: SneakerBody): unknown[] {
  return [
    b.brand.trim(),
    b.model.trim(),
    (b.colorway ?? '').trim(),
    b.sku.trim().toUpperCase(),
    b.size.trim(),
    b.condition ?? 'DS',
    b.status ?? 'in_stock',
    b.purchasePrice ?? 0,
    b.marketValue ?? 0,
    b.purchaseDate || null,
    b.boxCondition ?? 'OG All',
    (b.storageLocation ?? '').trim(),
    (b.notes ?? '').trim(),
    b.imageData ?? null,
  ];
}

export async function sneakerRoutes(fastify: FastifyInstance) {
  // List all pairs for the current user with aggregate collection metrics
  fastify.get('/api/v1/sneakers', async (request) => {
    const userId = await resolveUserId(request);
    const { rows } = await pool.query<SneakerRow>(
      'SELECT * FROM sneakers WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const sneakers = rows.map(toApi);

    const sum = (list: typeof sneakers) => list.reduce((acc, s) => acc + s.marketValue, 0);
    const inStock = sneakers.filter((s) => s.status === 'in_stock');
    const reserved = sneakers.filter((s) => s.status === 'reserved');
    const owned = sneakers.filter((s) => s.status !== 'sold');

    return {
      sneakers,
      metrics: {
        totalValuation: sum(owned),
        totalPairs: owned.length,
        totalCost: owned.reduce((acc, s) => acc + s.purchasePrice, 0),
        inStockValue: sum(inStock),
        inStockCount: inStock.length,
        reservedValue: sum(reserved),
        reservedCount: reserved.length,
      },
    };
  });

  fastify.get<{ Params: { id: string } }>(
    '/api/v1/sneakers/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const userId = await resolveUserId(request);
      const { rows } = await pool.query<SneakerRow>(
        'SELECT * FROM sneakers WHERE id = $1 AND user_id = $2',
        [request.params.id, userId]
      );
      if (rows.length === 0) return reply.notFound('Sneaker not found');
      return toApi(rows[0]);
    }
  );

  fastify.post<{ Body: SneakerBody }>(
    '/api/v1/sneakers',
    { schema: { body: sneakerBodySchema } },
    async (request, reply) => {
      const userId = await resolveUserId(request);
      const { rows } = await pool.query<SneakerRow>(
        `INSERT INTO sneakers
          (brand, model, colorway, sku, size, condition, status, purchase_price, market_value,
           purchase_date, box_condition, storage_location, notes, image_data, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [...toParams(request.body), userId]
      );
      return reply.status(201).send(toApi(rows[0]));
    }
  );

  fastify.put<{ Params: { id: string }; Body: SneakerBody }>(
    '/api/v1/sneakers/:id',
    { schema: { params: idParamsSchema, body: sneakerBodySchema } },
    async (request, reply) => {
      const userId = await resolveUserId(request);
      const { rows } = await pool.query<SneakerRow>(
        `UPDATE sneakers SET
          brand=$1, model=$2, colorway=$3, sku=$4, size=$5, condition=$6, status=$7,
          purchase_price=$8, market_value=$9, purchase_date=$10, box_condition=$11,
          storage_location=$12, notes=$13, image_data=$14, updated_at=NOW()
         WHERE id=$15 AND user_id=$16
         RETURNING *`,
        [...toParams(request.body), request.params.id, userId]
      );
      if (rows.length === 0) return reply.notFound('Sneaker not found');
      return toApi(rows[0]);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/v1/sneakers/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const userId = await resolveUserId(request);
      const { rowCount } = await pool.query(
        'DELETE FROM sneakers WHERE id = $1 AND user_id = $2',
        [request.params.id, userId]
      );
      if (!rowCount) return reply.notFound('Sneaker not found');
      return reply.status(204).send();
    }
  );
}
