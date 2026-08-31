/* x3d — turn any surface into 3D space, automatically.
 *
 * qi 2026-08-31 11:14/11:16: "always needs to be in 3-D space whatever it is overlaying …
 * turn any surface into 3-D space, it cannot be flat ever" + "3-D environment automatically".
 *
 * Drop one line into any page and its panels stand in space instead of lying on the screen:
 *
 *     <script src="https://hitthe.link/x3d/x3d.js" defer></script>
 *
 * It auto-detects the panels (or takes a selector via data-x3d on the script tag), gives the
 * scene perspective, and poses each panel with a yaw derived from its horizontal position — so
 * the left side of the page turns toward the viewer and the right turns away, which is what
 * reads as a room rather than a grid.
 *
 * ⛔ PERSPECTIVE GOES ON THE TRANSFORM, NEVER ON AN ANCESTOR. MEASURED 2026-08-31: a
 * `perspective` on <body> makes body the containing block for every position:fixed descendant,
 * so a fixed overlay sized `inset:0` sizes itself to the DOCUMENT, not the viewport, and renders
 * off-screen while the DOM still reports display:flex / visible / opacity 1. Cost: an hour.
 *
 * ⛔ IT NEVER TOUCHES CONTENT. No innerHTML, no text, no colors — only transform, and only on
 * the containers it was pointed at. A surface must come back unchanged if x3d is removed.
 *
 * Respects prefers-reduced-motion: the pose stays, the motion goes. Reduced motion is not a
 * request to be flat.
 */
(function () {
  'use strict';

  var script = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var opt = (script && script.dataset) || {};

  var SEL = opt.x3d || [
    'main > section', 'main > article', '.panel', '.card', '.g', '.cols > section',
    '[data-x3d-panel]'
  ].join(',');

  var DEPTH   = num(opt.x3dDepth, 1200);   // perspective distance — lower is a wider lens
  var YAW     = num(opt.x3dYaw, 14);       // degrees at the outer edges
  var PITCH   = num(opt.x3dPitch, 4);      // constant tilt so nothing sits perfectly square
  var PUSH    = num(opt.x3dPush, 60);      // how far the outer panels recede, px
  var LIFT    = num(opt.x3dLift, 22);      // hover rise, px
  var PARALLAX = opt.x3dParallax !== 'off';

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }

  function panels() {
    try { return Array.prototype.slice.call(document.querySelectorAll(SEL)); }
    catch (e) { return []; }
  }

  // Yaw from horizontal position: -1 at the left edge, +1 at the right. A panel dead centre
  // gets no yaw, which keeps the middle of the page readable while the flanks turn away.
  function poseOf(el, mx, my) {
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth || 1;
    var cx = (r.left + r.width / 2) / vw;          // 0..1
    var t = Math.max(-1, Math.min(1, (cx - 0.5) * 2));
    var yaw = -t * YAW;
    var push = -Math.abs(t) * PUSH;
    var pitch = PITCH;
    if (PARALLAX && !reduced && mx !== undefined) {
      yaw += (mx - 0.5) * -6;
      pitch += (my - 0.5) * 4;
    }
    return 'perspective(' + DEPTH + 'px) rotateY(' + yaw.toFixed(2) + 'deg) rotateX(' +
      pitch.toFixed(2) + 'deg) translateZ(' + push.toFixed(1) + 'px)';
  }

  function apply(mx, my) {
    panels().forEach(function (el) {
      if (!el.dataset.x3dInit) {
        el.dataset.x3dInit = '1';
        el.style.transformStyle = 'preserve-3d';
        el.style.backfaceVisibility = 'hidden';
        el.style.willChange = 'transform';
        if (!reduced) el.style.transition = 'transform .5s cubic-bezier(.22,.75,.2,1)';
        el.addEventListener('pointerenter', function () {
          if (reduced) return;
          el.style.transform = el.style.transform.replace(
            /translateZ\(([-\d.]+)px\)/, function (_, z) {
              return 'translateZ(' + (parseFloat(z) + LIFT).toFixed(1) + 'px)';
            });
        });
        el.addEventListener('pointerleave', function () { el.style.transform = poseOf(el, mx, my); });
      }
      el.style.transform = poseOf(el, mx, my);
    });
  }

  var mx, my, queued = false;
  function onMove(e) {
    if (!PARALLAX || reduced) return;
    mx = e.clientX / (window.innerWidth || 1);
    my = e.clientY / (window.innerHeight || 1);
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; apply(mx, my); });
  }

  function boot() {
    apply();
    window.addEventListener('resize', function () { apply(mx, my); }, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    // Surfaces that mount their panels late (SSE dashboards, mounted sub-pages) get posed as
    // they appear — a panel that arrives after boot must not be the one flat thing on the page.
    if (window.MutationObserver) {
      new MutationObserver(function () { apply(mx, my); })
        .observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Escape hatch: x3d.off() returns every surface to exactly how it was.
  window.x3d = {
    off: function () {
      panels().forEach(function (el) {
        el.style.transform = '';
        el.style.transition = '';
        el.style.willChange = '';
        delete el.dataset.x3dInit;
      });
    },
    on: boot,
    selector: SEL
  };
})();
