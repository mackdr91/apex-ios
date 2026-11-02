/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Health check and service status route registration for Fastify API.
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { checkDatabaseHealth } from '../db/index.js';

export async function healthRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Lightweight liveness probe for Docker / orchestrator
  fastify.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'apex-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Deep readiness probe verifying database connectivity & system metrics
  fastify.get('/api/v1/status', async (_request, reply) => {
    const dbHealth = await checkDatabaseHealth();
    const isHealthy = dbHealth.status === 'healthy';

    const memoryUsage = process.memoryUsage();

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'apex-backend',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: dbHealth,
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      },
    });
  });
}
