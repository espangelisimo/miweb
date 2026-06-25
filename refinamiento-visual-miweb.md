# PROMPT PARA CLAUDE CODE — Refinamiento visual del portafolio `miweb`

> **Objetivo de este pase: solo lo VISUAL.** La web ya existe y funciona (repo `espangelisimo/miweb`). Aquí buscamos que se vea profesional: **márgenes coherentes y equilibrados**, hero a su tamaño correcto, **botón flotante de WhatsApp**, cero solapes y cero desbordes en cualquier pantalla, móvil impecable, y coherencia visual con las **subpáginas de caso de estudio** (que ya existen).
>
> **NO toques en este pase** (lo hace el dueño a mano): enlaces rotos / placeholders `[[PENDIENTE]]`, imágenes pesadas, favicon ni `CNAME`. Si necesitas el número de WhatsApp para el botón flotante, usa un marcador y avísame.
>
> **Mantén** el stack actual (HTML + CSS + JS vanilla, GitHub Pages) y los **tokens de `:root`**. Ajusta, no reinventes.

## Reglas de ejecución

1. Trabaja por bloques, en orden. Resume al terminar cada uno.
2. **Verifica en navegador a 360 / 768 / 1024 / 1440 px** después de cada bloque. El criterio de éxito es visual: armonía, equilibrio y nada que se pise o desborde.
3. Reutiliza los tokens existentes (`--e-*`, `--texto-*`, `--color-*`, `--ancho-max`).
4. Aplica todo también a `proyectos/fisiosalud.html` y `proyectos/clinilab.html`.

---

## BLOQUE 1 — Sistema de espaciado y márgenes coherentes (prioridad)

El objetivo es que **todo el sitio respire igual**: los mismos márgenes laterales en todas las secciones, el mismo ritmo vertical entre ellas, y el contenido siempre alineado a las mismas guías.

**1.1 · Márgenes laterales (gutters) unificados y fluidos.** Hoy `.contenedor` usa `padding-inline: var(--e-6)` (24px fijo). Cámbialo por un valor fluido y **aplícalo por igual a TODAS las secciones**:
```css
.contenedor {
  width: 100%;
  max-width: var(--ancho-max);   /* 72rem, se mantiene */
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5vw, 2.5rem); /* 20px en móvil → 40px en escritorio */
}
```
Verifica que **cada sección** (hero, servicios, proceso, portafolio, sobre mí, testimonios, FAQ, contacto y footer) envuelve su contenido en `.contenedor` (o `.contenedor--estrecho`). Si alguna sección mete contenido fuera del contenedor y rompe la guía lateral, corrígelo. Ningún bloque debe pegarse a los bordes ni desalinearse respecto a los demás.

**1.2 · Ritmo vertical uniforme entre secciones.** Mantén `main section { padding-block: var(--e-20) }` en móvil y `var(--e-24)` en `≥48rem` (ya está así). Revisa que:
- No haya secciones con doble espacio (p. ej. el `padding-block` de la sección sumándose a un `margin` grande de su primer hijo). Si pasa, neutraliza el margen del primer/último hijo.
- Ninguna sección quede "corta" respecto a las demás. El salto entre secciones debe sentirse constante.

**1.3 · Separación interna coherente con la escala.** Unifica los espacios internos usando los tokens, no valores sueltos:
- `.seccion-cabecera { margin-bottom: var(--e-12) }` igual en todas las secciones.
- Padding interno de las tarjetas (servicios, proyectos, testimonios) homogéneo entre sí.
- Los `gap` de grids y listas, consistentes (no uno con `e-6` y otro con `e-10` sin motivo).

**1.4 · Equilibrio dentro de cada bloque.** Comprueba que el contenido no quede pegado arriba o abajo dentro de su sección y que el padding sea simétrico salvo donde haya una razón de diseño. El hero, las cabeceras de sección y las tarjetas deben sentirse centrados y equilibrados, no descompensados.

**Resultado esperado:** al hacer scroll, los márgenes laterales no "bailan" entre secciones, la distancia entre secciones es constante, y todo el contenido se alinea a las mismas guías izquierda/derecha.

---

## BLOQUE 2 — Hero a su tamaño correcto

**2.1 · Quita los `<br>` forzados del `<h1>`** (rompen el responsive y desbordan en móvil). Sustituye:
```html
<h1 class="hero-titulo">
  Diseño y desarrollo webs<br>
  que convierten visitas<br>
  en <span class="hero-acento">clientes.</span>
</h1>
```
por:
```html
<h1 class="hero-titulo">
  Diseño y desarrollo webs que convierten visitas en
  <span class="hero-acento">clientes.</span>
</h1>
```
Y añade a `.hero-titulo`: `text-wrap: balance;`

**2.2 · Reduce la escala del hero.** En `:root`, cambia `--texto-hero` de `clamp(2.75rem, 7vw, 4.5rem)` (72px era excesivo) a:
```css
--texto-hero: clamp(2rem, 6vw, 3.5rem);
```

**2.3 · Sin recortes.** El hero tiene `overflow: hidden`; confirma que a 360px el `<h1>` cabe y no se corta ninguna palabra. Revisa también que el `gap` del bloque hero (eyebrow → título → subtítulo → CTAs → tira de confianza) sea equilibrado.

---

## BLOQUE 3 — Botón flotante de WhatsApp

Botón fijo, redondo, accesible y que respeta las zonas seguras del móvil (notch / barra inferior de iOS).

**3.1 · HTML** (colócalo justo antes de `</body>`, en `index.html` y en las dos subpáginas):
```html
<a class="wa-flotante"
   href="https://wa.me/[[TU_NÚMERO]]"
   target="_blank" rel="noopener noreferrer"
   aria-label="Escríbeme por WhatsApp (abre WhatsApp)">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .103 5.359.1 11.892c0 2.096.546 4.142 1.588 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.448h.005c6.582 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.479-8.464z"/>
  </svg>
</a>
```

**3.2 · CSS:**
```css
.wa-flotante {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 90;                 /* bajo el header sticky (100), sobre el contenido */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radio-pill);
  background: #25D366;         /* verde WhatsApp */
  color: #fff;
  box-shadow: var(--sombra-l);
  transition: transform var(--t-normal), box-shadow var(--t-normal);
}
.wa-flotante svg { width: 1.75rem; height: 1.75rem; }
.wa-flotante:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0,0,0,.22);
  color: #fff;
}
.wa-flotante:focus-visible { outline: 3px solid var(--color-acento); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .wa-flotante { transition: none; } }
```

**3.3 · Que no estorbe.** Comprueba que el botón flotante no tape el botón "Enviar mensaje" del formulario ni texto del footer en ninguna anchura. Si en móvil queda muy pegado al CTA del footer, basta con el `bottom` ya definido; si aun así molesta, reduce a `3rem` el tamaño en `<40rem`.

---

## BLOQUE 4 — Botones a lo ancho en móvil

Por debajo de `40rem`, los pares de CTA se apilan a ancho completo (se ve más profesional y son más fáciles de pulsar):
```css
@media (max-width: 39.999rem) {
  .hero-ctas,
  .seccion-cta { flex-direction: column; align-items: stretch; }
  .hero-ctas .btn,
  .seccion-cta .btn { width: 100%; }
}
```
Mantén `min-height: 44px`. (El menú móvil ya apila bien y su `nav-cta` ya va a ancho completo: respétalo.)

---

## BLOQUE 5 — Solapamientos y desbordes (cero)

**5.1 · Proceso / timeline.** `.proceso-numero` es absoluto y grande (2.75rem). En las dos disposiciones —vertical en móvil, grid de 5 columnas en `≥48rem`— **verifica que el número no toque ni se solape con el título** ("Propuesta y diseño", "Publicación y soporte"). Si se pisan, aumenta el espacio reservado o baja el número a ~2.25rem.

**5.2 · Sin scroll horizontal.** Añade de seguridad `overflow-x: hidden;` a `body` y comprueba en la vista de 360px que ninguna sección genere desplazamiento lateral (vigila hero y timeline).

**5.3 · Cabeceras y tarjetas.** Revisa que `eyebrow + título + subtítulo` no se amontonen en móvil y que las tarjetas no se solapen entre sí ni con sus imágenes.

---

## BLOQUE 6 — Subpáginas de caso de estudio (ya existen → coherencia visual)

`proyectos/fisiosalud.html` y `proyectos/clinilab.html` **ya están construidas** y cuentan la historia correcta: **El cliente → El reto → Mi enfoque → La solución → El resultado → CTA final**. No las rehagas; aplícales el mismo pulido visual:

**6.1 ·** Mismo **sistema de márgenes y ritmo** del Bloque 1 (gutters fluidos, ritmo vertical uniforme, separaciones internas coherentes).

**6.2 ·** **Header y footer idénticos** a la home, y el **botón flotante de WhatsApp** también presente.

**6.3 ·** Hero del caso (`.caso-hero`, `clamp(2rem, 5vw, 3.25rem)`) equilibrado; breadcrumb, `.caso-stats`, figuras y `.caso-resultados` bien espaciados y alineados a las mismas guías.

**6.4 ·** Verifica que ambas subpáginas estén **enlazadas desde las tarjetas del portafolio** de la home y que el botón "volver" / breadcrumb funcione.

**6.5 · Honestidad (importante):** como son proyectos de demostración, cualquier métrica visible (los valores de Lighthouse de `.caso-resultados`) debe ser **real**, medida sobre tu propia demo. No dejes cifras inventadas.

---

## BLOQUE 7 — QA visual en todas las pantallas

Checklist a 360 / 768 / 1024 / 1440 px, en `index.html` y en las dos subpáginas:
- [ ] Gutters laterales **idénticos** en todas las secciones; nada pegado a los bordes.
- [ ] Ritmo vertical entre secciones **constante**.
- [ ] Hero a tamaño correcto, sin `<br>`, sin recortes.
- [ ] Botón flotante de WhatsApp visible, bien colocado, **sin tapar** formulario ni footer, con foco visible.
- [ ] CTAs a ancho completo en móvil.
- [ ] Cero solapes (número de proceso ↔ título) y **cero scroll horizontal**.
- [ ] Coherencia visual total entre home y subpáginas (mismos márgenes, tipografía y componentes).
- [ ] Foco de teclado visible en todos los enlaces y botones.

---

## Lo que necesito aportarte yo

`[[TU_NÚMERO]]` de WhatsApp para el botón flotante (formato internacional, sin `+` ni espacios). El resto de placeholders, imágenes, favicon y CNAME los gestiono yo a mano, como acordamos.
