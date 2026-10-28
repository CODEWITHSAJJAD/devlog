import { clearAuthCookie } from '../../utils/auth';
import type { Env } from '../../env';

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearAuthCookie(),
    },
  });
};
