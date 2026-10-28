import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async () => {
  return new Response(JSON.stringify({ success: true, data: [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost: PagesFunction<Env, any, EventContextData> = async () => {
  return new Response(JSON.stringify({ success: true, message: 'Create project endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
