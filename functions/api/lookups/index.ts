import type { Env } from '../../env';

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ success: true, data: [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
