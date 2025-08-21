import { json, bad, getCookie, verifySession } from '../../_utils.mjs';

export const onRequestGet = async ({ params, env }) => {
  const id = Number(params.id);
  if(!id) return bad('Invalid id');
  const row = await env.DB.prepare('SELECT id, title, description, imageUrl, linkUrl, order_num, created_at FROM projects WHERE id = ?').bind(id).first();
  if(!row) return json({error:'Not found'}, 404);
  return json(row);
};

export const onRequestPut = async ({ request, params, env }) => {
  const session = getCookie(request, 'session');
  const user = await verifySession(session, env.SESSION_SECRET || '');
  if(!user) return json({error:'Unauthorized'}, 401);

  const id = Number(params.id);
  if(!id) return bad('Invalid id');
  const data = await request.json().catch(()=>null);
  if(!data) return bad('Brak danych');
  const { title, description, imageUrl, linkUrl, order_num } = data;

  const existing = await env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  if(!existing) return json({error:'Not found'}, 404);

  const newTitle = (title ?? existing.title);
  const newDesc = (description ?? existing.description);
  const newImg  = (imageUrl ?? existing.imageUrl);
  const newLink = (linkUrl ?? existing.linkUrl);
  const newOrder = (order_num ?? existing.order_num);

  await env.DB.prepare('UPDATE projects SET title=?1, description=?2, imageUrl=?3, linkUrl=?4, order_num=?5 WHERE id=?6').bind(newTitle, newDesc, newImg, newLink, Number(newOrder)||0, id).run();
  const row = await env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  return json(row);
};

export const onRequestDelete = async ({ params, env, request }) => {
  const session = getCookie(request, 'session');
  const user = await verifySession(session, env.SESSION_SECRET || '');
  if(!user) return json({error:'Unauthorized'}, 401);

  const id = Number(params.id);
  if(!id) return bad('Invalid id');
  await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
  return new Response(null, {status:204});
};
