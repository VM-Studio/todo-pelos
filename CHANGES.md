Mejoras visuales: títulos y subtítulos

- Qué cambié:
  - Aumenté el tamaño y peso de `.section-title`, `.quienes-somos-titulo`, `.servicio-titulo` y `.calidad-titulo` para mejorar legibilidad.
  - Forcé `color: var(--color-marron-oscuro)` en títulos para asegurar contraste frente al texto secundario.
  - Ajusté `.section-subtitulo` en mobile para mayor tamaño y contraste.

- Por qué:
  - El cliente pidió "Los títulos un poco más grandecitos y que sea diferente color al texto de abajo"; estos cambios aumentan la jerarquía visual y la legibilidad en pantallas pequeñas y desktop.

- Cómo probar:
  1. Ejecutar `npm run dev` y abrir la web en un teléfono (o simular con DevTools).
  2. En mobile, verificar se ven más grandes los títulos y que el subtítulo es más legible.

- Archivos cambiados:
  - `src/style.css` (nuevas reglas para títulos y subtítulos)

Si querés, puedo ajustar tonos o tamaños exactos si pasás referencia visual (ej: mockup o valor en px/rem).
