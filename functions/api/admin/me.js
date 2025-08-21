import { json, getCookie, verifySession } from '../../_utils.mjs';

export const onRequestGet = async ({ request, env }) => {
  const token = getCookie(request, 'session');
  const user = await verifySession(token, env.SESSION_SECRET || '');
  if (!user) return json({ authenticated:false }, 401);
  return json({ authenticated:true, user });
};
