/* ==========================================================================
   PELUCAS — colección: tarjetas + carrusel + visor a pantalla completa
   (el visor vive en visor.js y lo comparte con cortinas.js)
   Fotos optimizadas con scripts/generar-pelucas.mjs en /img/pelucas/:
     peluca-XX-card.webp (4:5, tarjetas) y peluca-XX.webp (16:9, visor)
   ========================================================================== */

import { gsap } from 'gsap';
import { waLink } from './datos.js';
import { createVisor } from './visor.js';

/* Cada modelo puede tener varias vistas: en desktop, al pasar el mouse
   la tarjeta cruza a la segunda vista */
export const PELUCAS = [
  {
    nombre: 'Midi cobrizo',
    detalle: 'Ondas suaves · Largo medio',
    fotos: ['02', '03'],
  },
  {
    nombre: 'Rubio ombré',
    detalle: 'Largo · Ondas · Flequillo',
    fotos: ['04', '05'],
  },
  {
    nombre: 'Chocolate con flequillo',
    detalle: 'Largo · Lacio en capas',
    fotos: ['06'],
  },
];

/* Orden del visor: la colección completa y después cada modelo */
const GALERIA = [
  { foto: '01', caption: 'La colección en nuestro showroom' },
  ...PELUCAS.flatMap((p) =>
    p.fotos.map((foto) => ({ foto, caption: `${p.nombre} — ${p.detalle}` }))
  ),
];

const rutaCard = (n) => `/img/pelucas/peluca-${n}-card.webp`;
const rutaFull = (n) => `/img/pelucas/peluca-${n}.webp`;

const mensajePeluca = (nombre) =>
  `Hola! Me interesa la peluca ${nombre}. ¿Me pasan info?`;

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Tarjetas ---------- */
function buildCards(carrusel, abrirVisor) {
  PELUCAS.forEach((p) => {
    const indiceVisor = GALERIA.findIndex((g) => g.foto === p.fotos[0]);
    const card = document.createElement('article');
    card.className = 'peluca-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <button class="peluca-card-media" type="button" aria-label="Ver ${p.nombre} en grande">
        ${p.fotos
          .map(
            (f, i) => `<img class="peluca-card-img${i ? ' peluca-card-img--alt' : ''}"
              src="${rutaCard(f)}" alt="${i ? '' : `Peluca ${p.nombre}`}"
              width="720" height="900" loading="lazy" decoding="async" />`
          )
          .join('')}
        ${p.fotos.length > 1 ? `<span class="peluca-card-vistas">${p.fotos.length} vistas</span>` : ''}
      </button>
      <div class="peluca-card-info">
        <div>
          <h3 class="peluca-card-nombre">${p.nombre}</h3>
          <p class="peluca-card-detalle">${p.detalle}</p>
        </div>
        <a class="peluca-card-cta" href="${waLink(mensajePeluca(p.nombre))}" target="_blank" rel="noopener"
          aria-label="Consultar por ${p.nombre} en WhatsApp">Consultar</a>
      </div>
    `;
    card
      .querySelector('.peluca-card-media')
      .addEventListener('click', () => abrirVisor(indiceVisor));
    carrusel.appendChild(card);
  });

  /* Tarjeta final: a medida */
  const medida = document.createElement('article');
  medida.className = 'peluca-card peluca-card--medida';
  medida.setAttribute('role', 'listitem');
  medida.innerHTML = `
    <p class="peluca-card-medida-eyebrow">A medida</p>
    <h3 class="peluca-card-medida-titulo">¿Buscás otro color o largo?</h3>
    <p class="peluca-card-medida-texto">
      La creamos en nuestro taller: elegimos juntas el tono, el largo y la
      textura, y la ajustamos a tu medida.
    </p>
    <a class="peluca-card-medida-cta" href="${waLink(
      'Hola! Quiero consultar por una peluca a medida.'
    )}" target="_blank" rel="noopener">Pedir asesoramiento</a>
  `;
  carrusel.appendChild(medida);
}

/* ---------- Barra de progreso del carrusel (mobile) ---------- */
function initProgreso(carrusel, seccion) {
  const fill = seccion.querySelector('.pelucas-nav-fill');
  if (!fill) return;
  const actualizar = () => {
    const max = carrusel.scrollWidth - carrusel.clientWidth;
    const visible = carrusel.clientWidth / carrusel.scrollWidth;
    const p = max > 0 ? carrusel.scrollLeft / max : 0;
    fill.style.width = `${visible * 100}%`;
    fill.style.transform = `translateX(${(p * (1 - visible) * 100) / visible}%)`;
  };
  carrusel.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();
}

export function initPelucas() {
  const seccion = document.querySelector('#pelucas');
  if (!seccion) return;
  const carrusel = seccion.querySelector('.pelucas-carrusel');

  const abrirVisor = createVisor(
    GALERIA.map((g) => ({
      /* la foto de la colección completa no tiene recorte vertical útil */
      full: rutaFull(g.foto),
      card: g.foto === '01' ? null : rutaCard(g.foto),
      caption: g.caption,
    })),
    'Galería de pelucas'
  );
  buildCards(carrusel, abrirVisor);
  initProgreso(carrusel, seccion);

  seccion.querySelectorAll('[data-visor-abrir]').forEach((el) => {
    el.addEventListener('click', () => abrirVisor(Number(el.dataset.visorAbrir)));
  });

  if (reducedMotion) return;

  /* Entrada: textos suben, la foto destacada se descubre con una máscara */
  gsap.from(
    seccion.querySelectorAll('.pelucas-intro .section-head, .pelucas-beneficios li, .pelucas-acciones'),
    {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: { trigger: seccion, start: 'top 75%', once: true },
    }
  );
  gsap.from(seccion.querySelector('.pelucas-destacada'), {
    clipPath: 'inset(12% 12% 12% 12% round 28px)',
    duration: 1.3,
    ease: 'power3.out',
    scrollTrigger: { trigger: seccion, start: 'top 70%', once: true },
  });
  gsap.from(seccion.querySelectorAll('.peluca-card'), {
    opacity: 0,
    y: 60,
    duration: 0.9,
    ease: 'power2.out',
    stagger: 0.12,
    clearProps: 'transform',
    scrollTrigger: { trigger: carrusel, start: 'top 85%', once: true },
  });
}
