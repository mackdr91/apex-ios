/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Password hashing (scrypt) and signed HMAC-SHA256 bearer token utilities for user authentication.
 */

import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || 'apex-vault-dev-hmac-secret-2026';
}

export interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
}

/** Hashes a plaintext password using scrypt with a random 16-byte salt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/** Verifies a plaintext password against a stored `salt:hash` string in constant time. */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;

  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  if (keyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(keyBuffer, derivedKey);
}

/** Creates an HMAC-SHA256 signed bearer token encoding userId, email, and expiration. */
export function signAuthToken(user: { userId: string; email: string }): string {
  const payload: TokenPayload = {
    userId: user.userId,
    email: user.email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', getAuthSecret())
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/** Verifies an HMAC-SHA256 signed bearer token and returns its payload, or null if invalid/expired. */
export function verifyAuthToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  if (!payloadBase64 || !signature) return null;

  const expectedSig = createHmac('sha256', getAuthSecret())
    .update(payloadBase64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    ) as TokenPayload;
    if (!parsed.userId || !parsed.email || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Extracts and verifies a Bearer token from an Authorization header. */
export function extractBearerPayload(authHeader?: string): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;
  return verifyAuthToken(token);
}
