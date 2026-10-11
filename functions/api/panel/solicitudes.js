// /api/panel/solicitudes — listar (JSON o CSV), cambiar estado/notas y borrar. Protegido por _middleware.js.

const ESTADOS = ['nueva', 'contactado', 'cliente', 'descartado'];

export async function onRequestGet({ request, env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, creado, nombre, negocio, email, telefono, necesidad, mensaje, estado, notas FROM solicitudes ORDER BY creado DESC LIMIT 1000'
  ).all();

  if (new URL(request.url).searchParams.get('formato') === 'csv') {
    const cols = ['id', 'creado', 'nombre', 'negocio', 'email', 'telefono', 'necesidad', 'mensaje', 'estado', 'notas'];
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + [cols.join(';'), ...results.map(r => cols.map(c => cell(r[c])).join(';'))].join('\r\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="solicitudes.csv"' } });
  }
  return Response.json(results);
}

export async function onRequestPatch({ request, env }) {
  const { id, estado, notas } = await request.json();
  if (!Number.isInteger(id)) return Response.json({ error: 'id no válido' }, { status: 400 });
  if (estado !== undefined && !ESTADOS.includes(estado)) return Response.json({ error: 'estado no válido' }, { status: 400 });
  await env.DB.prepare('UPDATE solicitudes SET estado = COALESCE(?, estado), notas = COALESCE(?, notas) WHERE id = ?')
    .bind(estado ?? null, notas === undefined ? null : String(notas).slice(0, 2000), id).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id)) return Response.json({ error: 'id no válido' }, { status: 400 });
  await env.DB.prepare('DELETE FROM solicitudes WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}
