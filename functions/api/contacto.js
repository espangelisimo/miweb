// POST /api/contacto — recibe el formulario, lo guarda en D1 y avisa por email.
// Variables (Cloudflare Pages → Settings): DB (D1), TURNSTILE_SECRET, RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM, SITE_NAME.

const json = (body, status = 200) => Response.json(body, { status });
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // sin configurar: no bloquea (se avisa en el log)
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  return (await res.json()).success === true;
}

async function notify(env, s) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_TO) return;
  const site = env.SITE_NAME || 'tu web';
  const tel = s.telefono.replace(/[^\d+]/g, '').replace(/^(?!\+|34)/, '34').replace(/^\+/, '');
  const rows = [['Necesita', s.necesidad], ['Nombre', s.nombre], ['Negocio / web', s.negocio], ['Email', s.email], ['Teléfono', s.telefono], ['Mensaje', s.mensaje]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#667;vertical-align:top">${k}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const buttons = [
    `<a href="mailto:${esc(s.email)}" style="display:inline-block;padding:10px 16px;background:#233a5c;color:#fff;border-radius:8px;text-decoration:none;margin:4px 8px 4px 0">Responder por email</a>`,
    s.telefono ? `<a href="https://wa.me/${tel}" style="display:inline-block;padding:10px 16px;background:#1fa855;color:#fff;border-radius:8px;text-decoration:none;margin:4px 8px 4px 0">WhatsApp</a>` : '',
    env.PANEL_URL ? `<a href="${esc(env.PANEL_URL)}" style="display:inline-block;padding:10px 16px;border:1px solid #ccd;color:#233a5c;border-radius:8px;text-decoration:none;margin:4px 0">Ver en el panel</a>` : '',
  ].join('');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.NOTIFY_FROM,
      to: [env.NOTIFY_TO],
      reply_to: s.email,
      subject: `Nueva solicitud: ${s.negocio || s.nombre}${s.necesidad ? ` (${s.necesidad})` : ''}`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#223"><h2 style="margin:0 0 12px">Nueva solicitud desde ${esc(site)}</h2><table>${rows}</table><p style="margin-top:16px">${buttons}</p></div>`,
      text: rows.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '),
    }),
  }).then(r => { if (!r.ok) return r.text().then(t => console.error('[resend]', r.status, t)); });
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.DB) return json({ ok: false, error: 'Base de datos no configurada' }, 500);

  const type = request.headers.get('content-type') || '';
  let data;
  try { data = type.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData()); }
  catch { return json({ ok: false, error: 'Formato no válido' }, 400); }

  if (data.botcheck) return json({ ok: true }); // trampa para bots: se descarta en silencio

  const s = {
    nombre: clean(data.nombre, 100),
    negocio: clean(data.negocio, 150),
    email: clean(data.email, 150).toLowerCase(),
    telefono: clean(data.telefono, 30),
    necesidad: clean(data.necesidad, 60),
    mensaje: String(data.mensaje ?? '').trim().slice(0, 2000),
  };
  if (!s.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) || !data.privacidad) {
    return json({ ok: false, error: 'Revisa los campos obligatorios' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (!env.TURNSTILE_SECRET) console.warn('[contacto] TURNSTILE_SECRET sin configurar');
  if (!(await turnstileOk(env, data['cf-turnstile-response'], ip))) {
    return json({ ok: false, error: 'Verificación antispam fallida' }, 403);
  }

  // Límite: 5 envíos cada 10 min por IP (se guarda un hash diario, nunca la IP)
  const ipHash = await sha256(ip + new Date().toISOString().slice(0, 10));
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM solicitudes WHERE ip_hash = ? AND creado > datetime('now', '-10 minutes')").bind(ipHash).first();
  if (n >= 5) return json({ ok: false, error: 'Demasiados envíos, prueba más tarde' }, 429);

  await env.DB.prepare('INSERT INTO solicitudes (nombre, negocio, email, telefono, necesidad, mensaje, ip_hash, origen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(s.nombre, s.negocio, s.email, s.telefono, s.necesidad, s.mensaje, ipHash, clean(request.headers.get('Referer'), 200))
    .run();

  waitUntil(notify(env, s).catch(e => console.error('[notify]', e)));
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'Método no permitido' }, 405);
