import { json, bad, getCookie, verifySession } from '../../_utils.mjs';

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };
}

export const onRequestOptions = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const onRequestGet = async ({ env, request }) => {
  const { results } = await env.DB
    .prepare('SELECT id, title, description, imageUrl, linkUrl, order_num, created_at FROM projects ORDER BY order_num ASC, id ASC')
    .all();
  return json({ projects: results }, 200, corsHeaders(request));
};

export const onRequestPost = async ({ request, env }) => {
  const session = getCookie(request, 'session');
  const user = await verifySession(session, env.SESSION_SECRET || '');
  if (!user) return json({ error: 'Unauthorized' }, 401, corsHeaders(request));

  let data;
  try { data = await request.json(); }
  catch { return bad('Invalid JSON'); }

  if (!data || !data.title) return bad('Brakuje pola "title"');

  const { title, description = '', imageUrl = '', linkUrl = '', order_num = 0 } = data;
  const res = await env.DB
    .prepare('INSERT INTO projects (title, description, imageUrl, linkUrl, order_num, created_at) VALUES (?1,?2,?3,?4,?5, datetime("now"))')
    .bind(title, description, imageUrl, linkUrl, Number(order_num) || 0)
    .run();

  const row = await env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(res.lastRowId).first();
  return json(row, 201, corsHeaders(request));
};
