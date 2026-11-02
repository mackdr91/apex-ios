/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: HTTP client service for connecting to the containerized Fastify backend and retrieving health status.
 */

import { Platform } from 'react-native';

export interface DatabaseStatus {
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  error?: string;
}

export interface MemoryMetrics {
  rssMb: number;
  heapTotalMb: number;
  heapUsedMb: number;
}

export interface BackendStatusResponse {
  status: 'healthy' | 'degraded';
  service: string;
  environment: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  database: DatabaseStatus;
  memory: MemoryMetrics;
}

/**
 * Resolves the appropriate backend host based on the runtime platform.
 * - iOS Simulator / Web: localhost
 * - Android Emulator: 10.0.2.2
 */
export function getBackendBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8003';
  }
  return 'http://localhost:8003';
}

/**
 * Fetches the backend readiness and database connectivity report.
 */
export async function fetchBackendStatus(): Promise<{
  data: BackendStatusResponse | null;
  error: string | null;
}> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = `${baseUrl}/api/v1/status`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 503) {
      return {
        data: null,
        error: `Server responded with HTTP status ${response.status}`,
      };
    }

    const json = (await response.json()) as BackendStatusResponse;
    return { data: json, error: null };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { data: null, error: 'Connection timed out (backend unreachable)' };
      }
      return { data: null, error: err.message };
    }
    return { data: null, error: 'An unexpected network error occurred' };
  }
}
