/* ============================================================
   RAINE LI — main.js
   Navigation interactions modelled on Pace Gallery patterns
   Requires: GSAP 3 (loaded via CDN in index.html)
   ============================================================ */

(function () {
  'use strict';

  /* ── Selectors ── */
  const body       = document.body;
  const nav        = document.querySelector('.js-nav');
  const burger     = document.querySelector('.js-burger');
  const navMenu    = document.querySelector('.js-nav-menu');
  const navClose   = document.querySelector('.js-nav-close');
  const navScrim   = document.querySelector('.js-nav-scrim');
  const navItems   = Array.from(document.querySelectorAll('.js-nav-item'));
  const navFooter  = document.querySelector('.js-nav-footer');
  const navList    = document.querySelector('.js-nav-list');

  /* ── State ── */
  let menuOpen = false;

  /* ──────────────────────────────────────────────
     MENU OPEN
  ────────────────────────────────────────────── */
  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;

    body.classList.add('nav-open');
    navMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');

    /* Stagger nav items in — Pace pattern */
    gsap.fromTo(
      navItems,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.18,   /* let the panel slide in first */
      }
    );

    /* Close button fades in */
    gsap.fromTo(
      navClose,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, delay: 0.25, ease: 'power2.out' }
    );

    /* Footer fades in last */
    gsap.fromTo(
      navFooter,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, delay: 0.45, ease: 'power2.out' }
    );
  }

  /* ──────────────────────────────────────────────
     MENU CLOSE
  ────────────────────────────────────────────── */
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;

    /* Fade items out quickly */
    gsap.to([navItems, navFooter, navClose], {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
    });

    /* Remove body class after panel slides away */
    setTimeout(() => {
      body.classList.remove('nav-open');
      navMenu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      /* Reset y so next open starts clean */
      gsap.set(navItems, { y: 22 });
    }, 300);
  }

  /* ──────────────────────────────────────────────
     SIBLING DIMMING — Pace pattern
     Hovering one link dims all others to 0.25
  ────────────────────────────────────────────── */
  navItems.forEach((item) => {
    const link = item.querySelector('a');
    if (!link) return;

    link.addEventListener('mouseenter', () => {
      navList && navList.classList.add('has-hover');
      navItems.forEach((other) => {
        if (other !== item) {
          gsap.to(other.querySelector('a'), {
            opacity: 0.25,
            duration: 0.15,
            ease: 'power1.out',
          });
        }
      });
    });

    link.addEventListener('mouseleave', () => {
      navList && navList.classList.remove('has-hover');
      navItems.forEach((other) => {
        gsap.to(other.querySelector('a'), {
          opacity: 1,
          duration: 0.15,
          ease: 'power1.out',
        });
      });
    });

    /* Close menu when a nav link is clicked */
    link.addEventListener('click', closeMenu);
  });

  /* ──────────────────────────────────────────────
     EVENTS
  ────────────────────────────────────────────── */
  burger.addEventListener('click', openMenu);
  navClose.addEventListener('click', closeMenu);
  navScrim.addEventListener('click', closeMenu);   /* tap outside to close */

  /* Keyboard: Escape closes menu */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  /* ──────────────────────────────────────────────
     NAV SCROLL — add .scrolled class for shadow
  ────────────────────────────────────────────── */
  window.addEventListener(
    'scroll',
    () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    },
    { passive: true }
  );

  /* ──────────────────────────────────────────────
     INITIAL GSAP STATE — items start invisible
     (CSS also sets opacity:0, this ensures GSAP
      agrees on the starting value)
  ────────────────────────────────────────────── */
  gsap.set(navItems, { opacity: 0, y: 22 });
  gsap.set(navClose,  { opacity: 0 });
  gsap.set(navFooter, { opacity: 0 });

})();
