# PROMPT PARA CLAUDE CODE — Correcciones auditoría `espangelisimo/miweb`

## CONTEXTO (no lo cambies)
Sitio **estático vanilla** (HTML5 + CSS3 + JS, sin frameworks ni build) desplegado en **GitHub Pages**, hoy en `https://espangelisimo.github.io/miweb/`.
Reglas innegociables:
- **No** introduzcas frameworks, librerías, bundlers ni dependencias en el sitio.
- **No** cambies el diseño visual ni la funcionalidad. Solo corrige bugs, elimina lo que sobra y mejora rendimiento/coherencia.
- **Rutas relativas** siempre (nada de `/...` que rompa bajo `/miweb/`).
- **No inventes datos reales** (teléfono, email, dominio, Form-ID, coordenadas). Donde haya `[[PENDIENTE]]`/`[[TU_NÚMERO]]`, **pregúntame** antes de rellenar.
- Trabaja por **bloques**, un **commit por bloque** con mensaje claro, y al final de cada bloque **verifica** (sin errores en consola, responsive intacto, sin enlaces rotos).
- Puedo recuperar desde GitHub: actúa con decisión pero de forma trazable.

Ejecuta los bloques 1→6 (🔴🟠🟡). El bloque 7 requiere mis datos. Las propuestas 🔵 del final **no** se tocan salvo que lo confirme.

---

## BLOQUE 1 — 🔴 Rutas relativas + unificar cache-bust (todas las páginas)
**Por qué:** bajo `/miweb/`, todo `href="/..."` apunta a la raíz `espangelisimo.github.io/`, no a `/miweb/`. Rompe la navegación de las subpáginas, deja el 404 sin estilos y los favicons en 404.

**`index.html`**
- Logo: `<a href="/" class="logo"` → `<a href="index.html" class="logo"`

**`proyectos/fisiosalud.html` y `proyectos/clinilab.html`** (idénticos en estructura; aplica a ambos)
- Logo: `href="/"` → `href="../index.html"`
- Nav (`<li><a class="nav-enlace" href="/#...">`): `/#inicio`→`../index.html#inicio`, `/#servicios`→`../index.html#servicios`, `/#proceso`→`../index.html#proceso`, `/#portafolio`→`../index.html#portafolio` (mantén `nav-enlace activo`), `/#sobre-mi`→`../index.html#sobre-mi`, `/#contacto`→`../index.html#contacto`
- Botón nav-cta: `href="/#contacto"` → `href="../index.html#contacto"`
- Breadcrumb: `<a href="/">Inicio</a>`→`<a href="../index.html">Inicio</a>`; `<a href="/#portafolio">Proyectos</a>`→`<a href="../index.html#portafolio">Proyectos</a>`
- CTA final: `/#contacto`→`../index.html#contacto`; `/#portafolio`→`../index.html#portafolio`
- Footer nav (7 enlaces `/#...`): → `../index.html#...` (incluye `/#faq`→`../index.html#faq`)

**`404.html`**
- CSS: `<link rel="stylesheet" href="/css/styles.css?v=1">` → `<link rel="stylesheet" href="css/styles.css?v=3">`
- Logo: `href="/"` → `href="index.html"`
- Botones: `<a href="/" ...>Ir al inicio</a>`→`href="index.html"`; `<a href="/#contacto" ...>`→`href="index.html#contacto"`

> Nota 404: vive en la raíz del sitio; con rutas relativas se estiliza bien en el caso normal (`/miweb/<typo>`). Para typos muy anidados podría no resolver el CSS, pero es un caso marginal.

**Commit:** `fix(rutas): rutas relativas para GitHub Pages y unificar cache-bust a v=3`
**Verifica:** desde cada caso de estudio, “Inicio/Proyectos/Contacto”, breadcrumb y CTAs vuelven a `/miweb/...`; el 404 carga con estilos; sin enlaces a `espangelisimo.github.io/` raíz.

---

## BLOQUE 2 — 🔴 Coherencia de fuentes (CSS ↔ HTML)
**Por qué:** en `css/styles.css` `:root`, `--fuente-display` y `--fuente-cuerpo` están declaradas **dos veces**; gana la segunda (Plus Jakarta Sans / Inter), pero el `<link>` solo carga **Syne + DM Sans**. Resultado: todo el texto cae a `system-ui` y se descargan dos fuentes que no se usan.

En `css/styles.css`, elimina las dos líneas redundantes (deja activas Syne + DM Sans, que es lo que carga el HTML):
```css
/* BORRAR estas dos: */
--fuente-display: 'Plus Jakarta Sans', system-ui, sans-serif;
   --fuente-cuerpo:  'Inter', system-ui, sans-serif;
```
Quedando:
```css
--fuente-display: 'Syne', system-ui, sans-serif;
--fuente-cuerpo:  'DM Sans', system-ui, sans-serif;
```
(Opcional: limpia el bloque de comentarios de “Fuentes alternativas” si no lo usas.)

**Commit:** `fix(fuentes): eliminar variables duplicadas; usar Syne + DM Sans cargadas en el HTML`
**Verifica:** títulos en Syne, cuerpo en DM Sans; en Network ya no aparece ninguna familia descargada sin aplicar.

---

## BLOQUE 3 — 🟠 Favicons: referencias correctas + tamaños + limpieza
**Por qué:** el HTML referencia `/favicon.ico`, `/assets/icon.svg`, `/assets/apple-touch-icon.png` que **no existen** (y con ruta absoluta). Lo que existe pesa demasiado: `favicon.png` 1500×1500 (498 KB), `favicon2.png` 1500×1500 (966 KB, duplicado huérfano), `favicon.svg` 221 KB (logo ancho 351×226 auto-trazado, no un icono cuadrado).

1) **Genera un set correcto** desde `assets/favicon.png` (si hay ImageMagick/`convert` o `sharp` disponible; si no, pídeme que lo genere en realfavicongenerator.net):
```bash
cd assets
convert favicon.png -resize 32x32   favicon-32.png
convert favicon.png -resize 180x180 favicon-180.png
convert favicon.png -resize 48x48 -define icon:auto-resize=16,32,48 favicon.ico
```
2) **Corrige las referencias** (relativas) en `index.html` y `404.html`:
```html
<link rel="icon" href="assets/favicon.ico" sizes="any">
<link rel="icon" href="assets/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/favicon-180.png">
```
y en `proyectos/fisiosalud.html` / `proyectos/clinilab.html` con `../assets/...`.
3) **Limpieza:** elimina `assets/favicon2.png` (huérfano). Mueve `assets/favicon.png` (1500px) a una carpeta de fuentes no desplegada (p. ej. `/source/`) o redúcela; no es necesaria en producción.

> El `favicon.svg` actual es un logotipo ancho, no sirve como icono cuadrado: no lo referencies como favicon. Si quieres un favicon SVG vectorial cuadrado y ligero, lo diseñamos aparte.

**Commits:** `fix(favicon): referencias relativas y set de iconos a tamaño correcto` · `chore(assets): eliminar favicon2.png huérfano (~966 KB)`
**Verifica:** el favicon aparece en la pestaña en las 4 páginas; sin 404 de iconos en Network.

---

## BLOQUE 4 — 🟠 Accesibilidad del acordeón FAQ
**Por qué:** los botones `.faq-pregunta` no tienen `aria-expanded` inicial; `js/main.js` solo lo fija al pulsar, así que los lectores de pantalla no los anuncian como plegables hasta el primer clic.

En `js/main.js`, dentro de `initFaq()`, justo después de obtener `items`, inicializa el estado:
```js
items.forEach(item => {
  const btn = item.querySelector('.faq-pregunta');
  btn.setAttribute('aria-expanded', item.classList.contains('abierto') ? 'true' : 'false');
});
```
(Opcional, mejora a11y completa: añade `id` a cada `.faq-respuesta` y `aria-controls` en su botón.)

**Commit:** `fix(a11y): estado aria-expanded inicial en el acordeón FAQ`
**Verifica:** los botones se anuncian como “contraído/expandido” desde la carga; el comportamiento visual no cambia.

---

## BLOQUE 5 — 🟠 CNAME y README
**Por qué:** `CNAME` contiene `[[PENDIENTE: tu-dominio.com]]` (host inválido) y el README dice “añadir CNAME” pese a existir.
- **Si tengo dominio listo** (te pregunto): pon el dominio real, p. ej. `websinlio.es`.
- **Si no:** **borra** el archivo `CNAME` para servir limpio en `/miweb/`.
- Ajusta el README: corrige el bloque de despliegue/CNAME y elimina la referencia a `/img/` (no existe esa carpeta).

**Commit:** `fix(deploy): CNAME válido (o eliminado) y README acorde`
**Verifica:** Settings → Pages sin error de dominio.

---

## BLOQUE 6 — 🟡 Limpieza de código muerto + detalles
**`css/styles.css`** (busca y elimina; son restos de una implementación previa con `<details>`/`<summary>` — el FAQ usa `<button>`):
```css
.faq-pregunta::-webkit-details-marker { display: none; }   /* BORRAR */
.faq-pregunta::marker { display: none; }                   /* BORRAR */
```
y quita `list-style: none;` de la regla `.faq-pregunta { ... }` (no aplica a un `<button>`).
Elimina también las utilidades sin uso `.sr-only { ... }` y `.texto-equilibrado { text-wrap: balance; }` (salvo que vayas a aplicar `texto-equilibrado` a los títulos — ver propuesta P2; en ese caso, déjala).

**Año del footer (fallback):** cambia `2025` → `2026` en el `<span class="footer-anio">2025</span>` de `index.html`, `proyectos/fisiosalud.html`, `proyectos/clinilab.html` y `404.html` (el JS ya lo actualiza, esto es el fallback sin JS).

**`.nojekyll`:** crea un archivo vacío `.nojekyll` en la raíz (desactiva el procesamiento Jekyll innecesario).

**Commit:** `chore(limpieza): eliminar CSS muerto, año fallback a 2026 y añadir .nojekyll`
**Verifica:** sin cambios visuales; FAQ sigue funcionando; consola limpia.

---

## BLOQUE 7 — ⏸ Marcadores `[[PENDIENTE]]` (REQUIERE MIS DATOS — NO INVENTAR)
No ejecutes hasta que te dé los valores. Hay **dos formatos** de marcador (`[[PENDIENTE: ...]]`, `[[TU_NÚMERO]]`, y sueltos `[[P]]`/`[[PENDIENTE]]`): cuando los rellenemos, hazlo de una pasada para no olvidar ninguno.
Pendientes que **rompen función/SEO** y debo facilitarte:
- WhatsApp (`wa.me/...`) — incluye el `[[TU_NÚMERO]]` del botón flotante.
- Email (`mailto:`), Formspree `[[PENDIENTE: Form-ID]]` (sin él el formulario no envía).
- Enlaces legales `accesibilidad.html` / `aviso-legal.html` (o quitar los enlaces hasta crear las páginas).
- URL del sitio en canonical/OG/Twitter/JSON-LD, `sitemap.xml` y `robots.txt`; y las imágenes `og-*.jpg` (no existen aún).

Cuando te los pase: **commit** `content: completar datos de contacto, SEO y enlaces legales`.

---

## CHECKLIST FINAL
- [ ] Todas las rutas son relativas; nada apunta a `espangelisimo.github.io/` raíz.
- [ ] Las 4 páginas cargan CSS, JS y favicon sin 404 (Network limpio).
- [ ] Tipografía Syne + DM Sans aplicada; sin fuentes descargadas y no usadas.
- [ ] 404 con estilos; cache-bust `v=3` unificado.
- [ ] FAQ con `aria-expanded` inicial; comportamiento intacto.
- [ ] CNAME válido o eliminado; README coherente; `.nojekyll` presente.
- [ ] Sin CSS muerto (`::-webkit-details-marker`, `::marker`, utilidades sin uso).
- [ ] Sin errores en consola; responsive (móvil/escritorio) sin romperse; menú móvil OK.
- [ ] Sin cambios de diseño/funcionalidad fuera de lo auditado.

---

## 🔵 PROPUESTAS (NO EJECUTAR salvo que lo confirme)
- **P1.** Ocultar `.wa-flotante` (z-index 9999) cuando el menú móvil está abierto (hoy flota sobre el overlay/drawer).
- **P2.** Aplicar `.texto-equilibrado` (`text-wrap: balance`) a `.hero-titulo` y a los `h2` de sección (mejor salto de línea; reutiliza la utilidad ya definida).
- **P3.** Cuando lleguen capturas reales: WebP + `width`/`height` + `loading="lazy"` en los `<div>` placeholder de proyectos (evita CLS).
- **P4.** Auto-alojar/subsetear (Latin) las fuentes y `preload` del woff2 principal para reducir bloqueo de render.
- **P5.** Minificar `styles.css` para producción (Pages ya sirve gzip; ganancia menor).
