/* app.js
   JavaScript progresivo: mejoras de accesibilidad, búsqueda mock,
   menú móvil y efectos de revelado al hacer scroll.
   No requiere paquetes externos.
*/

(() => {
  'use strict';

  // Helper: query selector
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Elements
  const btnMenu = $('#btnMenu');
  const primaryNav = $('#primaryNav');
  const searchForm = $('#searchForm');
  const searchInput = $('#q');
  const videoGrid = $('#videoGrid');
  const revealables = () => $$('.reveal, .card');

  // Toggle mobile nav
  if (btnMenu) {
    btnMenu.addEventListener('click', (e) => {
      const expanded = btnMenu.getAttribute('aria-expanded') === 'true';
      btnMenu.setAttribute('aria-expanded', String(!expanded));
      // toggle display of primaryNav on small screens
      if (primaryNav) {
        primaryNav.style.display = expanded ? '' : 'block';
      }
    });
  }

  // Simple search handler (mock): filters visible cards by title text
  if (searchForm && searchInput && videoGrid) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim().toLowerCase();
      // simple accessible search feedback: if empty, restore
      const items = Array.from(videoGrid.querySelectorAll('.grid-item'));
      if (!q) {
        items.forEach(it => it.style.display = '');
        // focus back to first item
        const first = videoGrid.querySelector('.grid-item');
        if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
        return;
      }

      let visible = 0;
      items.forEach(it => {
        const titleEl = it.querySelector('.video-title');
        const text = titleEl ? titleEl.textContent.toLowerCase() : '';
        const matched = text.includes(q);
        it.style.display = matched ? '' : 'none';
        if (matched) visible++;
      });

      // Provide basic accessible announcement if nothing found
      if (visible === 0) {
        // create a short ephemeral status node
        const status = document.createElement('div');
        status.setAttribute('role', 'status');
        status.className = 'sr-only';
        status.textContent = `No se encontraron resultados para "${q}".`;
        document.body.appendChild(status);
        setTimeout(() => status.remove(), 2000);
      }
    });
  }

  // IntersectionObserver: reveal animation on scroll (performance-friendly)
  function initRevealOnScroll() {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            ent.target.classList.add('visible');
            io.unobserve(ent.target);
          }
        });
      }, { root: null, threshold: 0.08 });

      revealables().forEach(el => {
        el.classList.add('reveal');
        io.observe(el);
      });
    } else {
      // Fallback: simply make visible
      revealables().forEach(el => el.classList.add('visible'));
    }
  }

  // Keyboard accessibility: focus management for video cards
  function bindCardKeyboard() {
    document.querySelectorAll('.card[tabindex]').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Simulate opening a video: here we just animate and announce
          card.classList.add('active');
          setTimeout(() => card.classList.remove('active'), 350);
          // Announce to screen readers
          const title = card.querySelector('.video-title')?.textContent || 'Vídeo';
          const status = document.createElement('div');
          status.className = 'sr-only';
          status.setAttribute('role', 'status');
          status.textContent = `Abriendo: ${title}`;
          document.body.appendChild(status);
          setTimeout(() => status.remove(), 1500);
        }
      });
    });
  }

  // Smooth minor micro-interaction: subtle pulse on hover for .btn using CSS already.
  // Here we add a small JS-driven 'scroll to top' advantage for logo click
  const siteLogo = document.querySelector('.site-logo');
  if (siteLogo) {
    siteLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // move focus to main for keyboard users
      const main = document.getElementById('main');
      if (main) main.setAttribute('tabindex', '-1'), main.focus({ preventScroll: true });
      setTimeout(() => main.removeAttribute('tabindex'), 1000);
    });
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initRevealOnScroll();
    bindCardKeyboard();

    // Progressive enhancement: lazy load thumbnails (SVG inline so light)
    // If images were external we'd implement IntersectionObserver to set src attribute.
  });

  // Respect reduced motion: make small changes if users prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }

})();