import { json, getCookie, verifySession } from '../_utils.mjs';
export const onRequestPost = async ({ env, request }) => {
  const token = getCookie(request, 'session');
  const user = await verifySession(token, env.SESSION_SECRET || '');
  if(!user) return json({error:'Unauthorized'}, 401);
  const res = await env.ASSETS.fetch(new URL('/data/initial-projects.json', request.url));
  const seed = await res.json();
  let inserted = 0;
  for (const p of seed){
    await env.DB.prepare('INSERT INTO projects (title, description, imageUrl, linkUrl, order_num, created_at) VALUES (?1,?2,?3,?4,?5, datetime("now"))')
      .bind(p.title, p.description||'', p.imageUrl||'', p.linkUrl||'', Number(p.order_num)||0)
      .run();
    inserted++;
  }
  return json({ok:true, inserted});
};