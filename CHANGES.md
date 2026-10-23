Hero en alta calidad, colección de pelucas, sección El salón y pulido general

- Hero (image sequence):
  - Frames re-escalados con Lanczos3 + enfoque suave (`scripts/mejorar-hero.mjs`):
    desktop 1920x1080 (6.4MB), mobile 1080x1920 (10MB). El primer frame va a q94.
  - El canvas usa la densidad real de la pantalla (hasta 3x) y suavizado "high";
    antes se limitaba a 2x y el navegador estiraba la imagen en celulares 3x.
  - Mobile: la imagen ocupa toda la pantalla (modo cover) a opacidad completa,
    sin franjas arriba/abajo. El texto pasó a la parte de abajo para no tapar la cara.
  - El primer frame se precarga desde el `<head>`, se decodifica antes de dibujarse
    y el canvas se redibuja ante cualquier cambio real de tamaño (ResizeObserver).
- Nueva sección "Pelucas" (`src/js/pelucas.js`): foto destacada del showroom,
  tarjetas por modelo (en desktop cambian a la segunda vista al pasar el mouse),
  tarjeta "a medida", carrusel con snap en mobile y visor a pantalla completa
  (teclado, swipe). Cada tarjeta abre WhatsApp con el modelo ya escrito.
  Fotos optimizadas con `scripts/generar-pelucas.mjs` en `public/img/pelucas/`.
- Nueva sección "Cortinas & pony tails" (`src/js/cortinas.js`), entre Pelucas y
  Antes/Después: dos tarjetas de categoría (perchero de cortinas y pony tail puesto),
  grilla de tonos con filtro Todos / Cortinas / Pony tails, muestra de color por tono
  y "Consultar" por WhatsApp con el producto ya escrito. En mobile, carrusel con snap.
  Fotos optimizadas con `scripts/generar-cortinas.mjs` en `public/img/cortinas/`.
- El visor a pantalla completa pasó a `src/js/visor.js` y lo comparten Pelucas y Cortinas.
- Marquesina más chica (mismo estilo).
- Nueva sección "El salón": la foto del local queda fija de fondo y la sección
  pasa por encima (funciona también en iOS), con velo cálido y tarjeta translúcida.
- Pulido: marquesina de servicios, tarjetas de servicios con elevación, flechas
  animadas en botones, link activo en el header, entrada animada del título del hero.
- Fixes: el `<em>` del título de "Calidad" era marrón sobre marrón (invisible);
  la X del menú mobile quedaba detrás del panel.
- Nav: se agregan "El salón", "Pelucas" y "Cortinas"; debajo de 1200px pasa al menú hamburguesa.

Cómo probar: `npm run dev` y abrir http://localhost:3000 (también desde el
celular en la misma red, con la IP que muestra Vite).
