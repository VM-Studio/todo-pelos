/* ==========================================================================
   DATOS DE LA MARCA — editá acá y se actualiza toda la página
   ========================================================================== */

export const DATOS = {
  nombre: 'Todo Pelos',
  tagline: 'Hair & Beauty Salon',
  whatsapp: '5491112345678', // [NUMERO CON CODIGO DE PAIS]
  direccion: '[DIRECCION O ZONA DEL LOCAL]',
  horarios: '[DIAS Y HORARIOS, ej: Martes a sábados de 10 a 19]',
  instagram: '[USUARIO]', // sin @
  mapsUrl: '#', // [LINK DE GOOGLE MAPS AL LOCAL]
};

export const MENSAJE_WHATSAPP = 'Hola! Quiero reservar un turno';

export const waLink = () =>
  `https://wa.me/${DATOS.whatsapp}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

/* Número formateado para mostrar: +54 9 11 1234-5678 (aproximado) */
export const whatsappFormateado = () => {
  const n = DATOS.whatsapp;
  if (!/^\d{10,15}$/.test(n)) return n;
  return `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 5)} ${n.slice(5, 9)}-${n.slice(9)}`;
};
