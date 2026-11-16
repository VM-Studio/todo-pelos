/* ==========================================================================
   INSTAGRAM — reels del salón
   Los videos se reproducen en silencio y en loop mientras están en pantalla.
   Al tocar uno se le activa el sonido solo a ese (los demás quedan mudos);
   tocarlo de nuevo lo vuelve a silenciar.
   ========================================================================== */

export function initInstagram() {
  const seccion = document.querySelector('#instagram');
  if (!seccion) return;

  const reels = [...seccion.querySelectorAll('.ig-reel-media')].map((btn) => ({
    btn,
    video: btn.querySelector('video'),
    titulo: btn.closest('.ig-reel')?.querySelector('.ig-reel-titulo')?.textContent ?? '',
  }));
  if (!reels.length) return;

  const reproducir = (video) => {
    if (video.preload === 'none') video.preload = 'auto';
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  function marcar(reel, conSonido) {
    reel.video.muted = !conSonido;
    reel.btn.setAttribute('aria-pressed', String(conSonido));
    reel.btn.setAttribute(
      'aria-label',
      `${conSonido ? 'Silenciar' : 'Activar sonido'}: ${reel.titulo}`
    );
    reel.btn.classList.toggle('is-sonando', conSonido);
  }

  reels.forEach((reel) => {
    reel.btn.addEventListener('click', () => {
      const activar = reel.video.muted;
      reels.forEach((otro) => {
        if (otro !== reel) marcar(otro, false);
      });
      marcar(reel, activar);
      if (activar) {
        reel.btn.classList.add('is-usado');
        reproducir(reel.video);
      }
    });
  });

  /* Solo se reproducen los que están a la vista (ahorra datos y batería) */
  if (!('IntersectionObserver' in window)) {
    reels.forEach((r) => reproducir(r.video));
    return;
  }

  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        const reel = reels.find((r) => r.video === e.target);
        if (!reel) return;
        if (e.isIntersecting) {
          reproducir(reel.video);
        } else {
          reel.video.pause();
          /* Si sale de pantalla con sonido, se silencia */
          if (!reel.video.muted) marcar(reel, false);
        }
      });
    },
    { threshold: 0.35 }
  );
  reels.forEach((r) => io.observe(r.video));
}
