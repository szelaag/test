// Shared utils for Cloudflare Pages Functions
export function json(data, status=200, headers={}){
  return new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json',...headers}});
}
export function bad(msg='Bad request', status=400){ return json({error: msg}, status); }

async function hmacSHA256(key, msg){
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function signSession(payload, secret){
  const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const body = btoa(JSON.stringify(payload));
  const sig = await hmacSHA256(secret, header + '.' + body);
  return `${header}.${body}.${sig}`;
}
export async function verifySession(token, secret){
  if(!token) return null;
  const [h,b,s] = token.split('.');
  if(!h||!b||!s) return null;
  const expected = await hmacSHA256(secret, `${h}.${b}`);
  if(expected !== s) return null;
  try{
    const payload = JSON.parse(atob(b));
    if(payload.exp && Date.now()/1000 > payload.exp) return null;
    return payload;
  }catch{ return null; }
}
export function getCookie(req,name){
  const c = req.headers.get('Cookie')||'';
  const m = c.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
export function setCookie(name,value,opts={}){
  const {httpOnly=true, sameSite='Lax', path='/', maxAge, secure=true} = opts;
  let str = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}; HttpOnly;`;
  if(maxAge) str += ` Max-Age=${maxAge};`;
  if(secure) str += ' Secure;';
  return str;
}
