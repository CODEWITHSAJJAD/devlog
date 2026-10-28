import { SignJWT, jwtVerify } from 'jose';

const ITERATIONS = 100000;
const KEY_LEN = 32;

const bufferToHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToBuffer = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LEN * 8
  );
  return `${bufferToHex(salt.buffer)}:${bufferToHex(derivedBits)}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [saltHex, originalHashHex] = parts;
  const salt = hexToBuffer(saltHex);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LEN * 8
  );
  const derivedHex = bufferToHex(derivedBits);
  if (derivedHex.length !== originalHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedHex.length; i++) {
    diff |= derivedHex.charCodeAt(i) ^ originalHashHex.charCodeAt(i);
  }
  return diff === 0;
};

export const signToken = async (userId: string, email: string, secret: string): Promise<string> => {
  const key = new TextEncoder().encode(secret || 'dev-secret-key-devlog-2026');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    sub: userId,
    email,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days expiration
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);
};

export const verifyToken = async (token: string, secret: string) => {
  try {
    const key = new TextEncoder().encode(secret || 'dev-secret-key-devlog-2026');
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
};

export const createAuthCookie = (token: string): string => {
  return `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`;
};

export const clearAuthCookie = (): string => {
  return 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure';
};
