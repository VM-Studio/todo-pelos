/* Genera assets de marca: og-cover.jpg (1200x630) y apple-touch-icon.png (180)
   Uso: node scripts/generar-assets.mjs */
import sharp from 'sharp';

// --- OG cover: recorte 1200x630 centrado en la mujer (derecha del cuadro) ---
const SRC = 'public/img/frame-B-despues.png';
const meta = await sharp(SRC).metadata(); // 1376x768

// escala para cubrir 1200x630
const scale = Math.max(1200 / meta.width, 630 / meta.height);
const w = Math.round(meta.width * scale);
const h = Math.round(meta.height * scale);
// punto focal ~60% del ancho
const left = Math.min(w - 1200, Math.max(0, Math.round(w * 0.6 - 600)));
const top = Math.round((h - 630) / 2);

await sharp(SRC)
  .resize(w, h)
  .extract({ left, top, width: 1200, height: 630 })
  .jpeg({ quality: 85 })
  .toFile('public/img/og-cover.jpg');

console.log('og-cover.jpg OK');

// --- Apple touch icon 180x180 desde el diseño del favicon ---
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="#4A3526"/>
  <text x="90" y="90" text-anchor="middle" dominant-baseline="central"
    font-family="Georgia, 'Times New Roman', serif" font-size="78"
    fill="#E9D9C3">TP</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/apple-touch-icon.png');
console.log('apple-touch-icon.png OK');
