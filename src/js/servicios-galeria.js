/* ==========================================================================
   GALERÍA DE SERVICIOS — selector de servicio + par antes/después
   Cada servicio tiene su propio par de imágenes en /img/galeria/
   Convención de nombres: antes-{id}.png y despues-{id}.png
   ========================================================================== */

import { gsap } from 'gsap';

export const SERVICIOS = [
  {
    id: 'extensiones',
    nombre: 'Extensiones',
    desc: 'Largo y volumen real al instante con pelo importado de primera calidad.',
  },
  {
    id: 'mechas',
    nombre: 'Mechas',
    desc: 'Reflejos definidos mechón por mechón, del más sutil al más marcado.',
  },
  {
    id: 'balayage',
    nombre: 'Balayage',
    desc: 'Degradé pintado a mano, natural y sin raíz marcada, como aclarado por el sol.',
  },
  {
    id: 'iluminacion',
    nombre: 'Iluminación',
    desc: 'Puntos de luz estratégicos que dan brillo y dimensión sin cambiar tu color de base.',
  },
  {
    id: 'apliques',
    nombre: 'Apliques',
    desc: 'Volumen donde lo necesites, fácil de poner y sacar, imposible de notar.',
  },
  {
    id: 'pelucas',
    nombre: 'Pelucas',
    desc: 'Un cambio total, indetectable y liviano, con asesoramiento personalizado.',
  },
];

const rutaImg = (tipo, id) => `/img/galeria/${tipo}-${id}.png`;

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* Caché de pares: id -> Promise<{ ok: boolean }> */
const cache = new Map();

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      const decodificar = im.decode ? im.decode().catch(() => {}) : Promise.resolve();
      decodificar.then(() => resolve(im));
    };
    im.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    im.src = src;
  });
}

function cargarPar(servicio) {
  if (!cache.has(servicio.id)) {
    const promesa = Promise.all([
      cargarImagen(rutaImg('antes', servicio.id)),
      cargarImagen(rutaImg('despues', servicio.id)),
    ])
      .then(() => ({ ok: true }))
      .catch(() => ({ ok: false }));
    cache.set(servicio.id, promesa);
  }
  return cache.get(servicio.id);
}

export function initGaleria(comparador) {
  const seccion = document.querySelector('#antes-despues');
  if (!seccion) return;

  const tablist = seccion.querySelector('.galeria-tabs');
  const descEl = seccion.querySelector('.galeria-desc');
  const frame = seccion.querySelector('.comparador-frame');
  const imgDespues = frame?.querySelector('.comparador-img--despues');
  const imgAntes = frame?.querySelector('.comparador-img--antes');
  const placeholder = frame?.querySelector('.comparador-placeholder');
  const phNombre = placeholder?.querySelector('.comparador-placeholder-nombre');

  if (!tablist || !descEl || !frame || !imgDespues || !imgAntes || !placeholder) {
    return;
  }

  /* ---------- Construir las pestañas ---------- */
  const tabs = SERVICIOS.map((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'galeria-tab';
    btn.id = `galeria-tab-${s.id}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'galeria-panel');
    btn.setAttribute('aria-selected', 'false');
    btn.tabIndex = -1;
    btn.textContent = s.nombre;
    btn.addEventListener('click', () => seleccionar(s.id));
    tablist.appendChild(btn);
    return btn;
  });

  /* Navegación por teclado entre pestañas (flechas) */
  tablist.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const activo = SERVICIOS.findIndex((s) => s.id === idActivo);
    const paso = e.key === 'ArrowRight' ? 1 : -1;
    const siguiente =
      (activo + paso + SERVICIOS.length) % SERVICIOS.length;
    seleccionar(SERVICIOS[siguiente].id);
    tabs[siguiente].focus();
  });

  /* ---------- Estado ---------- */
  let idActivo = null;
  let token = 0; // evita condiciones de carrera si tocan rápido varias pestañas

  function marcarTabs(id) {
    SERVICIOS.forEach((s, i) => {
      const activa = s.id === id;
      tabs[i].setAttribute('aria-selected', String(activa));
      tabs[i].tabIndex = activa ? 0 : -1;
      tabs[i].classList.toggle('is-activa', activa);
    });
    frame.setAttribute('aria-labelledby', `galeria-tab-${id}`);
  }

  function actualizarDescripcion(texto) {
    if (reducedMotion) {
      descEl.textContent = texto;
      return;
    }
    gsap.to(descEl, {
      opacity: 0,
      duration: 0.12,
      onComplete: () => {
        descEl.textContent = texto;
        gsap.to(descEl, { opacity: 1, duration: 0.2 });
      },
    });
  }

  function mostrarPlaceholder(nombre) {
    phNombre.textContent = nombre;
    placeholder.hidden = false;
    frame.classList.add('is-placeholder');
  }

  function ocultarPlaceholder() {
    placeholder.hidden = true;
    frame.classList.remove('is-placeholder');
  }

  function aplicarImagenes(servicio) {
    imgAntes.src = rutaImg('antes', servicio.id);
    imgAntes.alt = `Antes de ${servicio.nombre} en Todo Pelos`;
    imgDespues.src = rutaImg('despues', servicio.id);
    imgDespues.alt = `Resultado de ${servicio.nombre} en Todo Pelos`;
  }

  async function seleccionar(id, opciones = {}) {
    if (id === idActivo) return;
    const servicio = SERVICIOS.find((s) => s.id === id);
    if (!servicio) return;

    idActivo = id;
    const miToken = ++token;

    marcarTabs(id);
    actualizarDescripcion(servicio.desc);

    /* Shimmer si el par todavía no está en caché resuelta */
    frame.classList.add('is-cargando');

    const resultado = await cargarPar(servicio);
    if (miToken !== token) return; // ya eligieron otra pestaña

    frame.classList.remove('is-cargando');

    if (!resultado.ok) {
      mostrarPlaceholder(servicio.nombre);
      comparador?.reset?.();
      return;
    }

    const swap = () => {
      ocultarPlaceholder();
      aplicarImagenes(servicio);
      comparador?.reset?.();
    };

    if (reducedMotion || opciones.inicial) {
      swap();
      return;
    }

    /* Fade corto del contenedor para un cambio sin parpadeos */
    gsap.to(frame, {
      opacity: 0,
      duration: 0.25,
      ease: 'power1.in',
      onComplete: () => {
        swap();
        gsap.to(frame, { opacity: 1, duration: 0.25, ease: 'power1.out' });
      },
    });
  }

  /* ---------- Arranque ---------- */
  seleccionar(SERVICIOS[0].id, { inicial: true });

  /* Precarga del resto en segundo plano, después del primer paint */
  const precargarResto = () => {
    SERVICIOS.forEach((s) => cargarPar(s));
  };
  if (document.readyState === 'complete') {
    (window.requestIdleCallback || setTimeout)(precargarResto, 1200);
  } else {
    window.addEventListener('load', () => {
      (window.requestIdleCallback || setTimeout)(precargarResto, 1200);
    });
  }
}