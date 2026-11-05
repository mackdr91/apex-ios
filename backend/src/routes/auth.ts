/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Fastify authentication routes (/api/v1/auth/signup, /api/v1/auth/login, /api/v1/auth/me) backed by PostgreSQL.
 */

import { FastifyInstance } from 'fastify';
import { pool } from '../db/index.js';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  extractBearerPayload,
} from '../utils/authCrypto.js';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  created_at: string;
}

interface SignupBody {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const signupSchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 6, maxLength: 128 },
    displayName: { type: 'string', maxLength: 150 },
  },
} as const;

const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 1, maxLength: 128 },
  },
} as const;

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

export async function authRoutes(fastify: FastifyInstance) {
  // Create a new user account and seed a starter sneaker pair
  fastify.post<{ Body: SignupBody }>(
    '/api/v1/auth/signup',
    { schema: { body: signupSchema } },
    async (request, reply) => {
      const normalizedEmail = request.body.email.trim().toLowerCase();
      const rawName = (request.body.displayName ?? '').trim();
      const displayName = rawName || normalizedEmail.split('@')[0] || 'Collector';

      const existing = await pool.query<{ id: string }>(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );
      if (existing.rows.length > 0) {
        return reply.conflict('An account with that email already exists.');
      }

      const passwordHash = await hashPassword(request.body.password);

      const { rows } = await pool.query<UserRow>(
        `INSERT INTO users (email, display_name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [normalizedEmail, displayName, passwordHash]
      );
      const user = rows[0];

      // Seed the starter Nike Ja 1 'Tiger Iridescent' pair for the new collector
      await pool.query(
        `INSERT INTO sneakers
          (user_id, brand, model, colorway, sku, size, condition, status, purchase_price, market_value, box_condition, storage_location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          user.id,
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

      const token = signAuthToken({ userId: user.id, email: user.email });
      return reply.status(201).send({
        user: toPublicUser(user),
        token,
      });
    }
  );

  // Authenticate an existing user with email and password
  fastify.post<{ Body: LoginBody }>(
    '/api/v1/auth/login',
    { schema: { body: loginSchema } },
    async (request, reply) => {
      const normalizedEmail = request.body.email.trim().toLowerCase();

      const { rows } = await pool.query<UserRow>(
        'SELECT * FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );
      if (rows.length === 0) {
        return reply.unauthorized('Invalid email or password.');
      }

      const user = rows[0];
      const valid = await verifyPassword(request.body.password, user.password_hash);
      if (!valid) {
        return reply.unauthorized('Invalid email or password.');
      }

      const token = signAuthToken({ userId: user.id, email: user.email });
      return {
        user: toPublicUser(user),
        token,
      };
    }
  );

  // Return the currently authenticated user profile
  fastify.get('/api/v1/auth/me', async (request, reply) => {
    const payload = extractBearerPayload(request.headers.authorization);
    if (!payload) {
      return reply.unauthorized('Missing or invalid authentication token.');
    }

    const { rows } = await pool.query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [payload.userId]
    );
    if (rows.length === 0) {
      return reply.unauthorized('Account not found.');
    }

    return {
      user: toPublicUser(rows[0]),
    };
  });
}
