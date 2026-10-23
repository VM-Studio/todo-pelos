/* ==========================================================================
   CORTINAS Y PONY TAILS — categorías + grilla de tonos con filtro + visor
   Fotos optimizadas con scripts/generar-cortinas.mjs en /img/cortinas/:
     cortina-XX-card.webp (4:5, tarjetas), cortina-XX.webp (16:9, visor) y
     cortina-XX-feature.webp (4:3, portadas de categoría)
   ========================================================================== */

import { gsap } from 'gsap';
import { waLink } from './datos.js';
import { createVisor } from './visor.js';

const TIPOS = {
  cortina: { nombre: 'Cortina', articulo: 'la cortina' },
  pony: { nombre: 'Pony tail', articulo: 'el pony tail' },
};

/* color: muestra del tono para el puntito de la tarjeta */
export const TONOS = [
  { foto: '02', tipo: 'pony', nombre: 'Cobrizo', detalle: 'Ondas largas', color: '#b4532a' },
  { foto: '03', tipo: 'pony', nombre: 'Castaño', detalle: 'Ondas suaves', color: '#6b4a33' },
  { foto: '04', tipo: 'pony', nombre: 'Miel', detalle: 'Ondas suaves', color: '#a8703c' },
  { foto: '05', tipo: 'pony', nombre: 'Chocolate', detalle: 'Ondas suaves', color: '#4a3322' },
  { foto: '06', tipo: 'cortina', nombre: 'Negro azabache', detalle: 'Ondas marcadas', color: '#1c1714' },
  { foto: '07', tipo: 'cortina', nombre: 'Platino', detalle: 'Ondas marcadas', color: '#d9cdb4' },
];

/* Orden del visor: las dos portadas y después cada tono */
const GALERIA = [
  { foto: '01', caption: 'Nuestra colección de cortinas' },
  ...TONOS.map((t) => ({
    foto: t.foto,
    caption: `${TIPOS[t.tipo].nombre} ${t.nombre} — ${t.detalle}`,
  })),
];

const rutaCard = (n) => `/img/cortinas/cortina-${n}-card.webp`;
const rutaFull = (n) => `/img/cortinas/cortina-${n}.webp`;

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Tarjetas de tonos ---------- */
function buildCards(grid, abrirVisor) {
  return TONOS.map((t) => {
    const tipo = TIPOS[t.tipo];
    const card = document.createElement('article');
    card.className = 'tono-card';
    card.dataset.tipo = t.tipo;
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <button class="tono-card-media" type="button" aria-label="Ver ${tipo.nombre} ${t.nombre} en grande">
        <img src="${rutaCard(t.foto)}" alt="${tipo.nombre} ${t.nombre}, ${t.detalle.toLowerCase()}"
          width="720" height="900" loading="lazy" decoding="async" />
        <span class="tono-card-tipo">${tipo.nombre}</span>
      </button>
      <div class="tono-card-info">
        <div class="tono-card-texto">
          <h4 class="tono-card-nombre">
            <span class="tono-card-swatch" style="background-color:${t.color}" aria-hidden="true"></span>
            ${t.nombre}
          </h4>
          <p class="tono-card-detalle">${t.detalle}</p>
        </div>
        <a class="tono-card-cta" href="${waLink(
          `Hola! Me interesa ${tipo.articulo} ${t.nombre}. ¿Me pasan info?`
        )}" target="_blank" rel="noopener" aria-label="Consultar por ${tipo.nombre} ${t.nombre} en WhatsApp">Consultar</a>
      </div>
    `;
    const indice = GALERIA.findIndex((g) => g.foto === t.foto);
    card.querySelector('.tono-card-media').addEventListener('click', () => abrirVisor(indice));
    grid.appendChild(card);
    return card;
  });
}

/* ---------- Filtro Todos / Cortinas / Pony tails ---------- */
function initFiltro(seccion, cards) {
  const botones = [...seccion.querySelectorAll('.cortinas-filtro')];
  const grid = seccion.querySelector('.cortinas-grid');

  function filtrar(filtro) {
    botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)));
    const visibles = [];
    cards.forEach((c) => {
      const ver = filtro === 'todos' || c.dataset.tipo === filtro;
      c.hidden = !ver;
      if (ver) visibles.push(c);
    });
    grid.scrollLeft = 0;
    if (!reducedMotion) {
      gsap.fromTo(
        visibles,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', clearProps: 'transform' }
      );
    }
  }

  botones.forEach((b) => b.addEventListener('click', () => filtrar(b.dataset.filtro)));

  /* "Ver tonos" de cada categoría: filtra y baja a la grilla */
  seccion.querySelectorAll('[data-filtro-ir]').forEach((el) => {
    el.addEventListener('click', () => {
      filtrar(el.dataset.filtroIr);
      seccion
        .querySelector('.cortinas-tonos')
        .scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

export function initCortinas() {
  const seccion = document.querySelector('#cortinas');
  if (!seccion) return;

  const abrirVisor = createVisor(
    GALERIA.map((g) => ({
      full: rutaFull(g.foto),
      card: rutaCard(g.foto),
      caption: g.caption,
    })),
    'Galería de cortinas y pony tails'
  );

  const cards = buildCards(seccion.querySelector('.cortinas-grid'), abrirVisor);
  initFiltro(seccion, cards);

  /* Portadas de categoría: abren el visor en su propia foto */
  seccion.querySelectorAll('[data-visor-foto]').forEach((el) => {
    const indice = GALERIA.findIndex((g) => g.foto === el.dataset.visorFoto);
    el.addEventListener('click', () => abrirVisor(indice));
  });

  if (reducedMotion) return;

  gsap.from(seccion.querySelector('.section-head'), {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: { trigger: seccion, start: 'top 80%', once: true },
  });
  seccion.querySelectorAll('.cortinas-cat').forEach((cat, i) => {
    gsap.from(cat.querySelector('.cortinas-cat-media'), {
      clipPath: 'inset(10% 10% 10% 10% round 24px)',
      duration: 1.2,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: cat, start: 'top 80%', once: true },
    });
    gsap.from(cat.querySelector('.cortinas-cat-info'), {
      opacity: 0,
      y: 30,
      duration: 0.9,
      delay: 0.2 + i * 0.12,
      ease: 'power2.out',
      scrollTrigger: { trigger: cat, start: 'top 80%', once: true },
    });
  });
  gsap.from(cards, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: seccion.querySelector('.cortinas-grid'), start: 'top 85%', once: true },
  });
}
