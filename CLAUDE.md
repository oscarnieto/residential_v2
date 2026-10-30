## Publicación (obligatorio)

- La web se publica con GitHub Pages desde la rama `main`: https://oscarnieto.github.io/residential_v2/
- Después de cada cambio, sin esperar a que se pida: `git add -A`, commit con un mensaje breve en español y `git push origin main`. No dejar cambios sin subir al terminar un turno.
- Trabajar siempre directamente sobre `main`, sin ramas ni pull requests.
- Tras subir, dar el enlace de la web e indicar que tarda 1–2 minutos en actualizarse.

## Maquetación desde Figma

- Programar el diseño de Figma tal cual: medidas, tipografías, colores, espaciados y textos exactos. No inventar ni "mejorar" el diseño.
- Imágenes: usar siempre las de Figma. Exportarlas a 2x del tamaño en que se muestran y optimizarlas en peso con buena resolución: AVIF (calidad ~60) con JPEG de respaldo (calidad ~78), o PNG si necesitan transparencia, con `<picture>`. Guardarlas en `img/`, con `width`/`height` y `loading="lazy"` salvo en la primera pantalla.
- Si falta algo (textos, imágenes, iconos, versión móvil, enlaces…), avisar en el momento y dejar un hueco visible marcado como `PENDIENTE`; nunca inventarlo.

## Animaciones y efectos de scroll

- **De momento NO añadir animaciones ni efectos de ScrollKit** (sin atributos `data-reveal`, `data-zoom`, etc.). Mantener solo el código de instalación del kit en cada página. Las animaciones se añadirán más adelante, cuando se pidan caso por caso.

- Usar exclusivamente ScrollKit (skill `scrollkit`). Archivos del kit: `scroll-kit/css/scroll-kit.css` y `scroll-kit/js/scroll-kit.js`.
- Catálogo de efectos con códigos E01–E31, snippets y recetas: `.claude/skills/scrollkit/EFECTOS.md`. Leerlo antes de añadir cualquier animación.
- Cuando se pida un efecto por código (p. ej. "E16 en la galería"), aplicar el snippet exacto de su ficha.
- No modificar los archivos del kit salvo petición expresa. El diseño va en el CSS del proyecto.
- Toda página HTML nueva parte de `.claude/skills/scrollkit/plantilla.html`.
