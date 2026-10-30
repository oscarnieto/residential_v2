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
  }

  /* ---------- Vídeo spot: vuelve al principio al salir de pantalla ----------
     E29 lo pausa al salir y lo reanuda al volver; al rebobinarlo en la pausa,
     cada vez que vuelve a verse empieza desde el inicio. */
  var spot = document.querySelector('.video-sec__video');
  if (spot) {
    spot.addEventListener('pause', function () { spot.currentTime = 0; });
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
