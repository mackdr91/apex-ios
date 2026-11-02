/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: PostgreSQL connection pool manager and health verification query utility.
 */

import { Pool, PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL;

const poolConfig: PoolConfig = connectionString
  ? { connectionString }
  : {
      host: process.env.POSTGRES_HOST || 'postgres',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'apex_user',
      password: process.env.POSTGRES_PASSWORD || 'apex_password',
      database: process.env.POSTGRES_DB || 'apex_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Error] Unexpected error on idle client:', err.message);
});

/**
 * Probes the database to verify live connectivity and latency.
 */
export async function checkDatabaseHealth(): Promise<{ status: string; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1 AS probe');
      const latencyMs = Date.now() - startTime;
      return { status: 'healthy', latencyMs };
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const latencyMs = Date.now() - startTime;
    return { status: 'unhealthy', latencyMs, error: errorMessage };
  }
}
