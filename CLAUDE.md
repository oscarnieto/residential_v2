## Publicación (obligatorio)

- La web se publica con GitHub Pages desde la rama `main`: https://oscarnieto.github.io/residential_v2/
- Después de cada cambio, sin esperar a que se pida: `git add -A`, commit con un mensaje breve en español y `git push origin main`. No dejar cambios sin subir al terminar un turno.
- Trabajar siempre directamente sobre `main`, sin ramas ni pull requests.
- Si `git push` o `curl` fallan con «SSL certificate … unable to get local issuer certificate», es la red corporativa (inspección HTTPS de Versa Networks): usar `/usr/bin/git` y `/usr/bin/curl` del sistema, que confían en los certificados del llavero de macOS. No desactivar la verificación SSL.
- **Cada vez que se haga un cambio**, terminar la respuesta con el enlace de GitHub Pages para verlo, con `?v=<hash corto del commit>` al final para evitar la caché (p. ej. `https://oscarnieto.github.io/residential_v2/?v=a1b2c3d`). Si el cambio es en otra página, enlazar esa página.
- Antes de dar el enlace, esperar a que el despliegue termine: consultar `https://api.github.com/repos/oscarnieto/residential_v2/actions/runs?per_page=1` hasta que `head_sha` coincida con el commit subido y `status` sea `completed` (si `conclusion` no es `success`, avisar).

## Maquetación desde Figma

- Programar el diseño de Figma tal cual: medidas, tipografías, colores, espaciados y textos exactos. No inventar ni "mejorar" el diseño.
- Imágenes: usar siempre las de Figma. Exportarlas a 2x del tamaño en que se muestran y optimizarlas en peso con buena resolución: AVIF (calidad ~60) con JPEG de respaldo (calidad ~78), o PNG si necesitan transparencia, con `<picture>`. Convertir con `sips` y **siempre con ancho y alto pares** (con medidas impares `sips` genera AVIF que se ven en blanco); si hace falta, recortar 1 px con `sips -c`. Guardarlas en `img/`, con `width`/`height` y `loading="lazy"` salvo en la primera pantalla.
- Si falta algo (textos, imágenes, iconos, versión móvil, enlaces…), avisar en el momento y dejar un hueco visible marcado como `PENDIENTE`; nunca inventarlo.

## Animaciones y efectos de scroll

- Añadir animaciones solo cuando se pidan, con el efecto de ScrollKit indicado. En `index.html` ya están aplicados: E01 (smooth scroll), E13 con `data-distance` negativo en la cabecera (baja desde arriba al cargar), E09/E12/E13/E14 (textos), E15 (cifras), E19 (vídeo de retos), E20 (imágenes de "Conocemos tu zona") y E24 (el pie se apila sobre la sección anterior).
- En `red-internacional.html`: E16 (parallax) en la imagen de la cabecera, E19 sin fijar + E16 en la imagen de "Expertise 360" (se abre al hacer scroll y se desplaza dentro de su marco), E31 en la línea vertical, E15 en las cifras, E16 (parallax de fondo) en la imagen de "Equipos especializados", E20 en las 4 tarjetas de cifras (la entrada escalonada va en la caja interior `.ri-card__caja` para no chocar con el parallax) y E24 con el pie. Si E19 o E18 llevan `<picture>`, darle `display: block` y tamaño completo: el kit escala el primer `<picture>` que encuentra. Con E16 no fijar la altura del `<picture>`: el kit le da 100 % + el recorrido.
- En `red-internacional.html`, sección de proyectos (`data-proyectos`): efecto tipo Floema pedido expresamente (ScrollKit no lo tiene). Escena con `position: sticky` y GSAP + ScrollTrigger en `js/main.js`: cada imagen se descubre de abajo arriba con `clip-path` y el nombre cambia a mitad de la transición. Usa sticky y no `pin` para poder combinarlo con E24 (el pie se apila encima). Cada `<article class="ri-proyecto">` lleva `data-proyecto` y `data-url`; el botón «Ver propiedad» (`.ri-ver`) sigue al ratón con `gsap.quickTo`, muestra la miniatura `img/ri-mini-*.jpg` del proyecto bajo el ratón y enlaza a su `data-url`. En táctil queda fijo sobre el nombre. Para añadir un proyecto: artículo + miniatura en `.ri-ver` (la altura de la sección se calcula sola). Las tarjetas de la sección de red llevan E14 + E15.
- Cabecera, menú y pie se repiten en cada página HTML: al cambiarlos, actualizar todas las páginas. `<body data-pagina="…">` indica qué imagen muestra el menú al abrirse.
- Vídeo spot (sección de retos): la carga, reproducción, reinicio y sonido según visibilidad van en `js/main.js` con IntersectionObserver, no con E29 (dentro de una sección fijada E19, E29 calcula mal la entrada y salida). El botón de sonido es E30.
- Efectos fuera del kit, pedidos expresamente: foco de luz que sigue al ratón en el lema del pie (`data-foco`, en `js/main.js`), entrada del menú de arriba abajo, desplegables del acordeón y cajas del mapa al pasar el ratón (CSS).

- En `data-expand` (E19) escribir los porcentajes sin ceros finales (`16.9%`, no `16.90%`): GSAP los interpola mal.
- Las máscaras de E09/E10 se amplían por abajo en `estilos.css` (`[data-reveal="lines"] > div`) para no cortar g, p, y. No quitar esa regla.
- Con E16, el marco necesita alto explícito (no `aspect-ratio`): Safari no resuelve la altura en % de la imagen y aparece una franja del fondo.
- Elementos al final de la página (p. ej. la marca del pie) necesitan `data-start="top bottom"`: nunca llegan al 85 % de la pantalla y no se animarían.

- Usar exclusivamente ScrollKit (skill `scrollkit`). Archivos del kit: `scroll-kit/css/scroll-kit.css` y `scroll-kit/js/scroll-kit.js`.
- Catálogo de efectos con códigos E01–E31, snippets y recetas: `.claude/skills/scrollkit/EFECTOS.md`. Leerlo antes de añadir cualquier animación.
- Cuando se pida un efecto por código (p. ej. "E16 en la galería"), aplicar el snippet exacto de su ficha.
- No modificar los archivos del kit salvo petición expresa. El diseño va en el CSS del proyecto.
- Toda página HTML nueva parte de `.claude/skills/scrollkit/plantilla.html`.
