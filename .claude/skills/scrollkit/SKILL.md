---
name: scrollkit
description: Efectos de scroll y animaciones del proyecto con ScrollKit (códigos E01–E31). Úsala siempre que se pida animar, añadir efectos de scroll, parallax, reveals, transiciones, cursor o movimiento en imágenes, o cuando se mencione un código de efecto como E16 o "ScrollKit".
---

# ScrollKit

Kit propio de efectos de scroll para HTML estático. Los efectos se activan con atributos `data-*`. Cada efecto tiene un código (E01–E31) y su ficha está en [EFECTOS.md](EFECTOS.md).

## Reglas

1. **Solo ScrollKit para el movimiento.** No escribas animaciones propias (GSAP, CSS keyframes, IntersectionObserver, otras librerías) si un efecto del kit cubre el caso. Si ninguno lo cubre, dilo y propón la alternativa antes de escribir código.
2. **No modifiques** `scroll-kit/js/scroll-kit.js` ni `scroll-kit/css/scroll-kit.css` salvo que el usuario lo pida expresamente.
3. **El diseño va aparte.** Colores, tipografías y layout van en el CSS del proyecto, nunca en los archivos del kit.
4. **Aplica la ficha exacta.** Cuando el usuario pida un código (p. ej. "E16 en la galería"), abre [EFECTOS.md](EFECTOS.md), busca esa ficha y usa su snippet y sus atributos tal cual. Respeta las notas de la ficha (alturas, `position`, `overflow`).
5. **Sin código, elige tú.** Si el usuario describe un efecto sin dar el código, busca el más adecuado en la tabla "Resumen" o en "Recetas" de EFECTOS.md y di qué código has usado.

## Flujo de trabajo

1. Comprueba que la página tiene el código de instalación: el script y el CSS en el `<head>`, y las 5 librerías al final del `<body>`, en orden. Si falta, añádelo copiándolo de la sección "Instalación en una página" de EFECTOS.md. Ajusta las rutas relativas si la página está en una subcarpeta.
2. Para una página nueva, parte de [plantilla.html](plantilla.html).
3. Añade los atributos `data-*` de cada efecto pedido.
4. Repasa estos puntos antes de terminar:
   - Las imágenes con E16, E17, E18 o E19 tienen un contenedor con alto o `aspect-ratio`.
   - No hay `transform` en el CSS propio sobre elementos que anima el kit. Si hace falta, envuelve el elemento en otro `div`.
   - Los contenedores de secciones fijadas (E19, E23, E25, E26) o con `data-sticky` usan `overflow: clip`, no `hidden`.
   - Ninguna sección combina dos efectos fijados.
   - Las secciones llevan `data-theme="dark|light"` si el header usa E02.
5. Al terminar, resume en una lista corta qué código has aplicado en cada sección.

## Referencia

- Catálogo completo con snippets, opciones y recetas: [EFECTOS.md](EFECTOS.md)
- Plantilla de página: [plantilla.html](plantilla.html)
- Librerías: GSAP 3.15 (ScrollTrigger y SplitText) y Lenis 1.3, por CDN. No hace falta npm.
