/*!
 * ScrollKit v1.0
 * Efectos de scroll declarativos con atributos data-*.
 * Requiere (en este orden, antes de este archivo):
 *   gsap.min.js · ScrollTrigger.min.js · SplitText.min.js · lenis.min.js
 * Documentación: README.md
 */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[ScrollKit] Falta GSAP o ScrollTrigger. Revisa el orden de los <script>.');
    document.documentElement.classList.remove('sk-js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- utilidades ---------- */
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const EASE = 'expo.out';
  const MEDIA = ':scope > img, :scope > video, :scope > picture, :scope > canvas, :scope > [data-media]';
  const BP = 768; // breakpoint móvil/escritorio

  // Lee data-* como número si se puede, si no como texto
  const opt = (el, key, def) => {
    const v = el.dataset[key];
    if (v === undefined || v === '') return def;
    const n = Number(v);
    return isNaN(n) ? v : n;
  };

  // data-mobile="off" / data-desktop="off" desactivan el efecto en ese tamaño
  const enabled = (el, c) =>
    !((c.isMobile && el.dataset.mobile === 'off') || (c.isDesktop && el.dataset.desktop === 'off'));

  // Si el elemento está dentro de un scroll horizontal, devuelve su tween
  const hTween = (el) => {
    const h = el.closest('[data-horizontal]');
    return h && h._skTween ? h._skTween : null;
  };

  // ScrollTrigger base: recorre el elemento de entrada a salida del viewport
  const track = (el, extra) => {
    const ca = hTween(el);
    const base = ca
      ? { trigger: el, containerAnimation: ca, start: 'left right', end: 'right left' }
      : { trigger: el, start: 'top bottom', end: 'bottom top' };
    return Object.assign(base, extra || {});
  };

  // ScrollTrigger de una sola vez (reveals)
  const once = (el, start) => {
    const ca = hTween(el);
    if (ca) {
      // Si ya está a la vista al empezar el carril, se dispara al llegar a la sección
      const wrap = el.closest('[data-horizontal]');
      const left = el.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
      if (left < wrap.clientWidth * 0.85) return { trigger: wrap, once: true, start: 'top 60%' };
      return { trigger: el, once: true, containerAnimation: ca, start: start || 'left 85%' };
    }
    return { trigger: el, once: true, start: start || 'top 85%' };
  };

  let lenis = null;
  let refreshTimer = null;
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  };

  /* =========================================================
     1. SMOOTH SCROLL (Lenis)
     ========================================================= */
  function initLenis(reduce) {
    const html = document.documentElement;
    if (reduce || !window.Lenis || html.hasAttribute('data-sk-no-smooth')) return;
    lenis = new Lenis({
      lerp: Number(html.dataset.skLerp) || 0.1,
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollTo(target, o) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el == null) return;
    if (lenis) lenis.scrollTo(el, Object.assign({ duration: 1.4 }, o || {}));
    else if (typeof el === 'number') window.scrollTo({ top: el, behavior: 'smooth' });
    else el.scrollIntoView({ behavior: 'smooth' });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      scrollTo(t, { offset: Number(a.dataset.offset) || 0 });
    });
  }

  /* =========================================================
     2. HEADER: tema según sección + ocultar al bajar
     <header data-header>  ·  <section data-theme="dark|light">
     ========================================================= */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const mid = () => header.offsetHeight / 2;

    $$('[data-theme]').forEach((sec) => {
      if (sec === header) return;
      ScrollTrigger.create({
        trigger: sec,
        start: () => 'top ' + mid(),
        end: () => 'bottom ' + mid(),
        onToggle: (self) => {
          if (!self.isActive) return;
          header.dataset.headerTheme = sec.dataset.theme;
          document.documentElement.dataset.skHeaderTheme = sec.dataset.theme; // para elementos fuera del header (E04)
        }
      });
    });

    if (header.dataset.header === 'static') return;
    const html = document.documentElement;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('is-scrolled', y > 10);
        if (y > 150 && self.direction === 1) header.classList.add('is-hidden');
        else if (self.direction === -1) header.classList.remove('is-hidden');
        html.classList.toggle('sk-header-hidden', header.classList.contains('is-hidden'));
      }
    });
  }

  /* =========================================================
     3. VÍDEO: carga diferida + play/pausa según visibilidad
     <video data-video data-src="a.mp4" data-src-mobile="a-xs.mp4">
     ========================================================= */
  function initVideo() {
    $$('video[data-video]').forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = v.dataset.video !== 'once';
      const src = window.innerWidth < BP && v.dataset.srcMobile ? v.dataset.srcMobile : v.dataset.src;
      let loaded = !src;
      ScrollTrigger.create({
        trigger: v,
        start: 'top bottom+=300',
        end: 'bottom top-=300',
        onToggle: (self) => {
          if (self.isActive) {
            if (!loaded) { v.src = src; loaded = true; }
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            v.pause();
          }
        }
      });
    });
  }

  /* =========================================================
     4. SCROLL HORIZONTAL (va primero: otros efectos lo usan)
     <section data-horizontal>
       <div data-horizontal-track> ...tarjetas... </div>
     </section>
     ========================================================= */
  function initHorizontal(c) {
    $$('[data-horizontal]').forEach((wrap) => {
      if (c.isMobile && wrap.dataset.mobile !== 'on') return;
      const trackEl = wrap.querySelector('[data-horizontal-track]');
      if (!trackEl) return;
      wrap.classList.add('sk-h-active');
      const dist = () => Math.max(0, trackEl.scrollWidth - wrap.clientWidth);
      wrap._skTween = gsap.to(trackEl, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => '+=' + dist() * opt(wrap, 'speed', 1),
          pin: true,
          scrub: opt(wrap, 'scrub', 1),
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    });
  }

  /* =========================================================
     5. REVEALS (una vez, al entrar en pantalla)
     data-reveal="lines|words|chars|up|fade|scale|clip|children|scrub"
     ========================================================= */
  function initReveal(c) {
    $$('[data-reveal]').forEach((el) => {
      if (!enabled(el, c)) { gsap.set(el, { autoAlpha: 1 }); return; }
      const type = el.dataset.reveal || 'up';
      const delay = opt(el, 'delay', 0);
      const dur = opt(el, 'duration', type === 'clip' ? 1.4 : 1.2);
      const start = el.dataset.start;
      const split = ['lines', 'words', 'chars'].includes(type);

      if (split && window.SplitText) {
        const stagger = opt(el, 'stagger', type === 'chars' ? 0.02 : type === 'words' ? 0.05 : 0.1);
        gsap.set(el, { autoAlpha: 1 });
        SplitText.create(el, {
          type: type === 'chars' ? 'words,chars' : type,
          mask: type === 'chars' ? 'words' : type,
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self[type], {
              yPercent: 110, duration: dur, ease: EASE, stagger, delay,
              scrollTrigger: once(el, start)
            });
          }
        });
        return;
      }

      if ((type === 'fade-chars' || type === 'fade-words') && window.SplitText) {
        const unit = type === 'fade-chars' ? 'chars' : 'words';
        gsap.set(el, { autoAlpha: 1 });
        SplitText.create(el, {
          type: unit === 'chars' ? 'words,chars' : 'words',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self[unit], {
              opacity: 0, duration: opt(el, 'duration', 0.6), ease: 'power1.out',
              stagger: opt(el, 'stagger', unit === 'chars' ? 0.012 : 0.04), delay,
              scrollTrigger: once(el, start)
            });
          }
        });
        return;
      }

      if (type === 'scrub' && window.SplitText) {
        gsap.set(el, { autoAlpha: 1 });
        SplitText.create(el, {
          type: 'words',
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(self.words, { opacity: opt(el, 'from', 0.15) }, {
              opacity: 1, ease: 'none', stagger: 0.1,
              scrollTrigger: { trigger: el, start: start || 'top 80%', end: el.dataset.end || 'bottom 45%', scrub: true }
            });
          }
        });
        return;
      }

      if (type === 'clip') {
        gsap.fromTo(el,
          { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'expo.inOut', delay, scrollTrigger: once(el, start) });
        const media = el.querySelector('img, video, picture, [data-media]');
        if (media) gsap.from(media, { scale: 1.3, duration: dur + 0.4, ease: EASE, delay, scrollTrigger: once(el, start) });
        return;
      }

      if (type === 'children') {
        gsap.set(el, { autoAlpha: 1 });
        gsap.from(el.children, {
          autoAlpha: 0, y: opt(el, 'distance', 40), duration: dur, ease: EASE,
          stagger: opt(el, 'stagger', 0.12), delay, scrollTrigger: once(el, start)
        });
        return;
      }

      const from = { autoAlpha: 0 };
      if (type === 'up' || split) from.y = opt(el, 'distance', 40);
      if (type === 'scale') from.scale = opt(el, 'from', 1.15);
      gsap.from(el, Object.assign(from, { duration: dur, ease: EASE, delay, scrollTrigger: once(el, start) }));
    });
  }

  /* =========================================================
     6. PARALLAX — data-parallax="0.2" (velocidad, negativo = al revés)
     ========================================================= */
  function initParallax(c) {
    $$('[data-parallax]').forEach((el) => {
      if (!enabled(el, c)) return;
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const horizontal = !!hTween(el);
      const prop = horizontal ? 'x' : 'y';
      const dist = () => (horizontal ? window.innerWidth : window.innerHeight) * speed * 0.5;
      gsap.fromTo(el, { [prop]: () => dist() }, {
        [prop]: () => -dist(), ease: 'none',
        scrollTrigger: track(el, { scrub: true, invalidateOnRefresh: true })
      });
    });
  }

  /* =========================================================
     7. IMAGE MOVE — la imagen se desplaza dentro de su marco
     <figure data-image-move="20"><img></figure>
     ========================================================= */
  function initImageMove(c) {
    $$('[data-image-move]').forEach((box) => {
      if (!enabled(box, c)) return;
      const media = box.querySelector(MEDIA);
      if (!media) return;
      const amount = parseFloat(box.dataset.imageMove) || 20;
      const horizontal = !!hTween(box);
      box.style.setProperty('--sk-move', amount + '%');
      box.classList.add(horizontal ? 'sk-move-x' : 'sk-move-y');
      const p = horizontal ? 'xPercent' : 'yPercent';
      gsap.fromTo(media, { [p]: -amount / (100 + amount) * 100 }, {
        [p]: 0, ease: 'none', scrollTrigger: track(box, { scrub: true })
      });
    });
  }

  /* =========================================================
     8. ZOOM — la imagen escala mientras pasa por pantalla
     <div data-zoom="1.3"><img></div>   (de 1.3 a 1)
     ========================================================= */
  function initZoom(c) {
    $$('[data-zoom]').forEach((box) => {
      if (!enabled(box, c)) return;
      const media = box.querySelector(MEDIA) || box;
      gsap.fromTo(media, { scale: parseFloat(box.dataset.zoom) || 1.25 }, {
        scale: opt(box, 'to', 1), ease: 'none',
        scrollTrigger: track(box, { scrub: true, start: box.dataset.start || undefined })
      });
    });
  }

  /* =========================================================
     9. EXPAND — un marco recortado que se abre a pantalla completa
     <div data-expand="15% 25%" data-pin data-length="150%"><img></div>
     ========================================================= */
  function initExpand(c) {
    $$('[data-expand]').forEach((el) => {
      if (!enabled(el, c)) return;
      const from = el.dataset.expand || '15% 25%';
      const r = opt(el, 'radius', 0);
      const pinEl = el.hasAttribute('data-pin') ? (el.closest('section') || el) : null;
      const tl = gsap.timeline({
        scrollTrigger: pinEl
          ? { trigger: pinEl, start: 'top top', end: '+=' + (el.dataset.length || '150%'), pin: true, scrub: true }
          : { trigger: el, start: 'top bottom', end: el.dataset.end || 'center center', scrub: true }
      });
      tl.fromTo(el, { clipPath: `inset(${from} round ${r}px)` }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none' });
      const media = el.querySelector('img, video, picture, [data-media]');
      if (media) tl.fromTo(media, { scale: opt(el, 'from', 1.3) }, { scale: 1, ease: 'none' }, 0);
    });
  }

  /* =========================================================
     10. COLLAGE — sección fijada: la pieza principal crece,
         las demás se abren hacia fuera
     <section data-collage data-length="200%">
       <div data-collage-item="main" data-from="0.4">…</div>
       <div data-collage-item data-speed="1">…</div>
     ========================================================= */
  function initCollage(c) {
    $$('[data-collage]').forEach((sec) => {
      if (!enabled(sec, c)) return;
      const items = $$('[data-collage-item]', sec);
      if (!items.length) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec, start: 'top top', end: '+=' + (sec.dataset.length || '200%'),
          pin: true, scrub: true, invalidateOnRefresh: true
        }
      });
      items.forEach((it) => {
        if (it.dataset.collageItem === 'main') {
          tl.fromTo(it, { scale: opt(it, 'from', 0.4) }, { scale: 1, ease: 'power2.inOut' }, 0);
          return;
        }
        const speed = opt(it, 'speed', 1);
        const rect = it.getBoundingClientRect();
        const secRect = sec.getBoundingClientRect();
        const dir = (rect.left + rect.width / 2) < (secRect.left + secRect.width / 2) ? -1 : 1;
        const to = {
          x: () => dir * window.innerWidth * 0.3 * speed,
          y: () => -window.innerHeight * 0.35 * speed,
          ease: 'power2.in'
        };
        if (it.dataset.fade !== 'off') to.autoAlpha = 0;
        tl.to(it, to, 0);
      });
    });
  }

  /* =========================================================
     11. STACK — cada bloque se queda fijo y el siguiente lo tapa
     <div data-stack data-shade="0.5">
       <section>…<div data-stack-move>…</div></section>
       <section>…</section>
     </div>
     ========================================================= */
  function initStack(c) {
    $$('[data-stack]').forEach((wrap) => {
      if (!enabled(wrap, c)) return;
      const panels = Array.from(wrap.children);
      const shade = opt(wrap, 'shade', 0.5);
      panels.forEach((p, i) => {
        p.classList.add('sk-stack-panel');
        p.style.zIndex = i + 1;
        const next = panels[i + 1];
        if (!next) return;
        ScrollTrigger.create({
          trigger: p,
          start: () => (p.offsetHeight <= window.innerHeight ? 'top top' : 'bottom bottom'),
          endTrigger: next,
          end: 'top top',
          pin: true,
          pinSpacing: false
        });
        const cover = { trigger: next, start: 'top bottom', end: 'top top', scrub: true };
        gsap.fromTo(p, { '--sk-shade': 0 }, { '--sk-shade': shade, ease: 'none', scrollTrigger: cover });
        $$('[data-stack-move]', p).forEach((m) => {
          gsap.to(m, { yPercent: -opt(m, 'stackMove', 10), ease: 'none', scrollTrigger: Object.assign({}, cover) });
        });
      });
    });
  }

  /* =========================================================
     12. STEPS — sección fijada con N pasos que cambian al hacer scroll
     <section data-steps data-step-length="1" data-snap>
       <div data-step>…</div> × N
       <img data-step-media> × N   (opcional)
       <span data-step-counter></span>  <i data-step-progress></i>
     ========================================================= */
  function initSteps(c) {
    $$('[data-steps]').forEach((sec) => {
      if (!enabled(sec, c)) return;
      const steps = $$('[data-step]', sec);
      const media = $$('[data-step-media]', sec);
      const counters = $$('[data-step-counter]', sec);
      const bars = $$('[data-step-progress]', sec);
      const n = steps.length;
      if (!n) return;
      let current = -1;

      const setCounter = (i) => counters.forEach((el) => { el.textContent = (i + 1) + ' — ' + n; });

      const show = (i, instant) => {
        if (i === current) return;
        const prev = current;
        current = i;
        sec.dataset.activeStep = i;
        steps.forEach((el, k) => el.classList.toggle('is-active', k === i));
        media.forEach((el, k) => el.classList.toggle('is-active', k === i));
        setCounter(i);
        sec.dispatchEvent(new CustomEvent('sk:step', { detail: { index: i, total: n } }));
        if (instant) return;
        if (steps[prev]) gsap.to(steps[prev], { autoAlpha: 0, y: -30, duration: 0.45, ease: 'power2.in', overwrite: true });
        gsap.fromTo(steps[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, delay: 0.25, overwrite: true });
        if (media[prev]) gsap.to(media[prev], { autoAlpha: 0, duration: 0.8, overwrite: true });
        if (media[i]) gsap.fromTo(media[i], { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: EASE, overwrite: true });
      };

      gsap.set(steps.slice(1).concat(media.slice(1)), { autoAlpha: 0 });
      show(0, true);

      const len = opt(sec, 'stepLength', 1);
      const st = {
        trigger: sec, start: 'top top', end: () => '+=' + n * window.innerHeight * len,
        pin: true, invalidateOnRefresh: true,
        onUpdate: (self) => {
          show(Math.min(n - 1, Math.floor(self.progress * n)));
          bars.forEach((b) => gsap.set(b, { scaleX: self.progress }));
        }
      };
      if (sec.hasAttribute('data-snap')) {
        st.snap = { snapTo: (v) => (Math.min(n - 1, Math.floor(v * n)) + 0.5) / n, duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' };
      }
      ScrollTrigger.create(st);
    });
  }

  /* =========================================================
     13. PROGRESS — barra que se llena con el scroll
     data-progress            → progreso de su sección
     data-progress="page"     → progreso de toda la página
     data-progress="#id"      → progreso de otro elemento
     ========================================================= */
  function initProgress() {
    $$('[data-progress]').forEach((bar) => {
      if (bar.closest('[data-steps]') && bar.hasAttribute('data-step-progress')) return;
      const v = bar.dataset.progress;
      const page = v === 'page';
      const target = page ? document.documentElement : (v ? document.querySelector(v) : bar.closest('section'));
      if (!target) return;
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: page
          ? { start: 0, end: 'max', scrub: true }
          : { trigger: target, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* =========================================================
     14. DRAW — trazos SVG que se dibujan
     data-draw (con el scroll) · data-draw="once" (una vez)
     ========================================================= */
  function initDraw() {
    $$('[data-draw]').forEach((el) => {
      const shapes = el.matches('path,line,polyline,polygon,circle,rect,ellipse')
        ? [el] : $$('path,line,polyline,polygon,circle,rect,ellipse', el);
      if (!shapes.length) return;
      shapes.forEach((p) => {
        const L = p.getTotalLength ? p.getTotalLength() : 0;
        gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      });
      if (el.dataset.draw === 'once') {
        gsap.to(shapes, { strokeDashoffset: 0, duration: opt(el, 'duration', 2), ease: 'power2.inOut', stagger: 0.15, delay: opt(el, 'delay', 0), scrollTrigger: once(el) });
      } else {
        gsap.to(shapes, { strokeDashoffset: 0, ease: 'none', scrollTrigger: track(el, { scrub: true, start: el.dataset.start || 'top 85%', end: el.dataset.end || 'bottom 35%' }) });
      }
    });
  }

  /* =========================================================
     15. COUNT — números que cuentan al aparecer
     <span data-count="1250" data-locale="es-ES">0</span>
     ========================================================= */
  function initCount(reduce) {
    $$('[data-count]').forEach((el) => {
      const raw = el.dataset.count;
      const end = parseFloat(raw);
      const dec = (raw.split('.')[1] || '').length;
      const loc = el.dataset.locale || 'es-ES';
      const fmt = (n) => n.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (reduce) { el.textContent = fmt(end); return; }
      const o = { v: 0 };
      el.textContent = fmt(0);
      gsap.to(o, {
        v: end, duration: opt(el, 'duration', 2), ease: 'power2.out', delay: opt(el, 'delay', 0),
        scrollTrigger: once(el), onUpdate: () => { el.textContent = fmt(o.v); }
      });
    });
  }

  /* =========================================================
     16. HIGHLIGHT LIST — el elemento que cruza el centro se ilumina
     <ul data-highlight data-dim="0.15"><li>…</li>…</ul>
     <img data-highlight-media> × N (opcional, en la misma sección)
     ========================================================= */
  function initHighlight() {
    $$('[data-highlight]').forEach((list) => {
      const items = Array.from(list.children);
      if (!items.length) return;
      const scope = list.closest('section') || document;
      const media = $$('[data-highlight-media]', scope);
      list.classList.add('sk-highlight');
      list.style.setProperty('--sk-dim', opt(list, 'dim', 0.15));
      let current = -1;
      const set = (i) => {
        if (i === current) return;
        current = i;
        items.forEach((it, k) => it.classList.toggle('is-active', k === i));
        media.forEach((m, k) => m.classList.toggle('is-active', k === i));
        list.dispatchEvent(new CustomEvent('sk:highlight', { detail: { index: i } }));
      };
      items.forEach((it, i) => ScrollTrigger.create({
        trigger: it, start: 'top center', end: 'bottom center',
        onToggle: (self) => { if (self.isActive) set(i); }
      }));
      set(0);
    });
  }

  /* =========================================================
     17. VELOCITY — se inclina según la velocidad del scroll
     <div data-velocity="5">…</div>   (grados máximos)
     ========================================================= */
  function initVelocity(c) {
    const items = $$('[data-velocity]').filter((el) => enabled(el, c)).map((el) => ({
      max: parseFloat(el.dataset.velocity) || 5,
      q: gsap.quickTo(el, 'skewY', { duration: 0.4, ease: 'power3' })
    }));
    if (!items.length) return;
    let t = null;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const v = self.getVelocity();
        items.forEach((o) => o.q(gsap.utils.clamp(-o.max, o.max, -v / 250)));
        clearTimeout(t);
        t = setTimeout(() => items.forEach((o) => o.q(0)), 90);
      }
    });
  }

  /* =========================================================
     18. SHRINK TO — un elemento grande (logo) se encoge hasta
         la posición de otro (hueco en el header) con el scroll
     <div data-shrink-to="#logo-slot" data-end="600">LOGO</div>
     ========================================================= */
  function initShrink(c) {
    $$('[data-shrink-to]').forEach((el) => {
      if (!enabled(el, c)) return;
      const target = document.querySelector(el.dataset.shrinkTo);
      if (!target) return;
      const hdr = target.closest('[data-header]');
      const measure = () => {
        gsap.set(el, { clearProps: 'transform' });
        const a = el.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        // Si el header está oculto en ese momento, se mide como si estuviera en su sitio
        const off = hdr ? hdr.getBoundingClientRect().top : 0;
        return {
          x: (b.left + b.width / 2) - (a.left + a.width / 2),
          y: (b.top - off + b.height / 2) - (a.top + a.height / 2),
          s: a.width ? b.width / a.width : 1
        };
      };
      let d = measure();
      gsap.to(el, {
        x: () => d.x, y: () => d.y, scale: () => d.s, ease: 'none', transformOrigin: '50% 50%',
        scrollTrigger: {
          start: 0,
          end: () => opt(el, 'end', window.innerHeight * 0.8),
          scrub: opt(el, 'scrub', 0.6),
          invalidateOnRefresh: true,
          onRefreshInit: () => { d = measure(); },
          onUpdate: (self) => el.classList.toggle('sk-shrunk', self.progress > 0.98)
        }
      });
    });
  }

  /* =========================================================
     19. CURSOR — cursor propio que sigue al ratón
     <div data-cursor><span data-cursor-label></span></div>
     <a data-cursor-text="Ver">…</a>
     ========================================================= */
  function initCursor() {
    const cur = document.querySelector('[data-cursor]');
    if (!cur) return;
    if (window.matchMedia('(hover: none)').matches) { cur.style.display = 'none'; return; }
    if (cur.dataset.cursor === 'hide-native') document.documentElement.classList.add('sk-no-cursor');
    const label = cur.querySelector('[data-cursor-label]');
    gsap.set(cur, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const dur = opt(cur, 'speed', 0.5);
    const qx = gsap.quickTo(cur, 'x', { duration: dur, ease: 'power3' });
    const qy = gsap.quickTo(cur, 'y', { duration: dur, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      qx(e.clientX); qy(e.clientY);
      cur.classList.add('is-visible');
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.remove('is-visible'));
    document.addEventListener('pointerover', (e) => {
      const withText = e.target.closest('[data-cursor-text]');
      const hover = withText || e.target.closest('a, button, [data-cursor-hover]');
      cur.classList.toggle('is-hover', !!hover);
      cur.classList.toggle('has-text', !!withText);
      if (label) label.textContent = withText ? withText.dataset.cursorText : '';
    });
    document.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    document.addEventListener('pointerup', () => cur.classList.remove('is-down'));
  }

  /* =========================================================
     20. SONIDO DE VÍDEO — botón activar / silenciar
     <button data-sound-toggle="#hero-video" data-label-on="Silenciar" data-label-off="Activar sonido">
     ========================================================= */
  function initSound() {
    $$('[data-sound-toggle]').forEach((btn) => {
      const v = document.querySelector(btn.dataset.soundToggle);
      if (!v) return;
      const onTxt = btn.dataset.labelOn || 'Silenciar';
      const offTxt = btn.dataset.labelOff || 'Activar sonido';
      const update = () => {
        btn.textContent = v.muted ? offTxt : onTxt;
        btn.setAttribute('aria-pressed', String(!v.muted));
      };
      update();
      btn.addEventListener('click', () => {
        v.muted = !v.muted;
        if (!v.muted) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        update();
      });
    });
  }

  /* =========================================================
     21. BLUR-UP — la imagen aparece desenfocada y se enfoca al cargar
     <img data-blur src="…">
     ========================================================= */
  function initBlur() {
    $$('img[data-blur]').forEach((img) => {
      const done = () => img.classList.add('sk-loaded');
      if (img.complete && img.naturalWidth) done();
      else img.addEventListener('load', done, { once: true });
    });
  }

  /* =========================================================
     22. STICKY — se queda pegado mientras su contenedor pasa
     <p data-sticky="80">Etiqueta</p>   (80 = px desde arriba)
     ========================================================= */
  function initSticky() {
    $$('[data-sticky]').forEach((el) => {
      el.style.top = (parseFloat(el.dataset.sticky) || 0) + 'px';
    });
  }

  /* =========================================================
     23. INTRO — pantalla de entrada que se levanta
     <div data-intro="once" data-hold="0.8"><h1 data-intro-item>…</h1></div>
     ========================================================= */
  function shouldShowIntro(el) {
    if (el.dataset.intro === 'once' && document.documentElement.classList.contains('sk-intro-seen')) return false;
    return true;
  }

  function runIntro(el, onLift) {
    const html = document.documentElement;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (lenis) lenis.stop();
    html.classList.add('sk-intro-active');
    if (el.dataset.intro === 'once') { try { sessionStorage.setItem('sk-intro', '1'); } catch (e) { /* sin storage */ } }
    const items = $$('[data-intro-item]', el);
    const tl = gsap.timeline();
    if (items.length) tl.from(items, { autoAlpha: 0, y: 40, duration: 1, ease: EASE, stagger: 0.12 });
    tl.to({}, { duration: opt(el, 'hold', 0.8) });
    tl.add(onLift);
    tl.to(el, {
      yPercent: -100, duration: opt(el, 'duration', 1.2), ease: 'expo.inOut',
      onComplete: () => {
        el.style.display = 'none';
        html.classList.remove('sk-intro-active');
        if (lenis) lenis.start();
        document.dispatchEvent(new CustomEvent('sk:intro-done'));
      }
    });
  }

  /* =========================================================
     24. TRANSICIÓN ENTRE PÁGINAS — cortina al cambiar de página
     <div data-transition></div>   (una capa a pantalla completa)
     ========================================================= */
  function initTransition(skipIn) {
    const ov = document.querySelector('[data-transition]');
    if (!ov) return;
    const html = document.documentElement;
    const dur = opt(ov, 'duration', 0.9);
    if (html.classList.contains('sk-arriving') && !skipIn) {
      gsap.fromTo(ov, { yPercent: 0 }, {
        yPercent: -100, duration: dur, ease: 'expo.inOut', delay: 0.1,
        onComplete: () => { html.classList.remove('sk-arriving'); gsap.set(ov, { yPercent: 100 }); }
      });
    } else {
      html.classList.remove('sk-arriving');
      gsap.set(ov, { yPercent: 100 });
    }
    try { sessionStorage.removeItem('sk-transition'); } catch (e) { /* sin storage */ }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // anclas en la misma página
      e.preventDefault();
      try { sessionStorage.setItem('sk-transition', '1'); } catch (err) { /* sin storage */ }
      if (lenis) lenis.stop();
      gsap.fromTo(ov, { yPercent: 100 }, { yPercent: 0, duration: dur * 0.85, ease: 'expo.inOut', onComplete: () => { location.href = url.href; } });
    });
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) { gsap.set(ov, { yPercent: 100 }); if (lenis) lenis.start(); }
    });
  }

  /* =========================================================
     ORDEN: ScrollTrigger calcula posiciones en el orden de creación.
     Como "horizontal" se crea primero, se reordenan todos según su
     posición en la página para que los pins no se descuadren.
     ========================================================= */
  function sortByPage() {
    const idx = new Map();
    $$('*').forEach((el, i) => idx.set(el, i));
    const pos = (st) => {
      const t = st.trigger || (st.pin && st.pin);
      return t && idx.has(t) ? idx.get(t) : -1;
    };
    ScrollTrigger.sort((a, b) => pos(a) - pos(b));
    refresh();
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  function boot() {
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    initLenis(reduce);
    initAnchors();
    initHeader();
    initVideo();
    initSound();
    initBlur();
    initSticky();
    initCursor();

    let started = false;
    const startEffects = () => {
      if (started) return;
      started = true;
      const mm = gsap.matchMedia();
      mm.add({
        isDesktop: `(min-width: ${BP}px)`,
        isMobile: `(max-width: ${BP - 1}px)`,
        reduce: '(prefers-reduced-motion: reduce)'
      }, (ctx) => {
        const c = ctx.conditions;
        if (c.reduce) {
          gsap.set('[data-reveal]', { autoAlpha: 1 });
          return;
        }
        // El orden importa: horizontal primero
        initHorizontal(c);
        initStack(c);
        initCollage(c);
        initExpand(c);
        initSteps(c);
        initImageMove(c);
        initZoom(c);
        initParallax(c);
        initReveal(c);
        initProgress();
        initDraw();
        initVelocity(c);
        initShrink(c);
        sortByPage();
        return () => { $$('[data-horizontal]').forEach((w) => { delete w._skTween; w.classList.remove('sk-h-active'); }); };
      });
      initHighlight();
      initCount(reduce);
      html.classList.add('sk-ready');
    };

    const intro = document.querySelector('[data-intro]');
    if (intro && !reduce && shouldShowIntro(intro)) {
      initTransition(true);
      runIntro(intro, startEffects);
    } else {
      if (intro) intro.style.display = 'none';
      initTransition(false);
      startEffects();
    }

    // Recalcular cuando cargan imágenes (cambian alturas)
    $$('img').forEach((img) => { if (!img.complete) img.addEventListener('load', refresh, { once: true }); });
    window.addEventListener('load', refresh);
  }

  function start() {
    try {
      boot();
    } catch (err) {
      console.error('[ScrollKit]', err);
      document.documentElement.classList.remove('sk-js'); // si algo falla, que el contenido se vea
    }
  }

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const go = () => fontsReady.then(start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();

  /* API pública */
  window.ScrollKit = {
    get lenis() { return lenis; },
    refresh: () => ScrollTrigger.refresh(),
    scrollTo,
    stop: () => lenis && lenis.stop(),
    start: () => lenis && lenis.start()
  };
})();
