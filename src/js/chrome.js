/* ==========================================================================
   CHROME — Header fijo, menú mobile, contacto, FAB WhatsApp y footer
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DATOS, waLink, whatsappFormateado } from './datos.js';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  ['Servicios', '#servicios'],
  ['Antes y después', '#antes-despues'],
  ['Calidad', '#calidad'],
  ['Contacto', '#contacto'],
];

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Header ---------- */
function buildHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <a class="header-brand" href="#hero">
      <img class="header-logo" src="/navbar.png" alt="${DATOS.nombre} — ${DATOS.tagline}" />
    </a>
    <nav class="header-nav" aria-label="Navegación principal">
      ${NAV_LINKS.map(([t, h]) => `<a class="header-link" href="${h}">${t}</a>`).join('')}
      <a class="header-cta" href="${waLink()}" target="_blank" rel="noopener">Reservar turno</a>
    </nav>
    <button class="header-burger" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span>
    </button>
  `;
  document.body.prepend(header);

  /* Estado sólido al pasar el final del hero */
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom top+=80',
    onEnter: () => header.classList.add('site-header--solid'),
    onLeaveBack: () => header.classList.remove('site-header--solid'),
  });

  return header;
}

/* ---------- Menú mobile ---------- */
function buildMobileMenu(header) {
  const panel = document.createElement('div');
  panel.className = 'menu-mobile';
  panel.innerHTML = `
    <nav class="menu-mobile-nav" aria-label="Menú">
      ${NAV_LINKS.map(([t, h]) => `<a class="menu-mobile-link" href="${h}">${t}</a>`).join('')}
    </nav>
    <a class="menu-mobile-cta" href="${waLink()}" target="_blank" rel="noopener">Reservar turno</a>
  `;
  document.body.appendChild(panel);

  const burger = header.querySelector('.header-burger');
  const links = panel.querySelectorAll('a');
  let open = false;

  gsap.set(panel, { autoAlpha: 0 });

  function toggle(force) {
    open = force !== undefined ? force : !open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';

    if (reducedMotion) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0 });
      return;
    }
    if (open) {
      gsap.to(panel, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(
        [...links],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.1, ease: 'power2.out' }
      );
    } else {
      gsap.to(panel, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
    }
  }

  burger.addEventListener('click', () => toggle());
  links.forEach((l) => l.addEventListener('click', () => toggle(false)));
}

/* ---------- Contacto: volcar datos ---------- */
function fillContacto() {
  const valores = {
    direccion: DATOS.direccion,
    horarios: DATOS.horarios,
    whatsappFmt: whatsappFormateado(),
    instagramArroba: `@${DATOS.instagram}`,
  };
  const hrefs = {
    mapsUrl: DATOS.mapsUrl,
    wa: waLink(),
    instagramUrl: `https://instagram.com/${DATOS.instagram}`,
  };

  document.querySelectorAll('[data-dato]').forEach((el) => {
    el.textContent = valores[el.dataset.dato] ?? '';
  });
  document.querySelectorAll('[data-href]').forEach((el) => {
    el.href = hrefs[el.dataset.href] ?? '#';
  });
  document.querySelectorAll('[data-src-dato]').forEach((el) => {
    el.src = DATOS[el.dataset.srcDato] ?? '';
  });

  if (!reducedMotion) {
    const els = gsap.utils.toArray(
      '#contacto .section-head, #contacto .contacto-dato, #contacto .contacto-cta-col'
    );
    gsap.from(els, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '#contacto', start: 'top 80%', once: true },
    });
  }
}

/* ---------- FAB WhatsApp ---------- */
function buildFab() {
  const fab = document.createElement('a');
  fab.className = 'wa-fab';
  fab.href = waLink();
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.setAttribute('aria-label', 'Reservar por WhatsApp');
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a3 3 0 0 0-1 2.2c0 1.3 1 2.6 1.1 2.8.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z"/>
    </svg>
  `;
  document.body.appendChild(fab);

  if (reducedMotion) {
    fab.classList.add('is-visible');
    return;
  }

  gsap.set(fab, { scale: 0 });
  let shown = false;

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const should = self.progress > 0.3;
      if (should && !shown) {
        shown = true;
        fab.classList.add('is-visible');
        gsap.to(fab, { scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
      } else if (!should && shown) {
        shown = false;
        gsap.to(fab, {
          scale: 0,
          duration: 0.3,
          onComplete: () => fab.classList.remove('is-visible'),
        });
      }
    },
    /* Si el usuario ya pasó el hero (deep link), mostrarlo */
    onLeave() {
      if (!shown) {
        shown = true;
        fab.classList.add('is-visible');
        gsap.to(fab, { scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
      }
    },
  });
}

/* ---------- Footer ---------- */
function buildFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <img class="footer-logo" src="/footer.png" alt="${DATOS.nombre} — ${DATOS.tagline}" />
      </div>
      <div class="footer-datos">
        <p>${DATOS.direccion}</p>
        <p>${DATOS.horarios}</p>
        <p><a href="${waLink()}" target="_blank" rel="noopener">${whatsappFormateado()}</a></p>
        <p><a href="https://instagram.com/${DATOS.instagram}" target="_blank" rel="noopener">@${DATOS.instagram}</a></p>
      </div>
      <nav class="footer-nav" aria-label="Navegación del pie">
        ${NAV_LINKS.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}
      </nav>
    </div>
    <div class="footer-bottom">
      <p>© 2026 ${DATOS.nombre}</p>
      <p><a href="#">Hecho por VM Studio</a></p>
    </div>
  `;
  document.body.appendChild(footer);
}

/* ---------- JSON-LD HairSalon (omite datos placeholder entre corchetes) ---------- */
function esPlaceholder(v) {
  return typeof v !== 'string' || v.includes('[') || v === '#' || v === '';
}

function buildJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: DATOS.nombre,
    description:
      'Pelucas, extensiones y apliques de pelo orgánico y sintético importado de primera calidad.',
  };
  if (!esPlaceholder(DATOS.whatsapp) && DATOS.whatsapp !== '5491112345678') {
    data.telephone = `+${DATOS.whatsapp}`;
  }
  if (!esPlaceholder(DATOS.direccion)) {
    data.address = { '@type': 'PostalAddress', streetAddress: DATOS.direccion };
  }
  if (!esPlaceholder(DATOS.horarios)) {
    data.openingHours = DATOS.horarios;
  }
  if (!esPlaceholder(DATOS.instagram)) {
    data.sameAs = [`https://instagram.com/${DATOS.instagram}`];
  }
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function initChrome() {
  const header = buildHeader();
  buildMobileMenu(header);
  fillContacto();
  buildFab();
  buildFooter();
  buildJsonLd();
  ScrollTrigger.refresh();
}
