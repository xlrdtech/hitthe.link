/* pano — any upload becomes a panoramic 3D environment you scroll through, endlessly.
 *
 * qi 2026-08-31 11:16:
 *   "taking the uploads and making a panorama … panoramic video … my landing pages need videos
 *    that turn into the panoramic 3-D environments and when you scroll … they scroll in an
 *    endless scroll through panoramic video 3-D environment"
 *   11:17: "we're gonna use that method for all my landing pages"
 *
 * Drop into any landing page:
 *
 *     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 *     <script src="https://hitthe.link/x3d/pano.js"
 *             data-src="/media/whatever.mp4" defer></script>
 *
 * data-src takes a VIDEO (mp4/webm) or an IMAGE (jpg/png). Either way it is mapped to the
 * inside of a sphere, so the viewer stands inside it rather than looking at it. A flat upload
 * is wrapped, not stretched — the aspect decides how: a 2:1 upload is treated as a true 360
 * equirectangular, anything else is mirror-wrapped so it still covers the full azimuth instead
 * of leaving a dead arc.
 *
 * SCROLL IS TRAVEL. Scrolling yaws the camera around the environment AND dollies forward, and
 * it never ends: at the bottom the scroll position wraps and the yaw keeps accumulating, so the
 * journey is continuous rather than hitting a wall. That is the "endless scroll" — the page
 * content scrolls normally on top, the world keeps turning underneath.
 *
 * ⛔ NEVER FLAT. This is the environment layer; content sits in front of it and x3d.js poses
 *    that content. Nothing here renders as a flat backdrop image.
 * ⛔ VIDEO MUST BE muted + playsinline OR IT WILL NOT AUTOPLAY on iOS or Chrome. That silent
 *    failure looks exactly like a broken texture — black sphere, no error.
 * ⛔ A cross-origin video/image needs CORS headers or WebGL refuses the texture and the sphere
 *    stays black with no console error. Same-origin assets are the safe path.
 */
(function () {
  'use strict';

  var script = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var d = (script && script.dataset) || {};

  var SRC = d.src || new URLSearchParams(location.search).get('pano') || '';
  if (!SRC) { console.warn('[pano] no data-src and no ?pano= — nothing to build'); return; }
  if (typeof THREE === 'undefined') { console.warn('[pano] three.js not loaded before pano.js'); return; }

  var SPEED  = parseFloat(d.speed  || '1');     // how fast scroll turns the world
  var DOLLY  = parseFloat(d.dolly  || '1');     // how much scroll pushes forward
  var DIM    = parseFloat(d.dim    || '0.72');  // environment brightness behind content
  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var host = document.createElement('div');
  host.id = 'pano-env';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;background:#05070a';
  document.body.insertBefore(host, document.body.firstChild);
  // Content must sit in front of the world, not behind it.
  Array.prototype.forEach.call(document.body.children, function (el) {
    if (el === host) return;
    var cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    if (cs.zIndex === 'auto') el.style.zIndex = '1';
  });

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1100);

  // The sphere is scaled -1 on x so we see its INSIDE. That is what puts the viewer inside the
  // environment; without it you orbit a textured ball and everything reads backwards.
  var geo = new THREE.SphereGeometry(500, 64, 40);
  geo.scale(-1, 1, 1);

  var tex, videoEl = null;
  var isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(SRC);

  if (isVideo) {
    videoEl = document.createElement('video');
    videoEl.src = SRC;
    videoEl.crossOrigin = 'anonymous';
    videoEl.loop = true;
    videoEl.muted = true;           // required for autoplay — see the note above
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('muted', '');
    videoEl.preload = 'auto';
    tex = new THREE.VideoTexture(videoEl);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    var tryPlay = function () { var p = videoEl.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    // Autoplay can still be refused until a gesture; take the first one that arrives.
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
  } else {
    tex = new THREE.TextureLoader().load(SRC, function (t) {
      // Aspect decides the wrap: 2:1 is a true equirect; anything else gets mirrored so the
      // back half is covered instead of showing a seam and a dead arc.
      var ar = t.image.width / Math.max(t.image.height, 1);
      if (!(ar > 1.88 && ar < 2.18)) {
        t.wrapS = THREE.MirroredRepeatWrapping;
        t.repeat.x = 2;
      }
      t.needsUpdate = true;
    });
  }

  var mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(DIM, DIM, DIM) });
  var sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // ── ENDLESS SCROLL ────────────────────────────────────────────────────────────────────────
  // Scroll is not a position here, it is DISTANCE TRAVELLED. We accumulate deltas rather than
  // reading scrollY, so hitting the bottom of the document does not stop the journey — the page
  // can wrap and the world keeps turning. Yaw accumulates without bound; the dolly breathes
  // within the sphere so it never clips through the far wall.
  var travelled = 0, lastY = window.scrollY || 0, target = 0, current = 0;

  function onScroll() {
    var y = window.scrollY || 0;
    var doc = Math.max(1, document.body.scrollHeight - window.innerHeight);
    var dy = y - lastY;
    // Wrapping the page keeps the scrollbar alive without a jump in travel.
    if (Math.abs(dy) > doc * 0.8) dy = 0;
    lastY = y;
    travelled += dy;
    target = travelled;
    if (y >= doc - 2) { window.scrollTo(0, 1); lastY = 1; }
    else if (y <= 0)  { window.scrollTo(0, doc - 2); lastY = doc - 2; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) {
    if (reduced) return;
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize, { passive: true });

  var t0 = performance.now();
  function frame(now) {
    current += (target - current) * 0.06;              // eased so scrolling glides, not jerks
    var yaw = (current * 0.0016 * SPEED) + (reduced ? 0 : (now - t0) * 0.000012);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw + (reduced ? 0 : mx * -0.22);
    camera.rotation.x = (reduced ? 0 : my * -0.16) + Math.sin(current * 0.0007) * 0.05;
    camera.position.z = Math.sin(current * 0.0009) * 40 * DOLLY;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.pano = {
    swap: function (url) {
      if (videoEl) { videoEl.src = url; videoEl.play().catch(function () {}); }
      else { mat.map = new THREE.TextureLoader().load(url); mat.needsUpdate = true; }
    },
    element: host,
    isVideo: isVideo
  };
})();
