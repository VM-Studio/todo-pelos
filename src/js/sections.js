/* ==========================================================================
   SECCIONES — Servicios / Antes y Después / Calidad
   Animaciones de entrada
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Animaciones de entrada (fade + subida, una sola vez) ---------- */
function initReveals() {
  if (reducedMotion) return;

  const groups = [
    ['#quienes-somos .section-head', '#quienes-somos .quienes-somos-item', '#quienes-somos .quienes-somos-cierre', '#quienes-somos .quienes-somos-firma'],
    ['#salon .salon-card'],
    ['#servicios .section-head', '#servicios .servicio', '#servicios .servicios-cta-wrap'],
    ['#instagram .section-head', '#instagram .ig-reel', '#instagram .ig-cta-wrap'],
    ['#antes-despues .section-head', '#antes-despues .ad-foto', '#antes-despues .comparador-caption'],
    ['#calidad .section-head', '#calidad .calidad-item', '#calidad .calidad-cierre'],
  ];

  groups.forEach((selectors) => {
    const els = selectors.flatMap((s) => gsap.utils.toArray(s));
    if (!els.length) return;
    gsap.from(els, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out',
      stagger: 0.12,
      /* sin transform inline al terminar: si no, pisa los hover con translate */
      clearProps: 'transform',
      scrollTrigger: {
        trigger: els[0],
        start: 'top 80%',
        once: true,
      },
    });
  });
}

/* ---------- El salón: leve zoom-out de la foto fija mientras se la recorre ---------- */
function initSalon() {
  const img = document.querySelector('.salon-fondo-img');
  if (!img || reducedMotion) return;
  gsap.fromTo(
    img,
    { scale: 1.14 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#salon',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

export function initSections() {
  initReveals();
  initSalon();
  /* El contenido nuevo cambia las alturas: recalcular triggers del hero */
  ScrollTrigger.refresh();
}