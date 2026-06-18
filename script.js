/**
 * ============================================================
 *  Prime Estate Realty — Premium Interactive Script
 * ============================================================
 *  Vanilla JS · ES6+ · Zero Dependencies
 *  Features: scroll effects, parallax, counters, typewriter,
 *            toast notifications, back-to-top, loading overlay
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------
   *  0. UTILITIES
   * ------------------------------------------------------ */

  /**
   * Debounce — limits how often `fn` fires.
   * @param {Function} fn       callback
   * @param {number}   delay    milliseconds
   * @returns {Function}
   */
  const debounce = (fn, delay = 15) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * Throttle via requestAnimationFrame — ideal for scroll handlers.
   * @param {Function} fn  callback
   * @returns {Function}
   */
  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn(...args);
          ticking = false;
        });
      }
    };
  };

  /**
   * Ease-out quad for smooth counter animation.
   * @param {number} t  progress 0 → 1
   * @returns {number}
   */
  const easeOutQuad = (t) => t * (2 - t);

  /* --------------------------------------------------------
   *  1. LOADING OVERLAY
   * ------------------------------------------------------ */
  (() => {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b0b0f',
      transition: 'opacity 0.6s ease, visibility 0.6s ease',
    });

    // Spinner
    const spinner = document.createElement('div');
    Object.assign(spinner.style, {
      width: '48px',
      height: '48px',
      border: '3px solid rgba(212,175,55,0.2)',
      borderTopColor: '#d4af37',
      borderRadius: '50%',
      animation: 'lo-spin 0.8s linear infinite',
    });

    // Inject keyframes once
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes lo-spin { to { transform: rotate(360deg); } }
      @keyframes toast-in  { from { transform: translateX(120%); opacity: 0; }
                              to   { transform: translateX(0);    opacity: 1; } }
      @keyframes toast-out { from { transform: translateX(0);    opacity: 1; }
                              to   { transform: translateX(120%); opacity: 0; } }
    `;
    document.head.appendChild(styleSheet);

    overlay.appendChild(spinner);
    document.body.prepend(overlay);

    // Fade out after a short intentional delay so the animation is visible
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      setTimeout(() => overlay.remove(), 600);
    }, 800);
  })();

  /* --------------------------------------------------------
   *  2. NAVBAR SCROLL EFFECT
   * ------------------------------------------------------ */
  const navbar = document.querySelector('.navbar');

  const handleNavbarScroll = () => {
    if (!navbar) return;
    const scrolled = window.scrollY > 100;
    navbar.classList.toggle('scrolled', scrolled);
  };

  /* --------------------------------------------------------
   *  3. MOBILE NAVIGATION TOGGLE
   * ------------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('active')
      );
    });

    // Close menu when any nav link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --------------------------------------------------------
   *  4. SMOOTH SCROLL  (offset for fixed navbar)
   * ------------------------------------------------------ */
  const NAVBAR_OFFSET = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#' || id === '#!') return;        // skip placeholder hrefs

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --------------------------------------------------------
   *  5. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   * ------------------------------------------------------ */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length) {
    const fadeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeEls.forEach((el) => fadeObserver.observe(el));
  }

  /* --------------------------------------------------------
   *  6. STAT COUNTER ANIMATION
   * ------------------------------------------------------ */
  const statsSection = document.querySelector('.about-stats');
  let statsAnimated = false;

  /**
   * Animate a single counter element from 0 → data-target.
   * @param {HTMLElement} el        element with data-target
   * @param {number}      duration  ms
   */
  const animateCounter = (el, duration = 2000) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOutQuad(progress) * target);

      el.textContent = value.toLocaleString() + '+';

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + '+';
      }
    };

    requestAnimationFrame(tick);
  };

  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            document.querySelectorAll('.stat-number').forEach((el) => {
              animateCounter(el);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    statsObserver.observe(statsSection);
  }

  /* --------------------------------------------------------
   *  7. ACTIVE NAV LINK HIGHLIGHTING
   * ------------------------------------------------------ */
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    if (!sections.length || !navAnchors.length) return;

    const scrollPos = window.scrollY + NAVBAR_OFFSET + 60; // small extra buffer

    let currentId = '';
    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  };

  /* --------------------------------------------------------
   *  8. PROPERTY CARD HOVER EFFECTS (JS enhancements)
   * ------------------------------------------------------ */
  document.querySelectorAll('.property-card').forEach((card) => {
    // 3-D tilt on hover — subtle, premium feel
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 → +0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform =
        `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => (card.style.transition = ''), 400);
    });
  });

  /* --------------------------------------------------------
   *  9. CONTACT FORM — TOAST NOTIFICATION
   * ------------------------------------------------------ */

  /**
   * Show a toast notification that slides in from the top-right,
   * stays for `duration` ms, then fades out.
   * @param {string} message
   * @param {string} type      'success' | 'error'
   * @param {number} duration  ms
   */
  const showToast = (message, type = 'success', duration = 3000) => {
    // Container (created once, reused)
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? '#d4af37' : '#e74c3c';
    Object.assign(toast.style, {
      background: bg,
      color: '#fff',
      padding: '14px 28px',
      borderRadius: '8px',
      fontFamily: 'inherit',
      fontSize: '15px',
      fontWeight: '600',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      pointerEvents: 'auto',
      animation: 'toast-in 0.4s ease forwards',
      cursor: 'pointer',
    });
    toast.textContent = message;

    // Dismiss on click
    toast.addEventListener('click', () => dismissToast(toast));

    container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => dismissToast(toast), duration);
  };

  const dismissToast = (toast) => {
    if (!toast.parentNode) return; // already removed
    toast.style.animation = 'toast-out 0.4s ease forwards';
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const contactForm = document.querySelector('.contact-form, #contact-form, form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation — ensure at least one field has content
      const inputs = contactForm.querySelectorAll('input, textarea, select');
      let hasContent = false;
      inputs.forEach((input) => {
        if (input.value.trim()) hasContent = true;
      });

      if (!hasContent) {
        showToast('Please fill in at least one field.', 'error');
        return;
      }

      showToast('Thank you! Your message has been sent successfully. ✓');
      contactForm.reset();
    });
  }

  /* --------------------------------------------------------
   *  10. TESTIMONIAL AUTO-ROTATE
   * ------------------------------------------------------ */
  (() => {
    const cards = document.querySelectorAll(
      '.testimonial-card, .testimonial-item'
    );
    if (cards.length < 2) return;

    let activeIdx = 0;
    cards[activeIdx]?.classList.add('active');

    setInterval(() => {
      cards[activeIdx]?.classList.remove('active');
      activeIdx = (activeIdx + 1) % cards.length;
      cards[activeIdx]?.classList.add('active');
    }, 5000);
  })();

  /* --------------------------------------------------------
   *  11. WHATSAPP FLOAT BUTTON
   * ------------------------------------------------------ */
  const waBtn = document.querySelector('.whatsapp-float');
  if (waBtn) {
    waBtn.href =
      "https://wa.me/1234567890?text=Hi%2C%20I'm%20interested%20in%20your%20properties";
    waBtn.target = '_blank';
    waBtn.rel    = 'noopener noreferrer';
  }

  /* --------------------------------------------------------
   *  12. PARALLAX EFFECT ON HERO
   * ------------------------------------------------------ */
  const hero = document.querySelector('.hero, .hero-section');

  const handleParallax = () => {
    if (!hero) return;
    const scrollY = window.scrollY;
    // Only apply while hero is in view for performance
    if (scrollY < window.innerHeight * 1.5) {
      hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    }
  };

  /* --------------------------------------------------------
   *  13. BACK TO TOP BUTTON (dynamically created)
   * ------------------------------------------------------ */
  const bttBtn = document.createElement('button');
  bttBtn.className = 'back-to-top';
  bttBtn.setAttribute('aria-label', 'Back to top');
  bttBtn.innerHTML = '&#8679;'; // ⇧ upward arrow
  Object.assign(bttBtn.style, {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #d4af37, #b8962e)',
    color: '#fff',
    fontSize: '22px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity 0.4s ease, visibility 0.4s ease, transform 0.3s ease',
    zIndex: '9998',
  });

  bttBtn.addEventListener('mouseenter', () => {
    bttBtn.style.transform = 'scale(1.1)';
  });
  bttBtn.addEventListener('mouseleave', () => {
    bttBtn.style.transform = 'scale(1)';
  });

  bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.appendChild(bttBtn);

  const handleBackToTop = () => {
    const show = window.scrollY > 500;
    bttBtn.style.opacity    = show ? '1' : '0';
    bttBtn.style.visibility = show ? 'visible' : 'hidden';
  };

  /* --------------------------------------------------------
   *  14. TYPEWRITER EFFECT ON HERO SUBTITLE
   * ------------------------------------------------------ */
  (() => {
    const subtitle = document.querySelector(
      '.hero-subtitle, .hero p, .hero .subtitle'
    );
    if (!subtitle) return;

    const fullText = subtitle.textContent.trim();
    subtitle.textContent = '';
    subtitle.style.borderRight = '2px solid #d4af37'; // blinking cursor
    subtitle.style.display = 'inline-block';

    let i = 0;
    const speed = 45; // ms per character

    const type = () => {
      if (i < fullText.length) {
        subtitle.textContent += fullText[i];
        i++;
        setTimeout(type, speed);
      } else {
        // Remove cursor after a short pause
        setTimeout(() => {
          subtitle.style.borderRight = 'none';
        }, 1500);
      }
    };

    // Start after loading overlay fades
    setTimeout(type, 1000);
  })();

  /* --------------------------------------------------------
   *  COMBINED SCROLL HANDLER (single listener, RAF-throttled)
   * ------------------------------------------------------ */
  const onScroll = rafThrottle(() => {
    handleNavbarScroll();
    handleParallax();
    handleBackToTop();
    highlightNav();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  // Fire once on load to set initial states
  onScroll();

  /* --------------------------------------------------------
   *  RESIZE HANDLER (debounced)
   * ------------------------------------------------------ */
  window.addEventListener(
    'resize',
    debounce(() => {
      // Close mobile nav on resize to desktop
      if (navLinks && window.innerWidth > 768) {
        navLinks.classList.remove('active');
      }
    }, 200),
    { passive: true }
  );
});
/* PROPERTY FILTER CODE */
const filterButtons = document.querySelectorAll('.filter-btn');
const propertyCards = document.querySelectorAll('.property-card');

if (filterButtons.length && propertyCards.length) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;

      propertyCards.forEach(card => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });

    });
  });
});
