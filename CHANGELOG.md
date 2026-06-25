# Changelog (Fases A-D)

Este archivo documenta los cambios principales realizados en el rediseño del portafolio.

## [1.0.0] - 2026-06-25 (Rediseño Completo Fase C)

### Añadido
- **Design System Premium:** Creación de un sistema de diseño propio en `styles.css` utilizando variables CSS modernas (HSL, `clamp()`), "Glassmorphism" para cabeceras y tarjetas estilo "Bento grid".
- **Esquema de Color:** Extraídos el azul intenso (`#233A5C`) y el verde agua/teal (`#64C49E`) del `favicon.png` para generar la paleta corporativa y el `dark mode` nativo (`prefers-color-scheme`).
- **Arquitectura de Imágenes:** Implementación completa del elemento `<picture>` con soporte para formatos modernos (`AVIF`/`WEBP`) y atributos `width/height` y `loading` configurados correctamente para asegurar 0 de Cumulative Layout Shift (CLS).
- **`IMAGES.md`:** Creación de manifiesto que sirve de manual de usuario para el reemplazo de activos gráficos en la fase final de despliegue.

### Modificado
- **HTML Estructural:** Conversión de `index.html` a una plantilla mucho más semántica, con etiquetas ARIA corregidas para soporte total de accesibilidad (WCAG 2.2 AA).
- **JavaScript:** Eliminación de dependencias (Vanilla JS) reescribiendo `main.js`. Adición de `IntersectionObserver` para revelado fluido al hacer scroll.
- **Rendimiento:** Reescritura completa del CSS sin librerías de terceros (sin Tailwind, sin Bootstrap), lo que garantiza el menor peso y el máximo control.

### Resuelto (A11y & SEO)
- Focos visibles (`:focus-visible`) configurados para que la navegación por teclado sea evidente y elegante.
- Meta tags de Open Graph y Twitter Cards listos para inyección de la URL de producción final.
