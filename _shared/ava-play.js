// hitthe.link/_shared/ava-play.js
// Drop-in floating Ava TTS play button — plays pre-generated ./ava.mp3 sibling file.
// Generate the MP3 per page at build time with edge-tts:
//   edge-tts --voice en-US-AvaMultilingualNeural --text "..." --write-media path/to/page/ava.mp3
//
// Optional <script> data attrs:
//   data-ava-src="./ava.mp3"    explicit MP3 path (default: ./ava.mp3 relative to current page)
//   data-ava-bottom="24" / data-ava-right="24"   position in px

(function(){
  if (window.__avaPlayInit) return;
  window.__avaPlayInit = true;

  const SCRIPT_TAG = document.currentScript || document.querySelector('script[src*="ava-play.js"]');
  const SRC        = (SCRIPT_TAG && SCRIPT_TAG.dataset.avaSrc)    || './ava.mp3';
  const BOTTOM_PX  = parseInt((SCRIPT_TAG && SCRIPT_TAG.dataset.avaBottom) || '24', 10);
  const RIGHT_PX   = parseInt((SCRIPT_TAG && SCRIPT_TAG.dataset.avaRight)  || '24', 10);

  const css = `
    .ava-play-btn {
      position: fixed; bottom: ${BOTTOM_PX}px; right: ${RIGHT_PX}px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(155deg, #00FF88, #00cc66);
      color: #0A0A0C;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: 0;
      box-shadow: 0 8px 24px rgba(0,255,136,.35), 0 0 0 1px rgba(0,255,136,.4);
      z-index: 9999; font: 600 11px 'JetBrains Mono', ui-monospace, monospace;
      letter-spacing: .12em; text-transform: uppercase;
      transition: transform .15s, box-shadow .15s, background .15s;
    }
    .ava-play-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 12px 32px rgba(0,255,136,.5); }
    .ava-play-btn:active { transform: scale(.96); }
    .ava-play-btn svg { width:24px; height:24px; }
    .ava-play-btn.loading { background: linear-gradient(155deg, #FFB347, #d97706); }
    .ava-play-btn.playing { background: linear-gradient(155deg, #A5F3FC, #06b6d4); }
    .ava-play-btn.error   { background: linear-gradient(155deg, #F87171, #dc2626); }
    .ava-play-label {
      position: fixed; bottom: ${BOTTOM_PX + 70}px; right: ${RIGHT_PX}px;
      background: rgba(10,10,12,.92); color: #F4EEE4;
      padding: 8px 14px; border-radius: 50px; border: 1px solid rgba(244,238,228,.18);
      font: 500 10px 'JetBrains Mono', ui-monospace, monospace;
      letter-spacing: .14em; text-transform: uppercase;
      z-index: 9999; backdrop-filter: blur(8px);
      transform: translateY(8px); opacity: 0;
      transition: opacity .2s, transform .2s; pointer-events:none;
    }
    .ava-play-btn:hover + .ava-play-label,
    .ava-play-label.show { opacity: 1; transform: translateY(0); }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const btn = document.createElement('button');
  btn.className = 'ava-play-btn';
  btn.title = 'Listen with Ava';
  btn.setAttribute('aria-label', 'Play this page with Ava TTS');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>';

  const label = document.createElement('div');
  label.className = 'ava-play-label';
  label.textContent = 'Listen · Ava';

  document.body.appendChild(btn);
  document.body.appendChild(label);

  let audio = null;
  let state = 'idle';

  function setState(next, msg) {
    state = next;
    btn.classList.remove('loading','playing','error');
    if (next === 'loading') {
      btn.classList.add('loading');
      label.textContent = 'Loading Ava...';
      label.classList.add('show');
    } else if (next === 'playing') {
      btn.classList.add('playing');
      label.textContent = 'Playing · tap to pause';
      label.classList.add('show');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
    } else if (next === 'paused') {
      btn.classList.add('playing');
      label.textContent = 'Paused · tap to resume';
      label.classList.add('show');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>';
    } else if (next === 'error') {
      btn.classList.add('error');
      label.textContent = msg || 'ava.mp3 missing';
      label.classList.add('show');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>';
      setTimeout(() => setState('idle'), 5000);
    } else {
      label.classList.remove('show');
      label.textContent = 'Listen · Ava';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>';
    }
  }

  btn.addEventListener('click', async () => {
    if (state === 'playing') {
      if (audio) audio.pause();
      setState('paused');
      return;
    }
    if (state === 'paused') {
      if (audio) audio.play();
      setState('playing');
      return;
    }
    if (state === 'loading') return;
    setState('loading');

    if (!audio) {
      audio = new Audio(SRC);
      audio.addEventListener('canplay', () => setState('playing'));
      audio.addEventListener('ended', () => setState('idle'));
      audio.addEventListener('error', () => setState('error', 'ava.mp3 missing'));
    }
    try {
      await audio.play();
    } catch (e) {
      setState('error', 'tap blocked · retry');
    }
  });
})();
