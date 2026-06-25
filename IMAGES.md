# Manifiesto de Imágenes (IMAGES.md)

Este documento contiene la lista exacta de imágenes que necesitas exportar y colocar en la carpeta `img/` (y `assets/`) de tu proyecto. El código HTML ya está preparado con la etiqueta `<picture>` para cargar automáticamente la versión más óptima (`.avif`, `.webp` o el fallback en `.jpg`) y evitar saltos de contenido (CLS).

**Regla de oro:**
1. Crea tu imagen final en las dimensiones recomendadas.
2. Exporta esa imagen en 3 formatos: `.avif`, `.webp` y `.jpg`.
3. Nómbralas **exactamente** como indica la columna "Archivos Requeridos".
4. Sustituye en tu código los marcadores `alt="[MARCADOR...]"` por descripciones reales.

| Ubicación | Archivos Requeridos (`img/`) | Dimensiones | Relación de Aspecto | Prioridad de Carga | Alt sugerido |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero (Portada)** | `hero-image.avif`, `hero-image.webp`, `hero-image.jpg` | 800 x 1000 px | 4:5 (Vertical) | **Alta (LCP - eager)** | "Retrato de Ángel Velarde trabajando en diseño web en su oficina de Sevilla." |
| **Proyecto 1** | `proyecto-1.avif`, `proyecto-1.webp`, `proyecto-1.jpg` | 800 x 500 px | 16:10 (Apaisado) | Baja (lazy load) | "Captura de pantalla del sitio web de FisioSalud San José." |
| **Proyecto 2** | `proyecto-2.avif`, `proyecto-2.webp`, `proyecto-2.jpg` | 800 x 500 px | 16:10 (Apaisado) | Baja (lazy load) | "Captura de pantalla del sitio web del laboratorio Clinilab Pastor." |
| **Sobre Mí** | `about.avif`, `about.webp`, `about.jpg` | 600 x 600 px | 1:1 (Cuadrado) | Baja (lazy load) | "Ángel Velarde sonriendo mirando a cámara." |
| **Testimonio 1** | `testimonio-1.avif`, `testimonio-1.webp`, `testimonio-1.jpg` | 100 x 100 px | 1:1 (Cuadrado) | Baja (lazy load) | "Foto de perfil de [Nombre Cliente]." |
| **Testimonio 2** | `testimonio-2.avif`, `testimonio-2.webp`, `testimonio-2.jpg` | 100 x 100 px | 1:1 (Cuadrado) | Baja (lazy load) | "Foto de perfil de [Nombre Cliente]." |

## Metadatos (Carpeta `assets/`)
Además, necesitas proporcionar la imagen para cuando alguien comparta tu web por WhatsApp, LinkedIn, etc:

| Archivo | Ruta | Dimensiones | Relación de Aspecto | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `og-image.jpg` | `assets/og-image.jpg` | 1200 x 630 px | 1.91:1 | Open Graph / Twitter Cards |
