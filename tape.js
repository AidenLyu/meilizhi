/**
 * tape.js — injects real-DOM tape strips into .taped figures.
 * The pseudo-element ::before/::after approach works in most browsers,
 * but stacking-context quirks on grid/flex items with custom-element
 * children can hide them. Real spans render reliably.
 */
(function () {
  function inject() {
    const els = document.querySelectorAll('.taped, .taped--single');
    els.forEach((el) => {
      if (el.dataset.tapeInjected) return;
      el.dataset.tapeInjected = '1';
      // Ensure positioning context
      const cs = getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';

      const isSingle = el.classList.contains('taped--single');
      if (isSingle) {
        const c = document.createElement('span');
        c.className = 'tape-strip tape-strip--center';
        el.prepend(c);
      } else {
        const l = document.createElement('span');
        l.className = 'tape-strip tape-strip--left';
        const r = document.createElement('span');
        r.className = 'tape-strip tape-strip--right';
        el.prepend(r);
        el.prepend(l);
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
