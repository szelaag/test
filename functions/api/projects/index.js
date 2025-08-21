import { json, bad, getCookie, verifySession } from '../_utils.mjs';

export const onRequestGet = async ({ env }) => {
  const { results } = await env.DB.prepare('SELECT id, title, description, imageUrl, linkUrl, order_num, created_at FROM projects ORDER BY order_num ASC, id ASC').all();
  return json({ projects: results });
};

export const onRequestPost = async ({ request, env }) => {
  const session = getCookie(request, 'session');
  const user = await verifySession(session, env.SESSION_SECRET || '');
  if(!user) return json({error:'Unauthorized'}, 401);

  const data = await request.json().catch(()=>null);
  if(!data || !data.title) return bad('Brakuje pola "title"');
  const { title, description='', imageUrl='', linkUrl='', order_num=0 } = data;
  const stmt = env.DB.prepare('INSERT INTO projects (title, description, imageUrl, linkUrl, order_num, created_at) VALUES (?1, ?2, ?3, ?4, ?5, datetime("now"))').bind(title, description, imageUrl, linkUrl, Number(order_num)||0);
  const res = await stmt.run();
  const id = res.lastRowId;
  const row = await env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  return json(row, 201);
};
