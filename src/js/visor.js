/* ==========================================================================
   VISOR — galería a pantalla completa reutilizable (pelucas, cortinas...)
   createVisor(items) crea su propio <dialog> y devuelve abrir(indice).
   Cada item: { full, card?, caption }. En pantallas verticales se usa la
   versión "card" (recorte vertical) si existe, que se ve más grande.
   ========================================================================== */

import { gsap } from 'gsap';

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const esVertical = () => window.innerHeight > window.innerWidth;
const rutaDe = (item) => (esVertical() && item.card ? item.card : item.full);

export function createVisor(items, etiqueta = 'Galería') {
  const dialog = document.createElement('dialog');
  dialog.className = 'visor';
  dialog.setAttribute('aria-label', etiqueta);
  dialog.innerHTML = `
    <div class="visor-cuerpo">
      <img class="visor-img" src="" alt="" />
      <p class="visor-caption"></p>
    </div>
    <p class="visor-contador"></p>
    <button class="visor-btn visor-cerrar" type="button" aria-label="Cerrar galería">&times;</button>
    <button class="visor-btn visor-prev" type="button" aria-label="Foto anterior">&#8592;</button>
    <button class="visor-btn visor-next" type="button" aria-label="Foto siguiente">&#8594;</button>
  `;
  document.body.appendChild(dialog);

  if (typeof dialog.showModal !== 'function') return () => {};

  const img = dialog.querySelector('.visor-img');
  const caption = dialog.querySelector('.visor-caption');
  const contador = dialog.querySelector('.visor-contador');
  let actual = 0;

  function mostrar(i, dir = 0) {
    actual = (i + items.length) % items.length;
    const item = items[actual];
    const aplicar = () => {
      img.src = rutaDe(item);
      img.alt = item.caption;
      caption.textContent = item.caption;
      contador.textContent = `${actual + 1} / ${items.length}`;
    };
    if (reducedMotion || !dir) {
      aplicar();
      return;
    }
    gsap.to(img, {
      opacity: 0,
      x: -24 * dir,
      duration: 0.18,
      ease: 'power1.in',
      onComplete: () => {
        aplicar();
        gsap.fromTo(
          img,
          { opacity: 0, x: 24 * dir },
          { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        );
      },
    });
  }

  function abrir(i) {
    mostrar(i);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    if (!reducedMotion) {
      gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
    /* precargar el resto para pasar sin esperas */
    items.forEach((it) => {
      new Image().src = rutaDe(it);
    });
  }

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  dialog.querySelector('.visor-cerrar').addEventListener('click', () => dialog.close());
  dialog.querySelector('.visor-prev').addEventListener('click', () => mostrar(actual - 1, -1));
  dialog.querySelector('.visor-next').addEventListener('click', () => mostrar(actual + 1, 1));

  /* Click en el fondo oscuro (fuera de la foto) cierra */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('visor-cuerpo')) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') mostrar(actual + 1, 1);
    if (e.key === 'ArrowLeft') mostrar(actual - 1, -1);
  });

  /* Swipe en touch */
  let x0 = null;
  dialog.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') x0 = e.clientX;
  });
  dialog.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  return abrir;
}
