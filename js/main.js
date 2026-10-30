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
    mostrarFoto('inicio');
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
