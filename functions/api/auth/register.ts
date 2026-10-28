import type { Env } from '../../env';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return new Response(JSON.stringify({ success: true, message: 'Auth register endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
