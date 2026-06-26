// Animations
AOS.init({
  anchorPlacement: 'top-left',
  duration: 1000,
  once: true
});

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initStickyHeader();
    initScrollSpy();
    initTypewriter();
    initSkillBars();
    initBackToTop();
    initThemeToggle();
  });

  /* ---------------------------------------------------------------
   * 1. Top scroll-progress indicator
   * ------------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var update = function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      bar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
   * 2. Sticky header gains a solid background once the user scrolls
   * ------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector('header');
    if (!header) return;
    var toggle = function () {
      header.classList.toggle('header-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  /* ---------------------------------------------------------------
   * 3. Scroll-spy: highlight the nav link of the visible section
   * ------------------------------------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.site-nav .nav-link[href^="#"]')
    );
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = map[entry.target.id];
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* ---------------------------------------------------------------
   * 4. Typewriter for the hero role line
   * ------------------------------------------------------------- */
  function initTypewriter() {
    var el = document.getElementById('typed-roles');
    if (!el) return;
    var roles;
    try {
      roles = JSON.parse(el.getAttribute('data-roles') || '[]');
    } catch (e) {
      roles = [];
    }
    if (!roles.length) return;

    var roleIndex = 0, charIndex = 0, deleting = false;
    el.textContent = '';

    function tick() {
      var current = roles[roleIndex];
      if (deleting) {
        charIndex--;
      } else {
        charIndex++;
      }
      el.textContent = current.substring(0, charIndex);

      var delay = deleting ? 45 : 90;
      if (!deleting && charIndex === current.length) {
        delay = 1600;            // pause at full word
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }
      setTimeout(tick, delay);
    }
    tick();
  }

  /* ---------------------------------------------------------------
   * 5. Animate skill bars (fill + percentage) when scrolled into view
   * ------------------------------------------------------------- */
  function initSkillBars() {
    var bars = Array.prototype.slice.call(
      document.querySelectorAll('#skills .progress-bar')
    );
    if (!bars.length) return;

    bars.forEach(function (bar) {
      bar.dataset.targetWidth = bar.style.width || '0%';
      bar.style.width = '0%';
    });

    function pctEl(bar) {
      var item = bar.closest ? bar.closest('.skill-item') : null;
      return item ? item.querySelector('.skill-pct') : null;
    }

    function animate(bar) {
      var target = parseInt(bar.dataset.targetWidth, 10) || 0;
      var label = pctEl(bar);
      var count = 0;
      bar.style.width = target + '%';
      var step = setInterval(function () {
        count++;
        if (label) {
          label.textContent = count + '%';
        } else {
          bar.textContent = count + '%';
        }
        if (count >= target) clearInterval(step);
      }, 900 / Math.max(target, 1));
    }

    if (!('IntersectionObserver' in window)) {
      bars.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(function (bar) { observer.observe(bar); });
  }

  /* ---------------------------------------------------------------
   * 6. Back-to-top floating button
   * ------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------
   * 7. Dark / light theme toggle (persisted)
   * ------------------------------------------------------------- */
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    var icon = btn ? btn.querySelector('i') : null;
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}

    var prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(stored ? stored === 'dark' : prefersDark);

    if (!btn) return;
    btn.addEventListener('click', function () {
      apply(!document.body.classList.contains('dark-mode'));
    });

    function apply(dark) {
      document.body.classList.toggle('dark-mode', dark);
      if (icon) {
        icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
      }
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    }
  }
})();
