/* ==========================================================================
   HERO — Canvas image sequence scrubbing
   Dos secuencias de fotogramas webp:
     - Desktop: 120 frames 1280x720 en /seq/, modo "cover" (llena el
       viewport, recorta con foco a la derecha del centro).
     - Mobile:  120 frames 900x1600 en /seq-mobile/, modo "fit-ancho"
       (se ve el frame COMPLETO a lo ancho, sin zoom ni recorte lateral).
   La secuencia se elige por orientación de viewport (vertical → mobile,
   horizontal → desktop), tanto al iniciar como en cada resize/cambio
   de orientación que cruce el umbral (con debounce). El estado de
   carga anterior simplemente se descarta: los frames que venían
   bajando terminan escribiendo en un array que ya nadie usa, no hace
   falta abortar el request explícitamente.
   El scroll controla el frame dibujado en el canvas.
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CONFIGS = {
  desktop: {
    ruta: '/seq/',
    frames: 120,
    width: 1280,
    height: 720,
    modo: 'cover',
    focal: 0.6,
  },
  mobile: {
    ruta: '/seq-mobile/',
    frames: 120,
    width: 900,
    height: 1600,
    modo: 'fit-ancho',
    focal: 0.5,
    /* Opacidad de la propia imagen dibujada en el canvas (no un velo
       aparte): así se funde de verdad con el fondo --color-crema. */
    opacidad: 0.55,
  },
};

const MAX_DPR = 2;

const framePath = (config, i) =>
  `${config.ruta}frame_${String(i + 1).padStart(3, '0')}.webp`;

/* Vertical (alto > ancho) => mobile; si no, desktop */
function pickKey() {
  return window.innerHeight > window.innerWidth ? 'mobile' : 'desktop';
}

export function initHero() {
  const section = document.querySelector('#hero');
  if (!section) return;

  const stage = section.querySelector('.hero-stage');
  const canvas = section.querySelector('.hero-canvas');
  const ctx = canvas.getContext('2d');
  const intro = section.querySelector('.hero-intro');
  const outro = section.querySelector('.hero-outro');
  const hint = section.querySelector('.hero-hint');
  const progressFill = section.querySelector('.hero-progress-fill');

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ---------- Estado de carga por secuencia activa ---------- */
  function createState(key) {
    const config = CONFIGS[key];
    return {
      key,
      config,
      images: new Array(config.frames).fill(null),
      failed: new Set(),
      currentFrame: -1,
    };
  }

  let activeKey = pickKey();
  let state = createState(activeKey);

  function applyStageClass() {
    stage.classList.toggle(
      'hero-stage--fit',
      state.config.modo === 'fit-ancho'
    );
  }
  applyStageClass();

  function loadFrame(st, i, priority = false) {
    return new Promise((resolve) => {
      if (st.images[i] || st.failed.has(i)) return resolve();
      const img = new Image();
      if (priority) img.fetchPriority = 'high';
      img.decoding = 'async';
      img.onload = () => {
        st.images[i] = img;
        resolve(img);
      };
      img.onerror = () => {
        st.failed.add(i); // frame que falla se saltea
        resolve();
      };
      img.src = framePath(st.config, i);
    });
  }

  /* Frame cargado más cercano al pedido */
  function nearestLoaded(st, i) {
    if (st.images[i]) return i;
    for (let d = 1; d < st.config.frames; d++) {
      if (st.images[i - d]) return i - d;
      if (st.images[i + d]) return i + d;
    }
    return -1;
  }

  /* ---------- Dibujo ---------- */
  let cssW = 0;
  let cssH = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    cssW = stage.clientWidth;
    cssH = stage.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame(st, i) {
    const idx = nearestLoaded(st, i);
    if (idx === -1) return;
    const img = st.images[idx];
    const { config } = st;

    let dx, dy, drawW, drawH;

    if (config.modo === 'cover') {
      /* cover: escala mínima que llena el viewport sin deformar */
      const scale = Math.max(cssW / config.width, cssH / config.height);
      drawW = config.width * scale;
      drawH = config.height * scale;
      /* recorte horizontal centrado en el punto focal, sin salirse del cuadro */
      dx = cssW / 2 - config.focal * drawW;
      dx = Math.min(0, Math.max(cssW - drawW, dx));
      dy = (cssH - drawH) / 2;
    } else {
      /* fit-ancho: SIN zoom. El ancho del frame ocupa el ancho de la
         pantalla y se centra verticalmente. Si el alto escalado supera
         el alto del viewport, se recorta por abajo (nunca se corta la
         cabeza, que vive arriba del frame). */
      const scale = cssW / config.width;
      drawW = cssW;
      drawH = config.height * scale;
      dx = 0;
      dy = drawH <= cssH ? (cssH - drawH) / 2 : 0;
    }

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.globalAlpha = config.opacidad ?? 1;
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.globalAlpha = 1;
    st.currentFrame = idx;
  }

  function requestFrame(st, i) {
    const clamped = Math.max(0, Math.min(st.config.frames - 1, i));
    if (clamped === st.currentFrame && st.images[clamped]) return;
    drawFrame(st, clamped);
  }

  resizeCanvas();

  /* ---------- Estrategia de precarga ---------- */
  async function preloadResto(st) {
    // Pasada gruesa: 1 de cada 5 a lo largo de toda la secuencia
    const coarse = [];
    for (let i = 5; i < st.config.frames; i += 5) coarse.push(loadFrame(st, i));
    await Promise.all(coarse);

    // Relleno de intermedios
    const rest = [];
    for (let i = 1; i < st.config.frames; i++) {
      if (!st.images[i] && !st.failed.has(i)) rest.push(loadFrame(st, i));
    }
    await Promise.all(rest);
  }

  async function preload(st) {
    // Frame 1 primero, con prioridad alta: el hero nunca se ve vacío
    await loadFrame(st, 0, true);
    if (st === state) drawFrame(st, 0);

    // El resto arranca DESPUÉS del primer paint para no competir
    // con el render inicial (rAF doble + timeout corto)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => preloadResto(st), 200);
      });
    });
  }
  preload(state);

  /* ---------- Reduced motion: último frame estático, sin pin ---------- */
  if (reducedMotion) {
    section.classList.add('hero--static');
    loadFrame(state, state.config.frames - 1).then(() =>
      drawFrame(state, state.config.frames - 1)
    );
    if (hint) hint.remove();
    if (outro) outro.remove();
    return;
  }

  /* ---------- Resize / cambio de orientación ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      const newKey = pickKey();
      if (newKey !== state.key) {
        activeKey = newKey;
        state = createState(activeKey);
        applyStageClass();
        preload(state);
      } else if (state.currentFrame >= 0) {
        drawFrame(state, state.currentFrame);
      }
    }, 200);
  });

  /* ---------- Scrubbing con ScrollTrigger ---------- */
  let hintHidden = false;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress;

      // progreso -> frame (interpolación + redondeo) de la secuencia activa
      requestFrame(state, Math.round(p * (state.config.frames - 1)));

      // barra de progreso
      progressFill.style.transform = `scaleX(${p})`;

      // hint: se desvanece apenas arranca el scroll
      if (!hintHidden && p > 0.01) {
        hintHidden = true;
        gsap.to(hint, { autoAlpha: 0, y: 10, duration: 0.4 });
      } else if (hintHidden && p <= 0.01) {
        hintHidden = false;
        gsap.to(hint, { autoAlpha: 1, y: 0, duration: 0.4 });
      }

      // título: visible al inicio, fade + subida entre 15% y 35%
      const introP = gsap.utils.clamp(0, 1, (p - 0.15) / 0.2);
      intro.style.opacity = String(1 - introP);
      intro.style.transform = `translateY(${introP * -40}px)`;
      intro.style.visibility = introP >= 1 ? 'hidden' : 'visible';

      // cierre: aparece en el último 15%
      const outroP = gsap.utils.clamp(0, 1, (p - 0.85) / 0.15);
      outro.style.opacity = String(outroP);
      outro.style.transform = `translateY(${(1 - outroP) * 30}px)`;
      outro.style.visibility = outroP <= 0 ? 'hidden' : 'visible';
      outro.setAttribute('aria-hidden', outroP <= 0 ? 'true' : 'false');
    },
  });

  /* Hint: rebote sutil */
  gsap.to(hint, {
    y: 6,
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  /* CTA: scroll suave a #servicios (scroll-behavior del html es auto) */
  section.querySelectorAll('.hero-cta').forEach((cta) => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#servicios');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
