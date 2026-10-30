/* Residential V2 · interacción básica: menú desplegado y acordeón */
(function () {
  'use strict';

  /* ---------- Vídeo del hero: quieto si el usuario pide menos movimiento ---------- */
  var video = document.querySelector('.hero__video');
  if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
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
