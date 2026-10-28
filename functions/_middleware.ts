import { verifyToken } from './utils/auth';
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

  // Public endpoints bypass
  if (
    url.pathname.startsWith('/api/auth/login') ||
    url.pathname.startsWith('/api/auth/register') ||
    url.pathname.startsWith('/api/lookups')
  ) {
    return next();
  }

  // Protected API routes
  if (url.pathname.startsWith('/api/')) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
    const authHeader = request.headers.get('Authorization');
    const token = tokenMatch ? tokenMatch[1] : authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = await verifyToken(token, env.JWT_SECRET);
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    data.userId = payload.sub as string;
  }

  return next();
};
