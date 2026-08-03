/* ==========================================================================
   DATOS DE LA MARCA — editá acá y se actualiza toda la página
   ========================================================================== */

export const DATOS = {
  nombre: 'Todo Pelos',
  tagline: 'Hair & Beauty Salon',
  whatsapp: '5491112345678', // [NUMERO CON CODIGO DE PAIS]
  direccion: 'Avenida Ingeniero Eduardo Madero, Del Viso',
  horarios: 'Lunes a viernes de 9 a 18hs',
  instagram: 'todo.pelos', // sin @
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Avenida Ingeniero Eduardo Madero, Del Viso, Buenos Aires, Argentina'),
  mapsEmbedUrl:
    'https://www.google.com/maps?q=' +
    encodeURIComponent('Avenida Ingeniero Eduardo Madero, Del Viso, Buenos Aires, Argentina') +
    '&output=embed',
};

export const MENSAJE_WHATSAPP = 'Hola! Quiero reservar un turno';

export const waLink = (mensaje = MENSAJE_WHATSAPP) =>
  `https://wa.me/${DATOS.whatsapp}?text=${encodeURIComponent(mensaje)}`;

/* Número formateado para mostrar: +54 9 11 1234-5678 (aproximado) */
export const whatsappFormateado = () => {
  const n = DATOS.whatsapp;
  if (!/^\d{10,15}$/.test(n)) return n;
  return `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 5)} ${n.slice(5, 9)}-${n.slice(9)}`;
};
