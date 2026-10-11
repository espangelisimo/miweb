// Protege /api/panel/*: exige un token válido de Cloudflare Access (aunque alguien entre por *.pages.dev).
// Variables: ACCESS_TEAM (p. ej. "websinlio" → websinlio.cloudflareaccess.com) y ACCESS_AUD (Application Audience Tag).

let certs = { keys: [], at: 0 };

const b64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));

async function verify(token, env) {
  const [h, p, sig] = token.split('.');
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const issuer = `https://${env.ACCESS_TEAM}.cloudflareaccess.com`;

  if (Date.now() - certs.at > 3600_000) {
    certs = { keys: (await (await fetch(`${issuer}/cdn-cgi/access/certs`)).json()).keys, at: Date.now() };
  }
  const jwk = certs.keys.find(k => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  const aud = [].concat(payload.aud);
  if (!ok || payload.iss !== issuer || !aud.includes(env.ACCESS_AUD) || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export async function onRequest({ request, env, next, data }) {
  if (!env.ACCESS_TEAM || !env.ACCESS_AUD) return Response.json({ error: 'Panel no configurado' }, { status: 503 });
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  const user = token && await verify(token, env).catch(() => null);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });
  data.user = user.email;
  return next();
}
