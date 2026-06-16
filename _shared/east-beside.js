/* east-beside.js — shared East AI Beside integration widget for TTA surfaces.
   Drop into any TTA page (trackingtogether / eliops / elios) with:
     <script src="/_shared/east-beside.js" defer></script>
   Renders a floating "Talk to East" CTA → cal.com/ctoeast (single East identity,
   per cal-booking-centralized-ctoeast). The Beside line presents AS East Allen,
   not a separate persona (reference-east-allen-booking-compliance). */
(function () {
  if (window.__eastBesideMounted) return;
  window.__eastBesideMounted = true;

  var BOOK_URL = 'https://cal.com/ctoeast';

  var css = document.createElement('style');
  css.textContent =
    '.east-beside-fab{position:fixed;right:18px;bottom:18px;z-index:99999;' +
    'display:flex;align-items:center;gap:9px;padding:12px 18px;border-radius:999px;' +
    'background:linear-gradient(135deg,#0b1f3a,#16365e);color:#f4e9c8;font:600 14px/1 ' +
    'system-ui,-apple-system,Segoe UI,sans-serif;text-decoration:none;cursor:pointer;' +
    'box-shadow:0 8px 28px rgba(0,0,0,.35);border:1px solid rgba(212,175,55,.5);' +
    'transition:transform .15s ease}' +
    '.east-beside-fab:hover{transform:translateY(-2px)}' +
    '.east-beside-fab .dot{width:9px;height:9px;border-radius:50%;background:#48d16a;' +
    'box-shadow:0 0 0 0 rgba(72,209,106,.7);animation:eastpulse 2s infinite}' +
    '@keyframes eastpulse{0%{box-shadow:0 0 0 0 rgba(72,209,106,.6)}' +
    '70%{box-shadow:0 0 0 8px rgba(72,209,106,0)}100%{box-shadow:0 0 0 0 rgba(72,209,106,0)}}';
  document.head.appendChild(css);

  function mount() {
    var a = document.createElement('a');
    a.className = 'east-beside-fab';
    a.href = BOOK_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Talk to East — book a call');
    a.innerHTML = '<span class="dot"></span><span>Talk to East</span>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
