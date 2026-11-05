/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Typed authentication client (/api/v1/auth/login, /api/v1/auth/signup, /api/v1/auth/me) and bearer token state for the mobile client.
 */

import { getBackendBaseUrl } from '@/services/api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  token: string;
}

let activeAuthToken: string | null = null;

export function getAuthToken(): string | null {
  return activeAuthToken;
}

export function setAuthToken(token: string | null): void {
  activeAuthToken = token;
}

export function clearAuthToken(): void {
  activeAuthToken = null;
}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    };
    if (activeAuthToken) {
      headers.Authorization = `Bearer ${activeAuthToken}`;
    }

    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        (payload && (payload.message as string)) ||
        `Authentication failed (HTTP ${response.status})`;
      throw new Error(message);
    }

    return payload as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Authentication request timed out — check backend container.');
    }
    throw err instanceof Error ? err : new Error('Authentication network error');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthSessionResponse> {
    const res = await authRequest<AuthSessionResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async signup(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthSessionResponse> {
    const res = await authRequest<AuthSessionResponse>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setAuthToken(res.token);
    return res;
  },

  async me(): Promise<{ user: AuthUser }> {
    return authRequest<{ user: AuthUser }>('/api/v1/auth/me');
  },
};
