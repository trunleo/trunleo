/*
 * Pipeline Blueprint — interactions
 */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Terminal pipeline animation (hero) */
  const terminal = document.getElementById('terminal-output');

  const PIPELINE = [
    { cls: 't-cmd',  text: 'trunleo run pipeline --env prod' },
    { cls: 't-step', text: '▸ extract    s3://raw/events ......... ', ok: true },
    { cls: 't-step', text: '▸ transform  spark · 128 partitions .. ', ok: true },
    { cls: 't-step', text: '▸ validate   quality checks .......... ', ok: true },
    { cls: 't-step', text: '▸ load       lakehouse.gold .......... ', ok: true },
    { cls: 't-done', text: '✓ pipeline succeeded — insights ready' },
  ];

  function renderStatic() {
    terminal.innerHTML = '';
    PIPELINE.forEach((line) => {
      const el = document.createElement('span');
      el.className = 't-line ' + line.cls;
      el.textContent = line.text;
      if (line.ok) {
        const ok = document.createElement('span');
        ok.className = 't-ok';
        ok.textContent = 'ok';
        el.appendChild(ok);
      }
      terminal.appendChild(el);
    });
  }

  function typeLine(line, done) {
    const el = document.createElement('span');
    el.className = 't-line ' + line.cls;
    terminal.appendChild(el);

    const caret = document.createElement('span');
    caret.className = 't-caret';
    el.appendChild(caret);

    let i = 0;
    const speed = line.cls === 't-cmd' ? 45 : 14;

    (function tick() {
      if (i < line.text.length) {
        caret.insertAdjacentText('beforebegin', line.text[i]);
        i += 1;
        setTimeout(tick, speed);
      } else {
        caret.remove();
        if (line.ok) {
          const ok = document.createElement('span');
          ok.className = 't-ok';
          ok.textContent = 'ok';
          el.appendChild(ok);
        }
        setTimeout(done, line.cls === 't-cmd' ? 350 : 180);
      }
    })();
  }

  function runPipeline() {
    terminal.innerHTML = '';
    let idx = 0;
    (function next() {
      if (idx < PIPELINE.length) {
        typeLine(PIPELINE[idx], () => { idx += 1; next(); });
      } else {
        setTimeout(runPipeline, 6000); // idle, then re-run
      }
    })();
  }

  if (terminal) {
    if (reducedMotion) renderStatic();
    else setTimeout(runPipeline, 900);
  }

  /* ---------------- Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------------- Scrollspy — highlight active nav link */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------- Mobile navigation */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Smooth scroll for anchors */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------------- Footer year */
  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
});
