import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async () => {
  return new Response(JSON.stringify({ success: true, data: null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPut: PagesFunction<Env, any, EventContextData> = async () => {
  return new Response(JSON.stringify({ success: true, message: 'Update task endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestDelete: PagesFunction<Env, any, EventContextData> = async () => {
  return new Response(JSON.stringify({ success: true, message: 'Soft delete task endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
