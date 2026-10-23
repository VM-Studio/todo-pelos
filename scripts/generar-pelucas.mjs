/* Optimiza las fotos de public/pelucas/ (originales de WhatsApp 1600x900)
   y la foto del salón (public/fondo.png) a webp para la web.
     - peluca-XX.webp       1600x900, para el visor a pantalla completa
     - peluca-XX-card.webp  720x900 (4:5), recorte vertical centrado en
                            la peluca, para las tarjetas
     - salon.webp           1920 de ancho, para el fondo fijo
   Uso: node scripts/generar-pelucas.mjs */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'public/pelucas/WhatsApp Image 2026-10-08 at ';
const OUT = 'public/img/pelucas';

/* [archivo original, centro horizontal de la peluca (0..1)] */
const FOTOS = [
  ['11.09.20 (1).jpeg', 0.5], // 01 — colección completa
  ['11.09.20 (2).jpeg', 0.5], // 02 — midi cobrizo, perfil
  ['11.09.21.jpeg', 0.505], // 03 — midi cobrizo, frente
  ['11.09.20.jpeg', 0.51], // 04 — rubio ombré, perfil
  ['11.09.21 (2).jpeg', 0.51], // 05 — rubio ombré, 3/4
  ['11.09.21 (1).jpeg', 0.48], // 06 — chocolate largo con flequillo
];

mkdirSync(OUT, { recursive: true });

for (const [i, [archivo, cx]] of FOTOS.entries()) {
  const n = String(i + 1).padStart(2, '0');
  const src = SRC + archivo;

  await sharp(src).webp({ quality: 84, effort: 6 }).toFile(`${OUT}/peluca-${n}.webp`);

  const left = Math.round(Math.min(1600 - 720, Math.max(0, cx * 1600 - 360)));
  await sharp(src)
    .extract({ left, top: 0, width: 720, height: 900 })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.5 })
    .webp({ quality: 84, effort: 6 })
    .toFile(`${OUT}/peluca-${n}-card.webp`);
}
console.log('pelucas OK');

await sharp('public/fondo.png')
  .flatten({ background: '#e9d9c3' })
  .resize(1920, null, { kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8, m1: 0.5, m2: 2 })
  .webp({ quality: 82, effort: 6 })
  .toFile('public/img/salon.webp');
console.log('salon OK');
