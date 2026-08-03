/* ==========================================================================
   SECCIONES — Servicios / Antes y Después / Calidad
   Animaciones de entrada + comparador interactivo antes/después
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initGaleria } from './servicios-galeria.js';
import { waLink } from './datos.js';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Animaciones de entrada (fade + subida, una sola vez) ---------- */
function initReveals() {
  if (reducedMotion) return;

  const groups = [
    ['#servicios .section-head', '#servicios .servicio', '#servicios .servicios-cta-wrap'],
    ['#antes-despues .section-head', '#antes-despues .comparador'],
    ['#calidad .section-head', '#calidad .calidad-item', '#calidad .calidad-cierre'],
    ['#formulario .section-head', '#formulario .formulario-form'],
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
      scrollTrigger: {
        trigger: els[0],
        start: 'top 80%',
        once: true,
      },
    });
  });
}

/* ---------- Comparador antes/después ---------- */
function initComparador() {
  const frame = document.querySelector('.comparador-frame');
  if (!frame) return null;

  const capaAntes = frame.querySelector('.comparador-capa-antes');
  const divisor = frame.querySelector('.comparador-divisor');

  let pos = 50; // porcentaje del lado "antes"

  function render() {
    capaAntes.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    divisor.style.left = `${pos}%`;
    divisor.setAttribute('aria-valuenow', String(Math.round(pos)));
  }

  function setFromClientX(clientX) {
    const rect = frame.getBoundingClientRect();
    pos = gsap.utils.clamp(0, 100, ((clientX - rect.left) / rect.width) * 100);
    render();
  }

  /* Pointer events: cubre mouse y touch */
  let dragging = false;

  frame.addEventListener('pointerdown', (e) => {
    dragging = true;
    frame.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  });
  frame.addEventListener('pointermove', (e) => {
    if (dragging) setFromClientX(e.clientX);
  });
  frame.addEventListener('pointerup', () => (dragging = false));
  frame.addEventListener('pointercancel', () => (dragging = false));

  /* Evitar scroll vertical accidental mientras se arrastra en touch */
  frame.style.touchAction = 'pan-y';

  /* Teclado */
  divisor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      pos = gsap.utils.clamp(0, 100, pos + (e.key === 'ArrowRight' ? 2 : -2));
      render();
    }
  });

  render();

  /* API mínima para que la galería resetee el divisor al cambiar de servicio */
  return {
    reset() {
      pos = 50;
      render();
    },
  };
}

/* ---------- Formulario de contacto ----------
   Sin backend propio: arma el mensaje con los datos cargados y abre
   WhatsApp con todo completado, para que la consulta llegue directo. */
function initFormulario() {
  const form = document.querySelector('#formulario-form');
  if (!form) return;

  const feedback = form.querySelector('#formulario-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !mensaje) {
      feedback.textContent = 'Completá al menos tu nombre y tu mensaje.';
      return;
    }

    const partes = [
      `Hola! Soy ${nombre}.`,
      telefono ? `Mi teléfono: ${telefono}.` : null,
      mensaje,
    ].filter(Boolean);

    const url = waLink(partes.join(' '));
    window.open(url, '_blank', 'noopener');

    feedback.textContent = 'Te abrimos WhatsApp con tu consulta lista para enviar.';
    form.reset();
  });
}

export function initSections() {
  initReveals();
  const comparador = initComparador();
  initGaleria(comparador);
  initFormulario();
  /* El contenido nuevo cambia las alturas: recalcular triggers del hero */
  ScrollTrigger.refresh();
}