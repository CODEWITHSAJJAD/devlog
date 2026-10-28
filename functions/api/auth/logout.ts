import type { Env } from '../../env';

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
    },
  });
};
