/* Optimiza las fotos de public/cortinas/ (originales de WhatsApp 1600x900)
   a webp para la web, en public/img/cortinas/:
     - cortina-XX.webp          1600x900, para el visor a pantalla completa
     - cortina-XX-card.webp     720x900 (4:5), recorte vertical para tarjetas
     - cortina-XX-feature.webp  1200x900 (4:3), solo para las fotos de portada
   Uso: node scripts/generar-cortinas.mjs */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'public/cortinas/WhatsApp Image 2026-10-08 at ';
const OUT = 'public/img/cortinas';

/* [archivo original, centro horizontal del producto (0..1), ¿portada?] */
const FOTOS = [
  ['11.10.33.jpeg', 0.5, true], // 01 — perchero con la colección de cortinas
  ['11.10.33 (1).jpeg', 0.52, true], // 02 — pony tail cobrizo puesto
  ['11.10.33 (2).jpeg', 0.49], // 03 — pony tail castaño
  ['11.10.33 (3).jpeg', 0.475], // 04 — pony tail miel
  ['11.10.33 (4).jpeg', 0.475], // 05 — pony tail chocolate
  ['11.10.33 (5).jpeg', 0.5], // 06 — cortina negro azabache
  ['11.10.33 (6).jpeg', 0.5], // 07 — cortina platino
];

mkdirSync(OUT, { recursive: true });

const recorte = (cx, ancho) => Math.round(Math.min(1600 - ancho, Math.max(0, cx * 1600 - ancho / 2)));

for (const [i, [archivo, cx, portada]] of FOTOS.entries()) {
  const n = String(i + 1).padStart(2, '0');
  const src = SRC + archivo;

  await sharp(src).webp({ quality: 84, effort: 6 }).toFile(`${OUT}/cortina-${n}.webp`);

  await sharp(src)
    .extract({ left: recorte(cx, 720), top: 0, width: 720, height: 900 })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.5 })
    .webp({ quality: 84, effort: 6 })
    .toFile(`${OUT}/cortina-${n}-card.webp`);

  if (portada) {
    await sharp(src)
      .extract({ left: recorte(cx, 1200), top: 0, width: 1200, height: 900 })
      .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.5 })
      .webp({ quality: 84, effort: 6 })
      .toFile(`${OUT}/cortina-${n}-feature.webp`);
  }
}
console.log('cortinas OK');
