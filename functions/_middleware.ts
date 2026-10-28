import { jwtVerify } from 'jose';
import type { Env, EventContextData } from './env';

export const onRequest: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data, next } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Public endpoints
  if (url.pathname.startsWith('/api/auth/login') || url.pathname.startsWith('/api/auth/register')) {
    return next();
  }

  // For other API routes, verify JWT from cookie or Authorization header
  if (url.pathname.startsWith('/api/')) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
    const authHeader = request.headers.get('Authorization');
    const token = tokenMatch ? tokenMatch[1] : authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET || 'dev-secret-key-replace-in-prod');
      const { payload } = await jwtVerify(token, secret);
      data.userId = payload.sub as string;
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
};
