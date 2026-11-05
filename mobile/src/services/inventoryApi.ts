/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Typed HTTP client for sneaker inventory CRUD operations against the Fastify backend.
 */

import { getBackendBaseUrl } from '@/services/api';
import { getAuthToken } from '@/services/authApi';
import type { InventoryResponse, Sneaker, SneakerInput } from '@/types/sneaker';

const REQUEST_TIMEOUT_MS = 15000;

/** Error raised for non-2xx responses or network failures. */
export class InventoryApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'InventoryApiError';
  }
}

/** Performs a JSON request with timeout and normalized error handling. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const token = getAuthToken();
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });

    if (response.status === 204) return undefined as T;

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = (payload && (payload.message as string)) || `Request failed (HTTP ${response.status})`;
      throw new InventoryApiError(message, response.status);
    }
    return payload as T;
  } catch (error: unknown) {
    if (error instanceof InventoryApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new InventoryApiError('Request timed out — is the backend running?');
    }
    throw new InventoryApiError(error instanceof Error ? error.message : 'Network error');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const inventoryApi = {
  list: () => request<InventoryResponse>('/api/v1/sneakers'),
  get: (id: string) => request<Sneaker>(`/api/v1/sneakers/${id}`),
  create: (input: SneakerInput) =>
    request<Sneaker>('/api/v1/sneakers', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: SneakerInput) =>
    request<Sneaker>(`/api/v1/sneakers/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/v1/sneakers/${id}`, { method: 'DELETE' }),
};
