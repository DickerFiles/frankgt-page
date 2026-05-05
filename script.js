/* ============================================
   RITUAL — Barbería de Autor
   Script: interacciones, formulario multistep
   ============================================ */

(() => {
  'use strict';

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader')?.classList.add('done');
    }, 1100);
  });

  /* ---------- Reloj ---------- */
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const tick = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Cursor ---------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const lerp = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(lerp);
    };
    lerp();

    const hoverables = 'a, button, .service, .service-option, input, select, textarea, label, [data-magnetic]';
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = Math.round(target * eased);
        el.textContent = v.toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.offsetTop - 40, behavior: 'smooth' });
    });
  });

  /* ---------- Booking form multistep ---------- */
  const form = document.getElementById('bookingForm');
  if (form) {
    const steps = form.querySelectorAll('.form-step');
    const progress = form.querySelectorAll('.progress-step');
    let current = 1;

    const setStep = (n) => {
      current = Math.max(1, Math.min(3, n));
      steps.forEach((s) => s.classList.toggle('active', +s.dataset.step === current));
      progress.forEach((p) => {
        const n2 = +p.dataset.step;
        p.classList.toggle('active', n2 === current);
        p.classList.toggle('done', n2 < current);
      });
    };

    form.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => setStep(current + 1)));
    form.querySelectorAll('[data-prev]').forEach((b) => b.addEventListener('click', () => setStep(current - 1)));

    // Update summary when entering step 3
    const SERVICE_LABELS = {
      signature: { name: 'Corte Signature', price: 35 },
      shave:     { name: 'Afeitado Tradicional', price: 28 },
      beard:     { name: 'Barba Esculpida', price: 32 },
      ritual:    { name: 'El Ritual Completo', price: 60 },
    };
    const updateSummary = () => {
      const fd = new FormData(form);
      const svc = SERVICE_LABELS[fd.get('service')] || { name: '—', price: 0 };
      document.getElementById('sumService').textContent = svc.name;
      document.getElementById('sumDate').textContent = fd.get('date') || '—';
      document.getElementById('sumTime').textContent = fd.get('time') || '—';
      document.getElementById('sumName').textContent = fd.get('name') || '—';
      document.getElementById('sumTotal').textContent = '$' + svc.price;
    };

    form.querySelectorAll('[data-next]').forEach((b) =>
      b.addEventListener('click', () => { if (current === 3) updateSummary(); else if (current === 4) {} })
    );
    // Hook for entering step 3 via setStep
    const _setStep = setStep;
    const wrappedSetStep = (n) => {
      _setStep(n);
      if (current === 3) updateSummary();
    };
    form.querySelectorAll('[data-next], [data-prev]').forEach((b) => {
      b.addEventListener('click', () => { if (current === 3) updateSummary(); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('formSuccess')?.classList.add('show');
      form.querySelector('.form-actions:last-of-type')?.style && (form.querySelector('.form-step.active .form-actions').style.display = 'none');
    });
  }

  /* ---------- Service rows: click to scroll to booking ---------- */
  document.querySelectorAll('.service').forEach((row) => {
    row.addEventListener('click', () => {
      const target = document.getElementById('reservar');
      if (target) window.scrollTo({ top: target.offsetTop - 40, behavior: 'smooth' });
    });
  });

  /* ---------- Mobile nav (basic) ---------- */
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (!links) return;
      const open = links.style.display === 'flex';
      links.style.display = open ? '' : 'flex';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'var(--bg)';
      links.style.padding = '24px';
      links.style.flexDirection = 'column';
      links.style.borderBottom = '1px solid var(--line)';
    });
  }

})();
