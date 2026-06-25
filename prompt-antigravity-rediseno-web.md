# PROMPT — Rediseño profesional de una web existente (para Google Antigravity)

> Pega esto en Antigravity con el proyecto abierto. Solo tienes que rellenar el **BLOQUE 1 (BRIEF)**; el resto ya está preparado. Trabaja preferentemente en modo **Review-driven** y **no apruebes el Plan de Implementación hasta haberlo leído**.

---

## 0. CÓMO QUIERO QUE TRABAJES
Eres un **diseñador de producto senior + ingeniero front-end senior** especializado en webs modernas, accesibles y de alto rendimiento. Vas a **rehacer una web existente** dejándola moderna, muy profesional, atractiva, usable y accesible, **lista para producción**.

Flujo obligatorio (con tus artefactos):
1. **Audita** la web actual antes de tocar nada → artefacto de auditoría.
2. Entrega un **Plan de Implementación** (design system, mapa de páginas/componentes, estrategia de imágenes y plan de verificación) y **espera mi aprobación** antes de programar.
3. **Implementa por fases**, con un **commit por fase** (todo reversible).
4. **Verifica en el navegador integrado**: responsive real, accesibilidad (axe + teclado), y Lighthouse. Adjunta capturas (escritorio y móvil) y un walkthrough.
5. **Entrega**: changelog, `IMAGES.md` e instrucciones de previsualización/despliegue.

Reglas transversales: **no rompas** funciones que ya funcionan; **no inventes datos reales** (teléfono, email, dominio, precios, testimonios) → usa marcadores `[[PENDIENTE: …]]` y pregúntame; **no añadas dependencias** sin justificarlo y pedir mi OK; pregunta solo ante ambigüedad real.

---

## 1. BRIEF (RELLENA ESTO — es lo único que edito)
- **Web actual:** [URL en vivo y/o carpeta/repo del proyecto]
- **Qué conservar / qué cambiar:** [p. ej. conservar textos y estructura, cambiar todo el diseño]
- **Marca:** colores [hex o «propón tú»] · tipografías [o «propón»] · logo [ruta o «propón un wordmark simple»]
- **Sector y público objetivo:** [p. ej. clínica salud / pymes locales en Sevilla]
- **Idioma(s):** [es / es+en]
- **Objetivo principal:** [captar clientes / pedir presupuesto / reservar cita…]
- **Páginas/secciones:** [una página / multipágina + cuáles]
- **Stack (por defecto):** **HTML5 + CSS3 + JavaScript vanilla, sitio estático, sin build, desplegable en GitHub Pages, sin dependencias.** [cámbialo aquí si quieres otro]
- **Despliegue:** [GitHub Pages subpath / dominio propio / otro]

> Usa CSS moderno para que «vanilla» se vea premium: custom properties, `clamp()`, CSS Grid/Flexbox, nesting, `:has()`, container queries y `prefers-*`. Solo introduce un framework o librería si lo justificas y lo apruebo.

---

## 2. FASE A — AUDITORÍA (artefacto, antes de codificar)
Inventaria la web actual: archivos y dependencias; qué funciona y debe conservarse; problemas de diseño, UX, accesibilidad, SEO y rendimiento; enlaces rotos, código muerto y assets huérfanos; rutas absolutas que rompan en GitHub Pages. Resume en 5 líneas + lista priorizada. Migra y **mejora** el contenido existente; no lo pierdas.

## 3. FASE B — PLAN DE IMPLEMENTACIÓN (espera mi aprobación)
Incluye: (a) **design system / tokens** (paleta con roles, escala tipográfica fluida, espaciado, radios, sombras, motion); (b) **mapa de páginas y componentes** reutilizables; (c) **estrategia de imágenes** (ver §8); (d) **plan de verificación** (qué comprobarás en navegador, axe, Lighthouse). No empieces a programar hasta que lo apruebe.

## 4. DISEÑO (moderno, distintivo, profesional)
- Sistema de diseño coherente a partir de tokens; nada de aspecto «plantilla genérica».
- Jerarquía visual clara, retícula sólida, uso generoso del espacio en blanco, ritmo tipográfico.
- Componentes consistentes con **todos los estados**: hover, focus-visible, active, disabled, vacío, cargando, error, éxito.
- **Microinteracciones sobrias** y con propósito (transiciones suaves, revelado al hacer scroll), siempre respetando `prefers-reduced-motion`.
- **Modo oscuro** vía `prefers-color-scheme` (si encaja con la marca).
- Detalles de calidad: foco visible bonito y consistente, iconografía coherente (SVG inline), estados de formulario claros.

## 5. RESPONSIVE
Mobile-first. Tipografía y espaciado fluidos con `clamp()`. Breakpoints probados en móvil, tablet y escritorio (sin scroll horizontal a ningún ancho). Áreas táctiles ≥ 44×44 px. Usa container queries donde aporte. Verifica cada breakpoint en el navegador con capturas.

## 6. ACCESIBILIDAD — WCAG 2.2 AA (no negociable)
- HTML semántico y landmarks (`header/nav/main/section/article/footer`); **un solo `<h1>`** por página y jerarquía de encabezados correcta.
- `alt` en todas las imágenes; `label`/`for` en formularios; `lang` en `<html>`.
- **Foco visible** y **navegación por teclado completa**; orden de tabulación lógico; skip-link al contenido.
- ARIA **solo donde aporte**; textos de enlace/botón descriptivos.
- **Contraste** AA: ≥ 4.5:1 texto normal, ≥ 3:1 texto grande y componentes/UI.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- Formularios accesibles: errores asociados al campo, mensajes con `aria-live`, no depender solo del color.
- **Criterios nuevos de WCAG 2.2** que debes cumplir explícitamente: **2.4.11** foco no oculto, **2.5.8** tamaño de objetivo ≥ 24 px (mejor 44), **3.2.6** ayuda consistente, **3.3.7** entrada redundante, **3.3.8** autenticación accesible (si hay login).
- **Verifica** con axe (0 violaciones), recorrido solo con teclado y revisión de contraste. Adjunta resultados.

## 7. RENDIMIENTO / CORE WEB VITALS
Objetivos: **LCP < 2,5 s · CLS < 0,1 · INP < 200 ms** y **Lighthouse ≥ 95** en las cuatro categorías.
- Imágenes responsive y modernas (ver §8); **`width`/`height` o `aspect-ratio` siempre** para CLS cero.
- `loading="lazy"` + `decoding="async"` en lo que está bajo el pliegue; la imagen **LCP** en `eager` + `fetchpriority="high"`.
- Fuentes: `preconnect`/`preload` del woff2 principal, `font-display: swap`, subset Latin; idealmente autoalójalas.
- CSS crítico mínimo, **JS diferido** (`defer`), sin recursos que bloqueen el render, sin reflows innecesarios.
- Minifica para producción; sin dependencias innecesarias. Adjunta el informe Lighthouse (escritorio y móvil).

## 8. IMÁGENES — DÉJALAS LISTAS, **NO LAS GENERES** (requisito clave)
**No generes ni inventes imágenes**; las pondré yo. Tu trabajo es dejar el código **100 % preparado** para soltarlas sin tocar nada más:
- Usa `<picture>` con `<source>` AVIF y WebP + `<img>` de respaldo.
- **Siempre** `width`+`height` (o `aspect-ratio`) → al insertar la imagen real **no debe moverse el layout** (CLS = 0).
- `srcset` + `sizes` para distintos anchos/densidades.
- `loading`/`decoding`/`fetchpriority` correctos según sea LCP o no (ver §7).
- `alt` descriptivo de marcador en cada imagen (lo ajusto luego).
- Carpeta **`/img/`** (o `/assets/img/`) con **convención de nombres documentada**.
- **Placeholder que respete el espacio**: contenedor con `aspect-ratio` y fondo neutro (o un SVG ligero) para que la web se vea bien **antes** de que añada las fotos reales.
- Genera un **`IMAGES.md`** (manifiesto): por cada imagen → **nombre de archivo, ruta, dimensiones recomendadas (px), relación de aspecto, formato(s), dónde se usa, `alt` sugerido y prioridad (LCP/no)**. Así solo tengo que copiar los archivos con esos nombres.

## 9. SEO Y DATOS ESTRUCTURADOS
`title` y `meta description` únicos por página; `canonical`; Open Graph + Twitter Card; **JSON-LD** apropiado (LocalBusiness / Person / Service / BreadcrumbList); `sitemap.xml` y `robots.txt`; estructura semántica; enlaces descriptivos; URLs limpias. Deja como `[[PENDIENTE]]` lo que dependa de datos reales (URL final, etc.).

## 10. CÓDIGO Y BUENAS PRÁCTICAS
HTML válido; **rutas relativas** (para GitHub Pages); `.nojekyll` si aplica; progressive enhancement (funciona sin JS lo esencial); CSS organizado por tokens y secciones, sin reglas muertas ni duplicadas; JS encapsulado (sin globals, sin `console.log`, listeners pasivos, sin estilos inline que peleen con el CSS); comentarios útiles; nomenclatura consistente (en español si el proyecto ya la usa); cero errores en consola.

## 11. CONTENIDO, UX Y CONVERSIÓN
Propuesta de valor clara en el primer pantallazo; **hero** potente; secciones con orden lógico (embudo); **CTAs prominentes y repetidos**; señales de confianza (casos, testimonios, garantías); contacto sin fricción (WhatsApp/teléfono/formulario); copy claro, conservando y mejorando el existente. **No inventes** datos reales: usa `[[PENDIENTE]]`.

## 12. FASE D — VERIFICACIÓN (con artefactos del navegador)
Tras construir, abre el navegador integrado y comprueba: responsive en los breakpoints (capturas móvil y escritorio), accesibilidad con axe + recorrido por teclado, y Lighthouse (perf/a11y/best practices/SEO). Corrige lo que falle e itera hasta cumplir objetivos. Entrega un **walkthrough** con el resultado.

## 13. ENTREGABLES
Web rehecha y verificada · `IMAGES.md` (manifiesto) · informe Lighthouse + axe · capturas escritorio/móvil · walkthrough · `CHANGELOG.md` por fases · instrucciones de previsualización y despliegue.

## 14. DEFINICIÓN DE «HECHO» (checklist final)
- [ ] Diseño moderno y coherente con design system de tokens; sin aspecto de plantilla.
- [ ] Responsive perfecto en móvil/tablet/escritorio; sin scroll horizontal; targets ≥ 44 px.
- [ ] WCAG 2.2 AA: axe sin violaciones, teclado completo, contraste AA, foco visible, reduced-motion.
- [ ] Lighthouse ≥ 95 (perf/a11y/BP/SEO); LCP/CLS/INP en verde.
- [ ] Imágenes: markup `<picture>` listo, `width/height`, `srcset/sizes`, lazy/eager correctos, placeholders sin CLS, `IMAGES.md` completo. **Ninguna imagen generada por ti.**
- [ ] SEO + JSON-LD + sitemap + robots correctos; metadatos únicos.
- [ ] Rutas relativas; HTML válido; sin código muerto; consola limpia; un commit por fase.
- [ ] Sin datos reales inventados (marcadores `[[PENDIENTE]]`); sin dependencias no aprobadas.
- [ ] Artefactos entregados: capturas, Lighthouse, axe, walkthrough, changelog, instrucciones.

**Empieza por la FASE A (auditoría) y entrégame el Plan de Implementación antes de programar.**
