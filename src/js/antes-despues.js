/* ==========================================================================
   ANTES Y DESPUÉS — fotos del salón, cada una abre el visor a pantalla completa
   ========================================================================== */

import { createVisor } from './visor.js';

const FOTOS = [
  { full: '/img/antes-despues/extensiones.webp', caption: 'Extensiones' },
  { full: '/img/antes-despues/volumen.webp', caption: 'Se agregó volumen' },
  { full: '/img/antes-despues/alisado.webp', caption: 'Alisado' },
];

export function initAntesDespues() {
  const seccion = document.querySelector('#antes-despues');
  if (!seccion) return;

  const botones = seccion.querySelectorAll('[data-ad-foto]');
  if (!botones.length) return;

  const abrir = createVisor(FOTOS, 'Antes y después');
  botones.forEach((btn) => {
    btn.addEventListener('click', () => abrir(Number(btn.dataset.adFoto)));
  });
}
