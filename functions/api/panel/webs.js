// /api/panel/webs — índice de demos publicadas en demos.websinlio.com (lo genera tools/publicar-demos.mjs).
// Protegido por _middleware.js. La URL secreta del índice va en la variable DEMOS_INDICE_URL.

export async function onRequestGet({ env }) {
  if (!env.DEMOS_INDICE_URL) return Response.json({ demos: [], aviso: 'Falta la variable DEMOS_INDICE_URL en Cloudflare.' });
  const res = await fetch(env.DEMOS_INDICE_URL, { cf: { cacheTtl: 0 } }).catch(() => null);
  if (!res?.ok) return Response.json({ demos: [], aviso: `No se ha podido leer el índice de demos (${res?.status ?? 'sin respuesta'}).` });
  return new Response(res.body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
