/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Fastify application entry point, lifecycle management, and graceful shutdown handlers.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import dotenv from 'dotenv';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { sneakerRoutes } from './routes/sneakers.js';
import { pool } from './db/index.js';
import { runMigrations } from './db/migrate.js';

dotenv.config();

const server = Fastify({
  // Allow compressed base64 sneaker photos in request bodies (15 MB)
  bodyLimit: 15 * 1024 * 1024,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function bootstrap() {
  try {
    // Register utility plugins
    await server.register(sensible);
    await server.register(cors, {
      origin: true,
      credentials: true,
    });

    // Ensure database schema exists before serving traffic
    await runMigrations();
    server.log.info('Database migrations applied.');

    // Register routes
    await server.register(healthRoutes);
    await server.register(authRoutes);
    await server.register(sneakerRoutes);

    const port = Number(process.env.PORT) || 8000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    server.log.info(`Apex Backend API listening on http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Graceful termination handling
const shutdown = async (signal: string) => {
  server.log.info(`Received ${signal}. Gracefully closing application...`);
  try {
    await server.close();
    await pool.end();
    server.log.info('Closed database connection pool and HTTP server successfully.');
    process.exit(0);
  } catch (err) {
    server.log.error({ err }, 'Error encountered during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap();
