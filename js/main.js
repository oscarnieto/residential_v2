/* Residential V2 · interacción básica: menú desplegado y acordeón */
(function () {
  'use strict';

  /* ---------- Vídeo del hero: quieto si el usuario pide menos movimiento ---------- */
  var video = document.querySelector('.hero__video');
  if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }

  /* ---------- E19: recorte inicial del vídeo según la pantalla ----------
     Se calcula antes de que arranque ScrollKit para que el marco empiece
     con el tamaño del diseño (ancho de contenido y proporción 1270×715). */
  var marco = document.querySelector('.video-sec__marco');
  if (marco && window.innerWidth >= 768) {
    var ancho = marco.parentNode.clientWidth;
    var alto = window.innerHeight;
    var pad = parseFloat(getComputedStyle(document.querySelector('.intro .contenedor')).paddingLeft) || 0;
    var altoVideo = (ancho - 2 * pad) * 715 / 1270;
    var arriba = Math.max(0, (alto - altoVideo) / 2) / alto * 100;
    var lados = pad / ancho * 100;
    // Sin ceros finales ("16.9%", no "16.90%"): GSAP interpola mal esos valores
    marco.setAttribute('data-expand', parseFloat(arriba.toFixed(2)) + '% ' + parseFloat(lados.toFixed(2)) + '%');
    marco.style.setProperty('--recorte-y', arriba.toFixed(2) + '%');
    marco.style.setProperty('--recorte-x', lados.toFixed(2) + '%');
  }

  /* ---------- Vídeo spot ----------
     - Se descarga al acercarse (versión ligera en móvil).
     - Se reproduce mientras se ve; al salir se pausa y vuelve al principio.
     - El sonido se oye mientras está en pantalla y se silencia al salir.
       Los navegadores solo permiten audio si el visitante ya ha hecho clic,
       tocado o pulsado una tecla en la página; si no, sigue en silencio y el
       botón de sonido (E30) lo activa.
     No usa E29 porque, dentro de una sección fijada (E19), ScrollKit calcula
     mal cuándo entra y sale de pantalla. */
  var spot = document.getElementById('spot');
  if (spot) {
    var boton = document.querySelector('.video-sec__sonido');
    var srcSpot = window.innerWidth < 768 ? spot.getAttribute('data-spot-movil') : spot.getAttribute('data-spot');
    var visible = false;      // alguna parte en pantalla → se reproduce
    var enPantalla = false;   // al menos un 30 % en pantalla → con sonido
    var quiereSonido = true;  // false si el visitante lo silencia con el botón
    spot.muted = true;

    var puedeSonar = function () {
      return !navigator.userActivation || navigator.userActivation.hasBeenActive;
    };
    var reproducir = function () {
      var p = spot.play();
      if (p && p.catch) p.catch(function () {
        // Si el navegador no deja reproducir con sonido, sigue en silencio
        if (!spot.muted) { spot.muted = true; spot.play().catch(function () {}); }
      });
    };
    var aplicarSonido = function () {
      var debeSonar = enPantalla && quiereSonido && puedeSonar();
      if (debeSonar && spot.muted) { spot.muted = false; if (visible) reproducir(); }
      else if (!debeSonar && !spot.muted) spot.muted = true;
    };

    // Precarga al acercarse
    new IntersectionObserver(function (entradas, obs) {
      if (!entradas[0].isIntersecting) return;
      if (!spot.getAttribute('src')) spot.src = srcSpot; // asignarlo dos veces reinicia la carga
      obs.disconnect();
    }, { rootMargin: '300px 0px' }).observe(spot);

    // Reproducción y sonido según lo que se ve
    new IntersectionObserver(function (entradas) {
      var ratio = entradas[0].intersectionRatio;
      visible = entradas[0].isIntersecting;
      enPantalla = ratio >= 0.3;
      if (!spot.getAttribute('src') && visible) spot.src = srcSpot;
      aplicarSonido();
      if (visible && spot.paused) reproducir();
      if (!visible && !spot.paused) { spot.pause(); spot.currentTime = 0; }
    }, { threshold: [0, 0.3, 0.6] }).observe(spot);

    // Primer clic, toque o tecla con el spot en pantalla: el audio se activa ya
    ['pointerdown', 'keydown'].forEach(function (tipo) {
      document.addEventListener(tipo, function (e) {
        if (boton && e.target === boton) return;
        setTimeout(aplicarSonido, 0);
      }, true);
    });

    if (boton) {
      // Se ejecuta antes que el de ScrollKit, que es el que cambia el silencio
      boton.addEventListener('click', function () { quiereSonido = spot.muted; });
      // Mantiene el texto del botón al día cuando el sonido cambia solo
      spot.addEventListener('volumechange', function () {
        boton.textContent = spot.muted ? boton.getAttribute('data-label-off') : boton.getAttribute('data-label-on');
        boton.setAttribute('aria-pressed', String(!spot.muted));
      });
    }
  }

  /* ---------- Mapa en móvil y tablet: la caja de cada pin aparece al tocarlo ----------
     (en escritorio con ratón aparece al pasar por encima, solo con CSS) */
  var cajas = document.querySelectorAll('.oficina');
  var esPantallaGrande = window.matchMedia('(min-width: 1024px)');
  var cerrarCajas = function () {
    cajas.forEach(function (c) { c.classList.remove('is-activa'); });
  };
  document.querySelectorAll('.pin').forEach(function (pin) {
    var region = (pin.className.match(/pin--(\w+)/) || [])[1];
    var caja = document.querySelector('.oficina--' + region);
    if (!caja) return;
    pin.addEventListener('click', function (e) {
      if (esPantallaGrande.matches) return;
      e.stopPropagation();
      var abierta = caja.classList.contains('is-activa');
      cerrarCajas();
      if (!abierta) caja.classList.add('is-activa');
    });
  });
  // Tocar fuera de un pin cierra la caja abierta
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.pin')) cerrarCajas();
  });

  /* ---------- Proyectos (Red internacional): efecto tipo Floema ----------
     La escena queda fija (position: sticky) y, al hacer scroll, cada imagen se
     descubre de abajo arriba (clip-path) mientras la anterior sube un poco y
     se acerca. El nombre de cada proyecto cambia a mitad de la transición.
     ScrollKit no tiene este efecto; se monta con GSAP + ScrollTrigger del kit. */
  var proyectos = document.querySelector('[data-proyectos]');
  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (proyectos && window.gsap && window.ScrollTrigger && !menosMovimiento) {
    var iniciarProyectos = function () {
      var gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      var diapositivas = Array.prototype.slice.call(proyectos.querySelectorAll('.ri-proyecto'));
      var n = diapositivas.length;
      if (n < 2) return;
      proyectos.style.setProperty('--diapositivas', n);
      proyectos.classList.add('is-animado');

      /* Botón «Ver propiedad»: muestra la imagen y el enlace del proyecto que
         hay bajo el ratón (o del proyecto activo si no hay ratón) y lo sigue */
      var ver = proyectos.querySelector('.ri-ver');
      var verFotos = ver ? ver.querySelectorAll('.ri-ver__foto') : [];
      var mostrarProyecto = function (diapositiva) {
        if (!ver || !diapositiva) return;
        var clave = diapositiva.getAttribute('data-proyecto');
        ver.href = diapositiva.getAttribute('data-url');
        verFotos.forEach(function (f) { f.classList.toggle('is-activa', f.getAttribute('data-proyecto') === clave); });
      };

      var activa = -1;
      var conRaton = false;
      var activar = function (i) {
        if (i === activa) return;
        activa = i;
        diapositivas.forEach(function (d, k) { d.classList.toggle('is-activa', k === i); });
        if (!conRaton) mostrarProyecto(diapositivas[i]);
      };
      activar(0);

      if (ver && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var escena = proyectos.querySelector('.ri-proyectos__escena');
        var moverX = gsap.quickTo(ver, 'x', { duration: 0.6, ease: 'power3.out' });
        var moverY = gsap.quickTo(ver, 'y', { duration: 0.6, ease: 'power3.out' });
        var colocado = false;
        escena.addEventListener('mousemove', function (e) {
          var r = escena.getBoundingClientRect();
          var x = e.clientX - r.left - ver.offsetWidth / 2;
          var y = e.clientY - r.top - ver.offsetHeight / 2;
          if (!colocado) { gsap.set(ver, { x: x, y: y }); colocado = true; }
          moverX(x); moverY(y);
          conRaton = true;
          ver.classList.add('is-visible');
          // Proyecto cuya imagen está bajo el ratón (ignorando el propio botón;
          // el clip-path hace que solo cuente la parte visible de cada imagen)
          var bajo = null;
          document.elementsFromPoint(e.clientX, e.clientY).some(function (el) {
            if (ver.contains(el)) return false;
            bajo = el.closest('.ri-proyecto');
            return !!bajo;
          });
          mostrarProyecto(bajo || diapositivas[activa]);
        });
        escena.addEventListener('mouseleave', function () {
          conRaton = false;
          colocado = false;
          ver.classList.remove('is-visible');
        });
      }

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: proyectos,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: function (self) { activar(Math.round(self.progress * (n - 1))); }
        }
      });
      diapositivas.forEach(function (d, i) {
        if (i === 0) return;
        var media = d.querySelector('.ri-proyecto__media');
        var img = media.querySelector('img');
        var anterior = diapositivas[i - 1].querySelector('.ri-proyecto__media img');
        tl.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, i - 1)
          .fromTo(img, { yPercent: 12, scale: 1.08 }, { yPercent: 0, scale: 1, duration: 1 }, i - 1)
          .to(anterior, { yPercent: -8, scale: 1.04, duration: 1 }, i - 1);
      });
      window.ScrollTrigger.refresh();
    };
    // Después de que arranque ScrollKit (espera a las fuentes, igual que el kit)
    document.addEventListener('DOMContentLoaded', function () {
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(iniciarProyectos);
    });
  }

  /* ---------- Titular línea a línea de izquierda a derecha ----------
     [data-lineas-izq]: cada línea, dentro de su máscara, entra deslizándose
     desde la izquierda, una detrás de otra, al llegar al titular. ScrollKit
     solo tiene la entrada de abajo arriba (E09); esto usa SplitText del kit. */
  var titularesIzq = document.querySelectorAll('[data-lineas-izq]');
  if (titularesIzq.length) {
    document.addEventListener('DOMContentLoaded', function () {
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
        var gsap = window.gsap;
        titularesIzq.forEach(function (el) {
          if (!gsap || !window.SplitText || !window.ScrollTrigger || menosMovimiento) {
            el.style.visibility = 'visible';
            return;
          }
          gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
          gsap.set(el, { autoAlpha: 1 });
          window.SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: function (self) {
              return gsap.from(self.lines, {
                xPercent: -105, duration: 1.3, ease: 'expo.out', stagger: 0.14,
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
              });
            }
          });
        });
      });
    });
  }

  /* ---------- Servicios: círculo ----------
     - Al pulsar un punto se muestra su servicio (pestañas accesibles: flechas,
       Inicio y Fin también funcionan).
     - Al aparecer en pantalla, la línea se dibuja entera siguiendo el círculo y
       cada punto crece (de pequeño a su tamaño) cuando la línea llega a él;
       al final, la flecha.
     ScrollKit no tiene este efecto combinado; se monta con GSAP + ScrollTrigger. */
  var circulo = document.querySelector('[data-circulo]');
  if (circulo) {
    var puntos = Array.prototype.slice.call(circulo.querySelectorAll('.sv-punto'));
    var paneles = puntos.map(function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
    var mostrarServicio = function (i, foco) {
      puntos.forEach(function (b, k) {
        var activo = k === i;
        b.classList.toggle('is-activo', activo);
        b.setAttribute('aria-selected', String(activo));
        b.tabIndex = activo ? 0 : -1;
        paneles[k].hidden = !activo;
        paneles[k].classList.toggle('is-activo', activo);
      });
      if (foco) puntos[i].focus();
    };
    puntos.forEach(function (b, i) {
      b.addEventListener('click', function () { mostrarServicio(i); });
      b.addEventListener('keydown', function (e) {
        var n = puntos.length, j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); mostrarServicio(j, true); }
      });
    });

    if (window.gsap && window.ScrollTrigger && !menosMovimiento) {
      document.addEventListener('DOMContentLoaded', function () {
        var gsap = window.gsap;
        gsap.registerPlugin(window.ScrollTrigger);
        var arco = circulo.querySelector('.sv-circulo__arco');
        var flecha = circulo.querySelector('.sv-circulo__flecha');
        var largo = arco.getTotalLength();
        // Ángulo de cada punto desde arriba, en sentido horario; el arco mide 345°
        var angulos = [13.5, 60.4, 111.9, 155.2, 205, 248.5, 293.4, 328.3];
        gsap.set(arco, { strokeDasharray: largo, strokeDashoffset: largo });
        gsap.set(flecha, { autoAlpha: 0 });
        gsap.set(puntos, { scale: 0 });
        // Se dibuja entero en cuanto aparece en pantalla (una sola vez)
        var duracion = 2.2;
        var tl = gsap.timeline({
          scrollTrigger: { trigger: circulo, start: 'top 75%', once: true }
        });
        tl.to(arco, { strokeDashoffset: 0, ease: 'none', duration: duracion }, 0); // lineal: así cada punto crece justo al llegar la línea
        puntos.forEach(function (b, i) {
          tl.to(b, { scale: 1, ease: 'back.out(2.5)', duration: 0.45 }, duracion * angulos[i] / 345 - 0.1);
        });
        tl.to(flecha, { autoAlpha: 1, duration: 0.3 }, duracion - 0.1);
      });
    }
  }

  /* ---------- Servicios: tarjetas que se apilan ----------
     La escena (titular + tarjetas) es sticky; con el scroll, cada tarjeta sube
     desde abajo y se apila sobre la anterior, dejando ver una franja de ella. */
  var apilar = document.querySelector('[data-apilar]');
  if (apilar && window.gsap && window.ScrollTrigger && !menosMovimiento) {
    document.addEventListener('DOMContentLoaded', function () {
      var gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      var tarjetas = Array.prototype.slice.call(apilar.querySelectorAll('.sv-card'));
      if (tarjetas.length < 2) return;
      apilar.style.setProperty('--tarjetas', tarjetas.length);
      apilar.classList.add('is-animado');
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: apilar, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
      });
      // Cada tarjeta queda un poco más abajo que la anterior y las de debajo se
      // reducen un poco: así asoma una franja de cada una por arriba (como Orchid)
      var paso = function () { return Math.max(10, Math.round(window.innerWidth / 1440 * 18)); };
      tarjetas.forEach(function (t, i) {
        if (i === 0) return;
        tl.fromTo(t, { y: function () { return window.innerHeight; } }, { y: function () { return i * paso(); }, duration: 1 }, i - 1);
        for (var j = 0; j < i; j++) {
          tl.to(tarjetas[j].querySelector('.sv-card__caja'), { scale: 1 - (i - j) * 0.03, duration: 1 }, i - 1);
        }
      });
      window.ScrollTrigger.refresh();
    });
  }

  /* ---------- Vídeo de fondo (Track Record, ciudades) ----------
     video[data-fondo]: en bucle y sin sonido. Sus fuentes (data-src) se cargan
     al acercarse la sección y solo se reproduce mientras se ve. Se observa la
     sección y no el vídeo porque este va dentro de una escena sticky. Con
     movimiento reducido se queda el póster. */
  if ('IntersectionObserver' in window && !menosMovimiento) {
    document.querySelectorAll('video[data-fondo]').forEach(function (video) {
      var seccion = video.closest('section') || video;
      var visible = false;
      var reproducir = function () {
        var p = video.play();
        if (p) p.catch(function () {});
      };
      video.muted = true;
      // Si aún estaba cargando al llegar a la sección, arranca en cuanto pueda
      video.addEventListener('canplay', function () { if (visible && video.paused) reproducir(); });
      new IntersectionObserver(function (entradas) {
        visible = entradas[0].isIntersecting;
        if (visible) {
          var fuentes = video.querySelectorAll('source[data-src]');
          if (fuentes.length) {
            fuentes.forEach(function (s) { s.src = s.getAttribute('data-src'); s.removeAttribute('data-src'); });
            video.load();
          }
          reproducir();
        } else if (!video.paused) {
          video.pause();
        }
      }, { rootMargin: '25% 0px' }).observe(seccion);
    });
  }

  /* ---------- Track Record: ciudades sobre un cilindro ----------
     [data-ciudades]: efecto de «The three worlds» de sobha-privy-collection.com,
     pedido expresamente (ScrollKit no lo tiene). Las imágenes se dibujan con
     WebGL curvadas sobre un cilindro y, con el scroll, giran de derecha a
     izquierda mientras la escena queda fija (sticky). Misma geometría que la
     original: cilindro de radio 15, cámara a 22 del centro (focal de 22,56 mm),
     tarjetas de 5 × 2,83 separadas 0,065 vueltas (0,056 en móvil). El conjunto
     (nombre, imagen central y cifra) queda centrado en la pantalla en ambos ejes.
     Gira mientras la sección entra, hasta centrar la primera ciudad; durante los
     200vh que queda fija, cada ciudad se detiene centrada un tramo y gira hasta
     la siguiente, y al soltar el scroll entre dos se ajusta a la más cercana.
     El nombre y la cifra de la ciudad centrada son HTML colocado sobre y bajo la
     imagen central. */
  var ciudades = document.querySelector('[data-ciudades]');
  if (ciudades && window.gsap && window.ScrollTrigger && !menosMovimiento) {
    document.addEventListener('DOMContentLoaded', function () {
      var gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      var escena = ciudades.querySelector('.tr-ciudades__escena');
      var items = Array.prototype.slice.call(ciudades.querySelectorAll('.tr-ciudad'));
      var n = items.length;
      var lienzo = document.createElement('canvas');
      var gl = n > 1 && lienzo.getContext('webgl', { antialias: true, alpha: true });
      if (!gl) return; // sin WebGL se quedan apiladas, como en Figma

      var RADIO = 15, CAMARA = 22, FOCAL = 22.5628, ANCHO = 5, ALTO = 480 / 720 * 0.85 * 5;
      var ARCO = ANCHO / (2 * Math.PI * RADIO);          // ancho de cada tarjeta, en vueltas
      var BASE = (161 / (2 * Math.PI * RADIO)) % 1;     // desfase de las tarjetas en la original
      var FRENTE = 0.75;                                // punto del cilindro delante de la cámara
      var config = function () {
        return window.innerWidth < 768
          ? { inicio: 0.18025, paso: 0.056 }
          : { inicio: 0.16225, paso: 0.065 };
      };
      var cfg = config();

      lienzo.className = 'tr-ciudades__lienzo';
      lienzo.setAttribute('aria-hidden', 'true');
      escena.insertBefore(lienzo, escena.firstChild);
      ciudades.classList.add('is-animado');

      var compilar = function (tipo, codigo) {
        var s = gl.createShader(tipo);
        gl.shaderSource(s, codigo);
        gl.compileShader(s);
        return s;
      };
      var prog = gl.createProgram();
      gl.attachShader(prog, compilar(gl.VERTEX_SHADER, [
        'attribute vec2 aUv;',
        'uniform float uPos;',     // centro de la tarjeta en el cilindro (vueltas)
        'uniform vec2 uPend;',     // campo de visión (pendiente horizontal y vertical)
        'uniform float uDesvio;',  // desplazamiento vertical de la escena
        'uniform vec4 uRecorte;',  // recorte de la imagen (tipo cover)
        'varying vec2 vUv;',
        'void main() {',
        '  float a = 6.2831853 * (uPos + (aUv.x - 0.5) * ' + ARCO.toFixed(6) + ');',
        '  float d = ' + RADIO.toFixed(1) + ' * sin(a) + ' + CAMARA.toFixed(1) + ';',
        '  float x = ' + RADIO.toFixed(1) + ' * cos(a);',
        '  float y = (aUv.y - 0.5) * ' + ALTO.toFixed(6) + ';',
        '  gl_Position = vec4(x / uPend.x, y / uPend.y + uDesvio * d, 0.0, d);',
        '  vUv = uRecorte.xy + aUv * uRecorte.zw;',
        '}'
      ].join('\n')));
      gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, [
        'precision mediump float;',
        'uniform sampler2D uTex;',
        'varying vec2 vUv;',
        'void main() { gl_FragColor = texture2D(uTex, vUv); }'
      ].join('\n')));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        ciudades.classList.remove('is-animado');
        lienzo.remove();
        return;
      }
      gl.useProgram(prog);

      // Malla de cada tarjeta: 64 tramos a lo ancho (la curva) y 1 a lo alto
      var TRAMOS = 64, malla = [];
      for (var k = 0; k <= TRAMOS; k++) malla.push(k / TRAMOS, 0, k / TRAMOS, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(malla), gl.STATIC_DRAW);
      var aUv = gl.getAttribLocation(prog, 'aUv');
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      var uPos = gl.getUniformLocation(prog, 'uPos');
      var uPend = gl.getUniformLocation(prog, 'uPend');
      var uDesvio = gl.getUniformLocation(prog, 'uDesvio');
      var uRecorte = gl.getUniformLocation(prog, 'uRecorte');
      gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);
      gl.clearColor(0, 0, 0, 0);

      var giro = 0;        // vueltas que han girado las tarjetas
      var pend = [1, 1];
      var desvio = 0;      // desplazamiento vertical de la escena (coordenadas de -1 a 1)
      var activa = -1;
      var tarjetas = [];
      // Se pinta en el momento: las actualizaciones del scroll ya llegan dentro
      // del ciclo de GSAP, y así no depende de un requestAnimationFrame aparte
      // (que el navegador puede retrasar con la pestaña en segundo plano)
      var pintar = function () {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uPend, pend[0], pend[1]);
        gl.uniform1f(uDesvio, desvio);
        var centrada = 0, menor = Infinity;
        tarjetas.forEach(function (t, i) {
          var pos = BASE + cfg.inicio + i * cfg.paso - giro;
          if (Math.abs(pos - FRENTE) < menor) { menor = Math.abs(pos - FRENTE); centrada = i; }
          if (!t.tex) return;
          gl.bindTexture(gl.TEXTURE_2D, t.tex);
          gl.uniform1f(uPos, pos);
          gl.uniform4f(uRecorte, t.recorte[0], t.recorte[1], t.recorte[2], t.recorte[3]);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, (TRAMOS + 1) * 2);
        });
        // Nombre y cifra de la ciudad que está delante
        if (centrada !== activa) {
          activa = centrada;
          items.forEach(function (item, i) {
            item.classList.toggle('is-activa', i === centrada);
            item.classList.toggle('is-pasada', i < centrada);
          });
        }
      };

      // Texturas: cada foto se copia a un lienzo de potencia de 2 (mipmaps: la
      // imagen se ve nítida aunque se reduzca) y se recorta al formato de la tarjeta.
      // Se usa una copia descodificada (decode) de la imagen ya elegida por el
      // <picture>: la <img> diferida puede darse por cargada desde la caché sin
      // tener aún los píxeles, y la textura saldría vacía
      var FORMATO = ANCHO / ALTO;
      tarjetas = items.map(function (item) {
        var t = { tex: null, cargando: false, recorte: [0, 0, 1, 1], img: item.querySelector('img') };
        var subir = function (img) {
          var c = document.createElement('canvas');
          c.width = Math.min(2048, Math.pow(2, Math.ceil(Math.log2(img.naturalWidth))));
          c.height = Math.min(2048, Math.pow(2, Math.ceil(Math.log2(img.naturalHeight))));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          t.tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t.tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          var a = img.naturalWidth / img.naturalHeight;
          t.recorte = a > FORMATO
            ? [(1 - FORMATO / a) / 2, 0, FORMATO / a, 1]
            : [0, (1 - a / FORMATO) / 2, 1, a / FORMATO];
          pintar();
        };
        t.cargar = function () {
          if (t.tex || t.cargando || !t.img.complete || !t.img.currentSrc) return;
          t.cargando = true;
          var copia = new Image();
          copia.src = t.img.currentSrc;
          copia.decode().then(function () { subir(copia); }, function () {
            if (copia.naturalWidth) subir(copia); else t.cargando = false;
          });
        };
        t.img.addEventListener('load', t.cargar);
        t.cargar();
        return t;
      });
      // Las fotos se cargan al acercarse la sección
      var cargarTodas = function () {
        tarjetas.forEach(function (t) { t.img.loading = 'eager'; t.cargar(); });
      };
      if ('IntersectionObserver' in window) {
        var cerca = new IntersectionObserver(function (entradas) {
          if (!entradas[0].isIntersecting) return;
          cargarTodas();
          cerca.disconnect();
        }, { rootMargin: '100% 0px' });
        cerca.observe(ciudades);
      } else {
        cargarTodas();
      }

      // Campo de visión como PerspectiveCamera.setFocalLength de three.js. La
      // tarjeta centrada (a 7 de la cámara) se coloca para que el conjunto nombre
      // (sobresale 0,735em por arriba) + imagen + cifra (0,39em + 1,06em por
      // abajo) quede centrado en vertical
      var medir = function () {
        cfg = config();
        var w = escena.clientWidth, h = escena.clientHeight;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        lienzo.width = Math.round(w * dpr);
        lienzo.height = Math.round(h * dpr);
        gl.viewport(0, 0, lienzo.width, lienzo.height);
        var pv = 0.5 * (35 / Math.max(w / h, 1)) / FOCAL;
        pend = [pv * w / h, pv];
        var alto = ALTO / ((CAMARA - RADIO) * pv) / 2 * h;
        var sobre = 0.735 * parseFloat(getComputedStyle(items[0].querySelector('.tr-ciudad__nombre')).fontSize);
        var bajo = 1.45 * parseFloat(getComputedStyle(items[0].querySelector('.tr-ciudad__dato')).fontSize);
        var arriba = (h - alto - sobre - bajo) / 2 + sobre;
        desvio = 1 - 2 * (arriba + alto / 2) / h;
        ciudades.style.setProperty('--tr-arriba', arriba.toFixed(1) + 'px');
        ciudades.style.setProperty('--tr-abajo', (arriba + alto).toFixed(1) + 'px');
        pintar();
      };
      medir();
      window.ScrollTrigger.addEventListener('refresh', medir);

      // Giro con el scroll (en tramos de 100vh): entrando la sección llega la
      // primera ciudad (frenando); con la escena fija, cada ciudad se queda
      // centrada un tramo (PAUSA) y gira hasta la siguiente (GIRO)
      var FIJA = 2;                                    // 200vh fija (la sección mide 300vh)
      var TOTAL = 1 + FIJA;
      var PAUSA = 0.3;
      var GIRO = (FIJA - n * PAUSA) / (n - 1);
      var centrar = function (i) {
        return function () { return BASE + cfg.inicio + i * cfg.paso - FRENTE; };
      };
      // Al soltar el scroll entre dos ciudades, se ajusta a la más cercana
      // (snap de ScrollTrigger, como E26 del kit); entrando la sección, no
      var ajustar = function (v) {
        var u = v * TOTAL, mejor = v, menor = Infinity;
        if (u < 1) return v;
        for (var i = 0; i < n; i++) {
          var a = 1 + i * (PAUSA + GIRO), b = a + PAUSA;
          if (u >= a && u <= b) return v;
          if (Math.abs(u - a) < menor) { menor = Math.abs(u - a); mejor = a / TOTAL; }
          if (Math.abs(u - b) < menor) { menor = Math.abs(u - b); mejor = b / TOTAL; }
        }
        return mejor;
      };
      var estado = { giro: 0 };
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () { giro = estado.giro; pintar(); },
        scrollTrigger: {
          trigger: ciudades,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          snap: { snapTo: ajustar, duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' }
        }
      });
      tl.to(estado, { giro: centrar(0), ease: 'power1.out', duration: 1 });
      for (var i = 1; i < n; i++) {
        tl.to(estado, { giro: centrar(i), ease: 'power2.inOut', duration: GIRO }, 1 + i * PAUSA + (i - 1) * GIRO);
      }
      tl.to({}, { duration: PAUSA }, TOTAL - PAUSA);
      window.ScrollTrigger.refresh();
    });
  }

  /* ---------- Carrusel con arrastre (Track Record, producto nacional) ----------
     [data-carrusel]: lista con scroll horizontal (dedo, trackpad o rueda con
     mayúsculas). Con ratón también se arrastra; tras arrastrar no se abre el enlace. */
  document.querySelectorAll('[data-carrusel]').forEach(function (pista) {
    var arrastrando = false, movido = false, inicioX = 0, inicioScroll = 0;
    pista.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrastrando = true;
      movido = false;
      inicioX = e.clientX;
      inicioScroll = pista.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!arrastrando) return;
      var dx = e.clientX - inicioX;
      if (!movido && Math.abs(dx) > 5) { movido = true; pista.classList.add('is-arrastrando'); }
      if (movido) pista.scrollLeft = inicioScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!arrastrando) return;
      arrastrando = false;
      pista.classList.remove('is-arrastrando');
    });
    pista.addEventListener('click', function (e) {
      if (movido) { e.preventDefault(); movido = false; }
    }, true);
    pista.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* ---------- Pie: foco de luz que sigue al ratón sobre el lema ---------- */
  var lema = document.querySelector('[data-foco]');
  if (lema && window.matchMedia('(hover: hover)').matches) {
    var pie = lema.closest('footer');
    var x = null, y = null, destinoX, destinoY, animando = false;

    var mover = function () {
      x += (destinoX - x) * 0.1;
      y += (destinoY - y) * 0.1;
      lema.style.setProperty('--x', x.toFixed(1) + 'px');
      lema.style.setProperty('--y', y.toFixed(1) + 'px');
      if (Math.abs(destinoX - x) > 0.5 || Math.abs(destinoY - y) > 0.5) requestAnimationFrame(mover);
      else animando = false;
    };
    var apuntar = function (px, py) {
      var r = lema.getBoundingClientRect();
      if (x === null) { x = r.width / 2; y = r.height / 2; }
      destinoX = px === null ? r.width / 2 : px - r.left;
      destinoY = py === null ? r.height / 2 : py - r.top;
      if (!animando) { animando = true; requestAnimationFrame(mover); }
    };
    pie.addEventListener('mousemove', function (e) { apuntar(e.clientX, e.clientY); });
    pie.addEventListener('mouseleave', function () { apuntar(null, null); });
  }

  /* ---------- Menú ---------- */
  var menu = document.getElementById('menu');
  var abrir = document.querySelector('.cabecera__menu');
  var cerrar = menu.querySelector('.menu__cerrar');

  var menuAbierto = false;

  function abrirMenu() {
    menuAbierto = true;
    mostrarFoto(document.body.getAttribute('data-pagina') || 'inicio'); // imagen de la página actual
    menu.inert = false;
    menu.classList.add('is-abierto');
    abrir.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    if (window.ScrollKit) window.ScrollKit.stop();
    cerrar.focus();
  }

  function cerrarMenu(devolverFoco) {
    menuAbierto = false;
    menu.inert = true;
    menu.classList.remove('is-abierto');
    abrir.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (window.ScrollKit) window.ScrollKit.start();
    if (devolverFoco) abrir.focus();
  }

  abrir.addEventListener('click', abrirMenu);
  cerrar.addEventListener('click', function () { cerrarMenu(true); });

  // Al pulsar un enlace del menú, se cierra antes de navegar
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) cerrarMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (!menuAbierto) return;
    if (e.key === 'Escape') { cerrarMenu(true); return; }
    if (e.key !== 'Tab') return;
    // Mantiene el foco dentro del menú
    var focusables = menu.querySelectorAll('a[href], button');
    var primero = focusables[0];
    var ultimo = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  // Imagen del menú: muestra la de la sección del enlace señalado
  var fotos = menu.querySelectorAll('.menu__foto');
  function mostrarFoto(nombre) {
    fotos.forEach(function (f) {
      f.classList.toggle('is-activa', f.getAttribute('data-foto') === nombre);
    });
  }
  menu.querySelectorAll('.menu__nav a').forEach(function (enlace) {
    var nombre = enlace.getAttribute('data-foto');
    enlace.addEventListener('mouseenter', function () { mostrarFoto(nombre); });
    enlace.addEventListener('focus', function () { mostrarFoto(nombre); });
  });

  /* ---------- Acordeón (uno abierto a la vez; la animación va en CSS) ---------- */
  var botones = document.querySelectorAll('.acordeon__boton');
  var refrescar;

  botones.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      botones.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.acordeon__item').classList.remove('is-open');
      });
      if (!abierto) {
        boton.setAttribute('aria-expanded', 'true');
        boton.closest('.acordeon__item').classList.add('is-open');
      }
      // Recalcula posiciones de scroll cuando termina la animación
      clearTimeout(refrescar);
      refrescar = setTimeout(function () {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }, 500);
    });
  });
})();
