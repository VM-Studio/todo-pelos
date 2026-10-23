/* Re-escala los fotogramas del hero a mayor resolución con Lanczos3 +
   enfoque suave, para que en pantallas retina / 2x-3x el canvas no
   tenga que estirar la imagen (que era lo que la volvía borrosa).
   Lee los originales de git (no se pierde nada si se corre 2 veces).
   Uso: node scripts/mejorar-hero.mjs [dirSalida]  */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] ?? 'public';
const REV = 'b245483'; // commit con los frames originales

const SETS = [
  { dir: 'seq', width: 1920, height: 1080, quality: 86, sharpen: { sigma: 0.8, m1: 0.6, m2: 2.2 } },
  /* Mobile: los originales traen ruido de compresión; un enfoque más
     liviano y q72 mantiene la secuencia en ~10MB sin que se note */
  { dir: 'seq-mobile', width: 1080, height: 1920, quality: 72, sharpen: { sigma: 0.6, m1: 0.3, m2: 1.2 } },
];

for (const set of SETS) {
  mkdirSync(`${OUT}/${set.dir}`, { recursive: true });
  for (let i = 1; i <= 120; i++) {
    const name = `frame_${String(i).padStart(3, '0')}.webp`;
    const src = execFileSync('git', ['show', `${REV}:public/${set.dir}/${name}`], {
      maxBuffer: 20 * 1024 * 1024,
    });
    await sharp(src)
      .resize(set.width, set.height, { kernel: 'lanczos3' })
      .sharpen(set.sharpen)
      /* El primer frame es lo primero que se ve: máxima calidad */
      .webp({ quality: i === 1 ? 94 : set.quality, effort: 6, smartSubsample: true })
      .toFile(`${OUT}/${set.dir}/${name}`);
  }
  console.log(`${set.dir} OK`);
}
