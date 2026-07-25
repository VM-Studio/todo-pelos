/* ==========================================================================
   HERO — Canvas image sequence scrubbing
   La secuencia son 120 frames webp (1280x720, resolución nativa del video
   fuente, sin upscaling) en /seq/frame_NNN.webp.
   El scroll controla el frame dibujado en el canvas (ver src/js/hero.js).
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
/* La mujer está apenas a la derecha del centro del cuadro */
const FOCAL_X = 0.6;
const MAX_DPR = 2;

const framePath = (i) => `/seq/frame_${String(i + 1).padStart(3, '0')}.webp`;

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

  /* ---------- Carga de frames ---------- */
  const images = new Array(FRAME_COUNT).fill(null);
  const failed = new Set();
  let currentFrame = -1; // último frame dibujado

  function loadFrame(i, priority = false) {
    return new Promise((resolve) => {
      if (images[i] || failed.has(i)) return resolve();
      const img = new Image();
      if (priority) img.fetchPriority = 'high';
      img.decoding = 'async';
      img.onload = () => {
        images[i] = img;
        resolve(img);
      };
      img.onerror = () => {
        failed.add(i); // frame que falla se saltea
        resolve();
      };
      img.src = framePath(i);
    });
  }

  /* Frame cargado más cercano al pedido */
  function nearestLoaded(i) {
    if (images[i]) return i;
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (images[i - d]) return i - d;
      if (images[i + d]) return i + d;
    }
    return -1;
  }

  /* ---------- Dibujo con lógica cover + punto focal ---------- */
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

  function drawFrame(i) {
    const idx = nearestLoaded(i);
    if (idx === -1) return;
    const img = images[idx];

    /* cover: escala mínima que llena el viewport sin deformar */
    const scale = Math.max(cssW / FRAME_WIDTH, cssH / FRAME_HEIGHT);
    const drawW = FRAME_WIDTH * scale;
    const drawH = FRAME_HEIGHT * scale;

    /* recorte horizontal centrado en el punto focal, sin salirse del cuadro */
    let dx = cssW / 2 - FOCAL_X * drawW;
    dx = Math.min(0, Math.max(cssW - drawW, dx));
    const dy = (cssH - drawH) / 2;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, dx, dy, drawW, drawH);
    currentFrame = idx;
  }

  function requestFrame(i) {
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, i));
    if (clamped === currentFrame && images[clamped]) return;
    drawFrame(clamped);
  }

  resizeCanvas();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      if (currentFrame >= 0) drawFrame(currentFrame);
    }, 150);
  });

  /* ---------- Estrategia de precarga ---------- */
  async function preloadResto() {
    // Pasada gruesa: 1 de cada 5 a lo largo de toda la secuencia
    const coarse = [];
    for (let i = 5; i < FRAME_COUNT; i += 5) coarse.push(loadFrame(i));
    await Promise.all(coarse);

    // Relleno de intermedios
    const rest = [];
    for (let i = 1; i < FRAME_COUNT; i++) {
      if (!images[i] && !failed.has(i)) rest.push(loadFrame(i));
    }
    await Promise.all(rest);
  }

  async function preload() {
    // Frame 1 primero, con prioridad alta: el hero nunca se ve vacío
    await loadFrame(0, true);
    drawFrame(0);

    // El resto arranca DESPUÉS del primer paint para no competir
    // con el render inicial (rAF doble + idle callback)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => preloadResto(), { timeout: 1500 });
        } else {
          setTimeout(preloadResto, 200);
        }
      });
    });
  }
  preload();

  /* ---------- Reduced motion: último frame estático, sin pin ---------- */
  if (reducedMotion) {
    section.classList.add('hero--static');
    loadFrame(FRAME_COUNT - 1).then(() => drawFrame(FRAME_COUNT - 1));
    if (hint) hint.remove();
    if (outro) outro.remove();
    return;
  }

  /* ---------- Scrubbing con ScrollTrigger ---------- */
  let hintHidden = false;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress;

      // progreso -> frame (interpolación + redondeo)
      requestFrame(Math.round(p * (FRAME_COUNT - 1)));

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
