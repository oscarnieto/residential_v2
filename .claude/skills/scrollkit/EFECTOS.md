# ScrollKit · Catálogo de efectos

Kit de efectos de scroll para HTML estático. Cada efecto se activa con atributos `data-*` y tiene un código (**E01–E31**) para pedirlo por su número.

> **Para Claude Code:** este archivo es la referencia de animaciones del proyecto. Cuando se pida un efecto por su código (p. ej. "usa E16 en la galería"), aplica exactamente el snippet y los atributos de esa ficha. No escribas animaciones propias con GSAP, CSS o librerías si un efecto del kit cubre el caso, ni cambies `scroll-kit.js` / `scroll-kit.css` salvo petición expresa. El diseño (colores, tipografías, layout) va en el CSS del proyecto, nunca en el kit.

---

## Cómo pedirlo

```
Usa E04 + E17 + E09 en el hero.
La galería de proyectos con E25 y E16 dentro de cada tarjeta.
La sección de servicios con E27, con imagen pegada (E28).
Quita E22 en móvil.
```

## Instalación en una página

El kit vive en `scroll-kit/` (raíz del repo). Cada página HTML que use efectos necesita:

1. En el `<head>`, antes de cualquier otro CSS o script:

```html
<script>document.documentElement.classList.add('sk-js');try{var s=sessionStorage,d=document.documentElement;if(s.getItem('sk-intro'))d.classList.add('sk-intro-seen');if(s.getItem('sk-transition'))d.classList.add('sk-arriving')}catch(e){}</script>
<link rel="stylesheet" href="scroll-kit/css/scroll-kit.css">
```

2. Al final del `<body>`, en este orden:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js"></script>
<script src="scroll-kit/js/scroll-kit.js"></script>
```

Si la página está en una subcarpeta, ajusta las rutas relativas (`../scroll-kit/...`). La plantilla `plantilla.html` de esta skill ya lo trae montado.

---

## Resumen

| Código | Efecto | Cuándo usarlo |
|---|---|---|
| **E01** | Smooth scroll | Siempre. |
| **E02** | Header inteligente | En cualquier web con header fijo: se oculta al bajar, reaparece al subir y cambia de color según la sección que tiene debajo. |
| **E03** | Intro de entrada | Para una primera impresión de marca: pantalla con logo o claim que se levanta como una cortina al cargar. |
| **E04** | Logo que se encoge hasta el header | Hero con el logotipo o nombre a tamaño gigante que, al hacer scroll, viaja y se reduce hasta su sitio en el header. |
| **E05** | Transición entre páginas | En webs de varias páginas: una cortina tapa la pantalla al pulsar un enlace interno y se retira al llegar a la nueva página. |
| **E06** | Cursor propio | Para webs de escritorio con personalidad: un círculo sigue al ratón, crece sobre enlaces y muestra un texto ("Ver", "Play") sobre zonas concretas. |
| **E07** | Barra de progreso | Para indicar cuánto queda de página o de una sección larga (artículos, informes, fichas). |
| **E08** | Anclas con scroll suave | Menús de una sola página e índices. |
| **E09** | Título por líneas | Titulares principales. |
| **E10** | Título por palabras o letras | Palabras: titulares cortos con ritmo. |
| **E11** | Letras que aparecen por opacidad | Párrafos destacados y textos de presentación. |
| **E12** | Párrafo que se ilumina con el scroll | Manifiestos o frases clave que quieres que se lean despacio: cada palabra se enciende al ritmo del scroll. |
| **E13** | Aparición de bloques | Cualquier bloque: textos, botones, tarjetas. |
| **E14** | Entrada escalonada de elementos | Listas, rejillas de tarjetas, logos de clientes o iconos: los hijos entran uno detrás de otro. |
| **E15** | Contadores | Cifras clave: m², rentabilidad, años, número de proyectos. |
| **E16** | Imagen que se desplaza dentro de su marco | El efecto base para casi todas las fotos: el marco avanza con la página y la imagen va más lenta por dentro. |
| **E17** | Zoom con el scroll | Fondos de hero y de cierre, e imágenes a pantalla completa: la imagen se aleja suavemente mientras cruza la pantalla. |
| **E18** | Cortina de aparición | Imágenes que deben aparecer con presencia (proyectos, fichas): la foto se descubre de abajo arriba mientras se asienta el zoom. |
| **E19** | Marco que se abre a pantalla completa | Momento estrella de una sección: una imagen recortada se expande hasta ocupar toda la pantalla mientras la sección queda fijada. |
| **E20** | Parallax | Elementos sueltos (imágenes secundarias, textos grandes, formas) que se mueven a otra velocidad para crear capas. |
| **E21** | Carga con desenfoque | Imágenes pesadas: aparecen desenfocadas y se enfocan cuando terminan de cargar, en lugar de pintarse a trozos. |
| **E22** | Inclinación por velocidad | Galerías y titulares grandes: se inclinan un poco cuando el scroll es rápido y vuelven a su sitio al parar. |
| **E23** | Collage que se abre | Presentación de una colección o proyecto: la imagen principal crece hasta pantalla completa y las secundarias se apartan. |
| **E24** | Capas que se apilan | Transición entre bloques de contenido: cada sección queda fija y la siguiente sube por encima, oscureciéndola. |
| **E25** | Scroll horizontal | Galerías de proyectos, líneas de tiempo, servicios: el scroll vertical desplaza un carril en horizontal. |
| **E26** | Pasos fijados | Explicar algo en 3–5 pasos (proceso, tipologías, ubicaciones, fases): la sección queda fija y el contenido cambia con el scroll. |
| **E27** | Lista que se ilumina | Listados de marcas, servicios, barrios o proyectos en tipografía grande: el elemento que pasa por el centro se enciende y los demás quedan atenuados. |
| **E28** | Elemento pegado | Etiquetas de sección, títulos o imágenes que acompañan mientras se lee el contenido de al lado. |
| **E29** | Vídeo con carga diferida | Siempre que haya vídeo: carga al acercarse, se reproduce en bucle y sin sonido mientras se ve y se pausa al salir. |
| **E30** | Botón de sonido | Vídeo de hero con audio: arranca en silencio, como exigen los navegadores, y un botón lo activa. |
| **E31** | Trazo SVG que se dibuja | Líneas decorativas, separadores, rutas en mapas o iconos de línea. |

## Recetas: qué usar en cada caso

| Caso | Efectos | Resultado |
|---|---|---|
| Hero de portada | E04 + E17 + E09 | Logo gigante que viaja al header, fondo con zoom y titular por líneas. |
| Hero con vídeo | E29 + E30 + E11 | Vídeo diferido con botón de sonido y claim que se enciende letra a letra. |
| Galería de fotos | E16 + E20 + E21 | Imágenes dentro de su marco a distintas velocidades, con carga suave. |
| Presentación de proyecto | E23 o E19 | Collage que se abre o imagen que se expande a pantalla completa. |
| Listado de proyectos | E25 + E16 + E18 | Carril horizontal con fotos que se desplazan y aparecen con cortina. |
| Proceso / tipologías / ubicaciones | E26 | Sección fijada con pasos, contador y barra de progreso. |
| Servicios o marcas | E27 + E28 | Lista grande que se ilumina con imagen pegada al lado. |
| Cifras clave | E15 + E14 | Contadores con entrada escalonada. |
| Manifiesto / frase clave | E12 | Texto que se ilumina con el scroll. |
| Transición entre bloques | E24 | Capas que se apilan. |
| Web de varias páginas | E03 + E05 | Intro la primera vez y cortina entre páginas. |

## Atributos comunes (valen para casi todos)

| Atributo | Para qué |
|---|---|
| `data-mobile="off"` | Desactiva el efecto en móvil (< 768px) |
| `data-desktop="off"` | Desactiva el efecto en escritorio |
| `data-delay` | Retraso en segundos |
| `data-duration` | Duración en segundos |
| `data-start` | Cuándo empieza (formato de ScrollTrigger: "top 70%") |

---

## Página y navegación

### E01 · Smooth scroll

**Cuándo usarlo.** Siempre. Da inercia al scroll y es la base del resto de efectos. Se activa solo al cargar el kit.

```html
<!-- Nada que añadir: se activa al cargar scroll-kit.js -->
<html data-sk-lerp="0.08">   <!-- opcional: más suave -->
```

| Atributo | Para qué |
|---|---|
| `data-sk-lerp` | Inercia (0.05 muy suave · 0.1 por defecto · 0.2 más directo). En <html> |
| `data-sk-no-smooth` | Desactiva el smooth scroll y usa el nativo. En <html> |
| `data-lenis-prevent` | En un bloque con scroll propio (modal, lista) para que no lo capture |

### E02 · Header inteligente

**Cuándo usarlo.** En cualquier web con header fijo: se oculta al bajar, reaparece al subir y cambia de color según la sección que tiene debajo.

```html
<header data-header>…</header>

<section data-theme="dark">…</section>
<section data-theme="light">…</section>

<style>
  [data-header][data-header-theme="dark"]  { color:#fff; }
  [data-header][data-header-theme="light"] { color:#1a1919; }
  [data-header].is-scrolled { /* fondo al bajar, si quieres */ }
</style>
```

| Atributo | Para qué |
|---|---|
| `data-header` | En el header. Con valor "static" no se oculta |
| `data-theme="dark|light"` | En cada sección. El header recibe data-header-theme con ese valor |
| `.is-hidden / .is-scrolled` | Clases que pone el kit para que les des estilo |

> Activo en esta página: baja y sube para verlo.

### E03 · Intro de entrada

**Cuándo usarlo.** Para una primera impresión de marca: pantalla con logo o claim que se levanta como una cortina al cargar.

```html
<div data-intro="once" data-hold="0.8" class="mi-intro">
  <p data-intro-item>Marca</p>
  <h1 data-intro-item>Claim de entrada</h1>
</div>
```

| Atributo | Para qué |
|---|---|
| `data-intro` | Capa de entrada (fija, pantalla completa: dale fondo y layout) |
| `data-intro="once"` | Solo se muestra la primera vez por sesión |
| `data-intro-item` | Elementos que entran escalonados antes de levantar la cortina |
| `data-hold` | Segundos que se queda quieta antes de subir (0.8) |
| `data-duration` | Duración de la subida (1.2) |

> Los efectos de la página arrancan mientras sube la cortina, así el hero ya se está animando. Evento: document → sk:intro-done. Para volver a verla en esta demo, abre la página en una pestaña nueva.

### E04 · Logo que se encoge hasta el header

**Cuándo usarlo.** Hero con el logotipo o nombre a tamaño gigante que, al hacer scroll, viaja y se reduce hasta su sitio en el header.

```html
<header data-header>
  <a href="/" id="logo-slot" style="display:block;width:120px;height:24px"></a>
  …
</header>

<!-- logo grande: fuera del header, con position:fixed -->
<div class="logo-grande" data-shrink-to="#logo-slot" data-end="700"
     style="position:fixed;left:2rem;right:2rem;bottom:2rem;z-index:101">
  <svg>…tu logo…</svg>
</div>

<style>
  html[data-sk-header-theme="dark"]  .logo-grande { color:#fff; }
  html[data-sk-header-theme="light"] .logo-grande { color:#1a1919; }
</style>
```

| Atributo | Para qué |
|---|---|
| `data-shrink-to` | Selector del hueco final en el header (se mide su posición y su ancho) |
| `data-end` | Píxeles de scroll que dura el viaje (por defecto, el 80 % de la pantalla) |
| `data-scrub` | Suavizado (0.6) |

> Va fuera del header, con position:fixed y un z-index por encima de él. El hueco solo marca el tamaño y la posición finales. Al llegar, se oculta y reaparece junto al header (E02). Para su color, usa html[data-sk-header-theme].

### E05 · Transición entre páginas

**Cuándo usarlo.** En webs de varias páginas: una cortina tapa la pantalla al pulsar un enlace interno y se retira al llegar a la nueva página.

```html
<!-- En todas las páginas, una vez -->
<div data-transition class="mi-cortina"></div>

<style>.mi-cortina{ background:#1a1919; }</style>

<a href="otra-pagina.html">Con transición</a>
<a href="otra-pagina.html" data-no-transition>Sin transición</a>
```

| Atributo | Para qué |
|---|---|
| `data-transition` | Capa fija a pantalla completa (dale color o logo) |
| `data-duration` | Duración (0.9) |
| `data-no-transition` | En un enlace concreto para saltarla |

> Solo actúa en enlaces del mismo dominio. Ignora anclas (#), target="_blank" y descargas.

### E06 · Cursor propio

**Cuándo usarlo.** Para webs de escritorio con personalidad: un círculo sigue al ratón, crece sobre enlaces y muestra un texto ("Ver", "Play") sobre zonas concretas.

```html
<div data-cursor="hide-native"><span data-cursor-label></span></div>

<a href="…">Crece al pasar</a>
<figure data-cursor-text="Ver">…</figure>
```

| Atributo | Para qué |
|---|---|
| `data-cursor` | El cursor (el kit trae un estilo base que puedes sobrescribir) |
| `data-cursor="hide-native"` | Oculta el cursor del sistema |
| `data-cursor-label` | Hueco donde se escribe el texto |
| `data-cursor-text` | En cualquier elemento: texto a mostrar al pasar por encima |
| `data-cursor-hover` | Hace crecer el cursor sin mostrar texto |
| `data-speed` | Retardo al seguir al ratón (0.5) |

> Clases para estilizarlo: .is-visible, .is-hover, .has-text, .is-down. En pantallas táctiles se oculta.

### E07 · Barra de progreso

**Cuándo usarlo.** Para indicar cuánto queda de página o de una sección larga (artículos, informes, fichas).

```html
<div data-progress="page" class="barra"></div>   <!-- toda la página -->
<div data-progress class="barra"></div>          <!-- su <section> -->
<div data-progress="#galeria" class="barra"></div>

<style>.barra{ position:fixed; left:0; bottom:0; width:100%; height:3px; background:#c00; }</style>
```

| Atributo | Para qué |
|---|---|
| `data-progress` | Vacío = su sección · "page" = página · "#id" = otro elemento |

> Crece en horizontal desde la izquierda. Activo en esta página (línea inferior).

### E08 · Anclas con scroll suave

**Cuándo usarlo.** Menús de una sola página e índices.

```html
<a href="#contacto" data-offset="-80">Contacto</a>
```

| Atributo | Para qué |
|---|---|
| `data-offset` | Compensa la altura del header (px) |

> También desde JS: ScrollKit.scrollTo('#contacto').


---

## Texto

### E09 · Título por líneas

**Cuándo usarlo.** Titulares principales. Cada línea sube desde detrás de una máscara. Es el reveal más elegante y el más usado.

```html
<h2 data-reveal="lines">Un titular<br>en dos líneas</h2>
```

| Atributo | Para qué |
|---|---|
| `data-delay` | Retraso (s) |
| `data-duration` | Duración (1.2) |
| `data-stagger` | Separación entre líneas (0.1) |
| `data-start` | Cuándo empieza ("top 85%") |

> Las líneas se recalculan si cambia el ancho de pantalla.

### E10 · Título por palabras o letras

**Cuándo usarlo.** Palabras: titulares cortos con ritmo. Letras: una sola palabra o una cifra de gran tamaño.

```html
<h2 data-reveal="words">Por palabras</h2>
<h1 data-reveal="chars">Letras</h1>
```

| Atributo | Para qué |
|---|---|
| `data-stagger` | Separación (palabras 0.05 · letras 0.02) |
| `data-delay` | Retraso (s) |

### E11 · Letras que aparecen por opacidad

**Cuándo usarlo.** Párrafos destacados y textos de presentación. Las letras se encienden en cascada, sin movimiento. Más sobrio que E09.

```html
<p data-reveal="fade-chars">Texto destacado…</p>
<p data-reveal="fade-words">Texto más largo, por palabras…</p>
```

| Atributo | Para qué |
|---|---|
| `data-stagger` | Separación (letras 0.012 · palabras 0.04) |
| `data-duration` | Duración de cada letra (0.6) |

> Con textos largos usa fade-words: es más ligero.

### E12 · Párrafo que se ilumina con el scroll

**Cuándo usarlo.** Manifiestos o frases clave que quieres que se lean despacio: cada palabra se enciende al ritmo del scroll.

```html
<p data-reveal="scrub" data-from="0.15">Frase clave…</p>
```

| Atributo | Para qué |
|---|---|
| `data-from` | Opacidad inicial (0.15) |
| `data-start / data-end` | Tramo de scroll ("top 80%" → "bottom 45%") |

> Va ligado al scroll: si subes, se apaga.

### E13 · Aparición de bloques

**Cuándo usarlo.** Cualquier bloque: textos, botones, tarjetas. up = sube y aparece · fade = solo aparece · scale = se asienta desde algo más grande.

```html
<p data-reveal="up">Sube y aparece</p>
<p data-reveal="fade">Solo aparece</p>
<div data-reveal="scale" data-from="1.15">Se asienta</div>
```

| Atributo | Para qué |
|---|---|
| `data-distance` | Recorrido en px de "up" (40) |
| `data-from` | Escala inicial de "scale" (1.15) |
| `data-delay` | Retraso (s) |

### E14 · Entrada escalonada de elementos

**Cuándo usarlo.** Listas, rejillas de tarjetas, logos de clientes o iconos: los hijos entran uno detrás de otro.

```html
<ul data-reveal="children" data-stagger="0.12">
  <li>…</li><li>…</li><li>…</li>
</ul>
```

| Atributo | Para qué |
|---|---|
| `data-stagger` | Separación (0.12) |
| `data-distance` | Recorrido en px (40) |

### E15 · Contadores

**Cuándo usarlo.** Cifras clave: m², rentabilidad, años, número de proyectos.

```html
<strong data-count="1250">0</strong> m²
<strong data-count="98.5">0</strong> %
```

| Atributo | Para qué |
|---|---|
| `data-count` | Valor final (los decimales salen del número) |
| `data-locale` | Formato (es-ES) |
| `data-duration` | Duración (2) |
| `data-delay` | Retraso (s) |


---

## Imagen

### E16 · Imagen que se desplaza dentro de su marco

**Cuándo usarlo.** El efecto base para casi todas las fotos: el marco avanza con la página y la imagen va más lenta por dentro. Da profundidad sin llamar la atención.

```html
<figure data-image-move="20" style="height:70vh">
  <img src="foto.jpg" alt="">
</figure>
```

| Atributo | Para qué |
|---|---|
| `data-image-move` | % de imagen extra para recorrer (15–30 queda natural) |

> El marco necesita alto o aspect-ratio. Dentro de un scroll horizontal (E25) se mueve en el eje X.

### E17 · Zoom con el scroll

**Cuándo usarlo.** Fondos de hero y de cierre, e imágenes a pantalla completa: la imagen se aleja suavemente mientras cruza la pantalla.

```html
<div data-zoom="1.3" style="position:absolute;inset:0">
  <img src="fondo.jpg" alt="">
</div>
```

| Atributo | Para qué |
|---|---|
| `data-zoom` | Escala inicial (1.25) |
| `data-to` | Escala final (1) |

### E18 · Cortina de aparición

**Cuándo usarlo.** Imágenes que deben aparecer con presencia (proyectos, fichas): la foto se descubre de abajo arriba mientras se asienta el zoom.

```html
<figure data-reveal="clip" style="height:70vh">
  <img src="foto.jpg" alt="">
</figure>
```

| Atributo | Para qué |
|---|---|
| `data-delay` | Retraso (s) |
| `data-duration` | Duración (1.4) |

> Se ejecuta una vez.

### E19 · Marco que se abre a pantalla completa

**Cuándo usarlo.** Momento estrella de una sección: una imagen recortada se expande hasta ocupar toda la pantalla mientras la sección queda fijada.

```html
<section style="height:100vh;position:relative">
  <div data-expand="20% 30%" data-radius="8" data-pin data-length="150%"
       style="position:absolute;inset:0">
    <img src="foto.jpg" alt="">
  </div>
</section>
```

| Atributo | Para qué |
|---|---|
| `data-expand` | Recorte inicial: "arriba/abajo izquierda/derecha" |
| `data-pin` | Fija la sección durante la apertura |
| `data-length` | Scroll que dura (150%) |
| `data-radius` | Esquinas iniciales (px) |
| `data-from` | Zoom inicial de la imagen (1.3) |

### E20 · Parallax

**Cuándo usarlo.** Elementos sueltos (imágenes secundarias, textos grandes, formas) que se mueven a otra velocidad para crear capas.

```html
<img data-parallax="0.2" src="…">     <!-- más lento -->
<img data-parallax="-0.15" src="…">   <!-- más rápido -->
```

| Atributo | Para qué |
|---|---|
| `data-parallax` | Velocidad. Positivo = más lento · negativo = más rápido |

> Combínalo con E16 en la misma imagen para doble capa.

### E21 · Carga con desenfoque

**Cuándo usarlo.** Imágenes pesadas: aparecen desenfocadas y se enfocan cuando terminan de cargar, en lugar de pintarse a trozos.

```html
<img data-blur src="foto.jpg" alt="" loading="lazy">
```

| Atributo | Para qué |
|---|---|
| `data-blur` | En la etiqueta <img> |

> Compatible con E16, E17 y E18 (solo anima el filtro).

### E22 · Inclinación por velocidad

**Cuándo usarlo.** Galerías y titulares grandes: se inclinan un poco cuando el scroll es rápido y vuelven a su sitio al parar. Da sensación de fluidez.

```html
<div data-velocity="5">…</div>
```

| Atributo | Para qué |
|---|---|
| `data-velocity` | Inclinación máxima en grados (5) |

> Úsalo con moderación (2–6 grados). Desactívalo en móvil con data-mobile="off" si molesta.


---

## Secciones

### E23 · Collage que se abre

**Cuándo usarlo.** Presentación de una colección o proyecto: la imagen principal crece hasta pantalla completa y las secundarias se apartan.

```html
<section data-collage data-length="200%" style="height:100vh">
  <div data-collage-item="main" data-from="0.35" style="position:absolute;inset:0">
    <img src="principal.jpg">
  </div>
  <div data-collage-item data-speed="1.2" style="position:absolute;left:6vw;top:12vh;width:18vw">
    <img src="secundaria.jpg">
  </div>
  <!-- más secundarias… -->
</section>
```

| Atributo | Para qué |
|---|---|
| `data-collage` | En la sección (queda fijada) |
| `data-length` | Scroll que dura (200%) |
| `data-collage-item="main"` | Pieza que crece. data-from = escala inicial (0.4) |
| `data-collage-item` | Secundarias: salen hacia su lado. data-speed regula cuánto |
| `data-fade="off"` | La secundaria no desaparece |

### E24 · Capas que se apilan

**Cuándo usarlo.** Transición entre bloques de contenido: cada sección queda fija y la siguiente sube por encima, oscureciéndola.

```html
<div data-stack data-shade="0.5">
  <section>… <h2 data-stack-move>Sube un poco</h2></section>
  <section>…</section>
  <section>…</section>
</div>
```

| Atributo | Para qué |
|---|---|
| `data-stack` | En el contenedor de las secciones |
| `data-shade` | Oscurecimiento de la capa tapada (0–1) |
| `data-stack-move` | Elemento que sube mientras lo tapan (valor = %, por defecto 10) |

> Cada sección necesita fondo opaco.

### E25 · Scroll horizontal

**Cuándo usarlo.** Galerías de proyectos, líneas de tiempo, servicios: el scroll vertical desplaza un carril en horizontal.

```html
<section data-horizontal style="height:100vh">
  <div data-horizontal-track>
    <article style="width:40vw">…</article>
    <article style="width:70vw">…</article>
  </div>
</section>
```

| Atributo | Para qué |
|---|---|
| `data-scrub` | Suavizado (1 · 0 = pegado al scroll) |
| `data-speed` | Más alto = más scroll para el mismo recorrido |
| `data-mobile="on"` | Mantenerlo en horizontal en móvil (por defecto pasa a columna) |

> Dentro del carril funcionan E16, E17, E18, E20 y los reveals.

### E26 · Pasos fijados

**Cuándo usarlo.** Explicar algo en 3–5 pasos (proceso, tipologías, ubicaciones, fases): la sección queda fija y el contenido cambia con el scroll.

```html
<section data-steps data-snap style="height:100vh">
  <img data-step-media src="1.jpg"> <img data-step-media src="2.jpg"> <img data-step-media src="3.jpg">
  <span data-step-counter></span>   <!-- "1 — 3" -->
  <i data-step-progress></i>        <!-- barra -->
  <div>
    <div data-step>Paso 1</div>
    <div data-step>Paso 2</div>
    <div data-step>Paso 3</div>
  </div>
</section>
```

| Atributo | Para qué |
|---|---|
| `data-step` | Cada paso de texto (se superponen solos) |
| `data-step-media` | Imagen de cada paso (opcional) |
| `data-step-counter` | Escribe "1 — N" |
| `data-step-progress` | Barra 0→100 % (dale ancho y alto) |
| `data-step-length` | Pantallas de scroll por paso (1) |
| `data-snap` | El scroll se asienta en cada paso |

> El paso activo lleva .is-active y la sección data-active-step="0|1|2". Útil para encender pins de un mapa por CSS. Evento: sk:step.

### E27 · Lista que se ilumina

**Cuándo usarlo.** Listados de marcas, servicios, barrios o proyectos en tipografía grande: el elemento que pasa por el centro se enciende y los demás quedan atenuados. Puede cambiar una imagen a la vez.

```html
<section>
  <ul data-highlight data-dim="0.15">
    <li>Servicio uno</li>
    <li>Servicio dos</li>
    <li>Servicio tres</li>
  </ul>
  <!-- opcional: una imagen por elemento -->
  <div><img data-highlight-media src="1.jpg"><img data-highlight-media src="2.jpg"><img data-highlight-media src="3.jpg"></div>
</section>
```

| Atributo | Para qué |
|---|---|
| `data-highlight` | En la lista: sus hijos directos son los elementos |
| `data-dim` | Opacidad de los no activos (0.15) |
| `data-highlight-media` | Imágenes que cambian a la vez (misma sección, mismo orden) |

> El activo lleva .is-active. Evento: sk:highlight. Si la imagen va en una columna con data-sticky (E28), se queda fija mientras pasa la lista.

### E28 · Elemento pegado

**Cuándo usarlo.** Etiquetas de sección, títulos o imágenes que acompañan mientras se lee el contenido de al lado.

```html
<section style="display:grid;grid-template-columns:1fr 2fr">
  <p data-sticky="100">Etiqueta</p>
  <div>…contenido largo…</div>
</section>
```

| Atributo | Para qué |
|---|---|
| `data-sticky` | Distancia desde arriba en px (0) |

> Es position: sticky nativo. Ningún contenedor padre puede tener overflow: hidden (usa overflow: clip).


---

## Vídeo y detalles

### E29 · Vídeo con carga diferida

**Cuándo usarlo.** Siempre que haya vídeo: carga al acercarse, se reproduce en bucle y sin sonido mientras se ve y se pausa al salir. Ahorra datos y batería.

```html
<video data-video data-src="video.mp4" data-src-mobile="video-xs.mp4"
       poster="poster.jpg"></video>
```

| Atributo | Para qué |
|---|---|
| `data-src` | Vídeo |
| `data-src-mobile` | Versión ligera para móvil (opcional) |
| `data-video="once"` | Sin bucle |

### E30 · Botón de sonido

**Cuándo usarlo.** Vídeo de hero con audio: arranca en silencio, como exigen los navegadores, y un botón lo activa.

```html
<video id="hero-video" data-video data-src="video.mp4"></video>
<button data-sound-toggle="#hero-video"
        data-label-on="Silenciar" data-label-off="Activar sonido"></button>
```

| Atributo | Para qué |
|---|---|
| `data-sound-toggle` | Selector del vídeo |
| `data-label-on / data-label-off` | Textos del botón |

> El botón lleva aria-pressed.

### E31 · Trazo SVG que se dibuja

**Cuándo usarlo.** Líneas decorativas, separadores, rutas en mapas o iconos de línea.

```html
<svg data-draw>…paths con stroke…</svg>          <!-- ligado al scroll -->
<svg data-draw="once">…</svg>                     <!-- se dibuja una vez -->
```

| Atributo | Para qué |
|---|---|
| `data-draw` | Vacío = ligado al scroll · "once" = una vez |

> Los trazos necesitan stroke y fill="none".

---

## API JavaScript

```js
ScrollKit.scrollTo('#contacto');     // scroll suave
ScrollKit.stop(); ScrollKit.start(); // bloquear y desbloquear el scroll (menú abierto, modal)
ScrollKit.refresh();                 // recalcular tras cambiar contenido por JS
ScrollKit.lenis                      // instancia de Lenis
```

**Eventos:** `sk:intro-done` (document), `sk:step` (sección E26), `sk:highlight` (lista E27).

## Buenas prácticas

- Da `width`/`height` o `aspect-ratio` a las imágenes para que la página no salte al cargar.
- No pongas `transform` en tu CSS sobre elementos que anima el kit. Envuélvelos en otro `div`.
- En contenedores de secciones fijadas o con `data-sticky`, usa `overflow: clip` en vez de `hidden`.
- No combines varios efectos fijados (E19, E23, E25, E26) dentro de la misma sección.
- Si el usuario tiene activado "reducir movimiento", el contenido aparece sin animación.
- Librerías: GSAP 3.15 (ScrollTrigger y SplitText, gratuitos) y Lenis 1.3.
