// /api/panel/auditoria — trae lo que el navegador no puede leer por CORS: el HTML, las cabeceras, las redirecciones
// y los ficheros de rastreo de una web. El análisis y la nota se calculan en panel/auditoria.html.
// Solo lecturas pasivas (lo mismo que ve un visitante): no prueba rutas sensibles ni ataques.
// Protegido por _middleware.js. Variable opcional PSI_KEY (API key de PageSpeed Insights).

const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36 websinlio-auditor';
const MAX_HTML = 1_500_000;

const privado = h => /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$|.*\.local$|.*\.internal$)/i.test(h);

function validar(raw) {
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(u.protocol) || privado(u.hostname)) return null;
    return u;
  } catch { return null; }
}

// Sigue las redirecciones a mano para poder enseñarlas
async function traer(url, { cuerpo = true, saltos = 8 } = {}) {
  const cadena = [];
  let actual = url, res;
  const t0 = Date.now();
  for (let i = 0; i <= saltos; i++) {
    res = await fetch(actual, { redirect: 'manual', headers: { 'User-Agent': UA, 'Accept-Language': 'es-ES,es;q=0.9', Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(15000) });
    cadena.push({ url: actual, status: res.status });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) { actual = new URL(loc, actual).href; continue; }
    break;
  }
  const ms = Date.now() - t0;
  let texto = '';
  if (cuerpo) { texto = await res.text(); if (texto.length > MAX_HTML) texto = texto.slice(0, MAX_HTML); }
  else res.body?.cancel();
  return { final: actual, status: res.status, cadena, ms, headers: Object.fromEntries(res.headers), texto };
}

async function estado(url, cuerpo = false) {
  try {
    const r = await traer(url, { cuerpo, saltos: 5 });
    return { status: r.status, final: r.final, ...(cuerpo ? { texto: r.texto.slice(0, 20000), tipo: r.headers['content-type'] || '' } : {}) };
  } catch (e) { return { status: 0, error: e.name === 'TimeoutError' ? 'tiempo agotado' : e.message }; }
}

export async function onRequestGet({ request, env }) {
  const q = new URL(request.url).searchParams;
  const u = validar(q.get('url') || '');
  if (!u) return Response.json({ error: 'URL no válida' }, { status: 400 });

  // PageSpeed con la API key del servidor (si no hay, el navegador la llama directamente)
  if (q.get('psi')) {
    if (!env.PSI_KEY) return Response.json({ sinClave: true });
    const cats = ['performance', 'seo', 'accessibility', 'best-practices'].map(c => `category=${c}`).join('&');
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(u.href)}&strategy=${q.get('psi') === 'desktop' ? 'desktop' : 'mobile'}&locale=es&${cats}&key=${env.PSI_KEY}`);
    return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json' } });
  }

  let pagina;
  try { pagina = await traer(u.href); }
  catch (e) { return Response.json({ error: `La web no responde: ${e.name === 'TimeoutError' ? 'tiempo agotado (15 s)' : e.message}` }, { status: 502 }); }

  const fin = new URL(pagina.final);
  const base = fin.origin;
  const azar = Math.random().toString(36).slice(2, 10);
  const [http, robots, sitemap, llms, noExiste] = await Promise.all([
    // Desde dentro de Cloudflare, la web propia no pasa por la redirección http→https (falso aviso): no se comprueba
    fin.protocol === 'https:' && fin.host !== new URL(request.url).host ? estado(`http://${fin.host}${fin.pathname}`) : Promise.resolve(null),
    estado(`${base}/robots.txt`, true),
    estado(`${base}/sitemap.xml`),
    estado(`${base}/llms.txt`),
    estado(`${base}/no-existe-${azar}`),
  ]);

  return Response.json({ ...pagina, extras: { http, robots, sitemap, llms, noExiste } });
}

// Comprueba enlaces internos (máx. 25) para detectar rotos
export async function onRequestPost({ request }) {
  const { enlaces = [] } = await request.json().catch(() => ({}));
  const lista = [...new Set(enlaces)].map(validar).filter(Boolean).slice(0, 25);
  const res = await Promise.all(lista.map(async u => [u.href, (await estado(u.href)).status]));
  return Response.json(Object.fromEntries(res));
}
