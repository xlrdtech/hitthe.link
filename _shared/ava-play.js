// hitthe.link/_shared/ava-play.js
// Drop-in floating Ava TTS play button.
// Usage: <script src="https://hitthe.link/_shared/ava-play.js" defer></script>
//        optional data attrs on the <script> tag:
//          data-ava-text="..."     explicit text to speak (otherwise auto-extracts from <h1>+<p>)
//          data-ava-endpoint="..." override the TTS endpoint (default: https://xen.xlrd.org/api/ava-tts)
//          data-ava-voice="en-US-AvaMultilingualNeural"
//          data-ava-bottom="24" / data-ava-right="24"  position in px

(function(){
  if (window.__avaPlayInit) return;
  window.__avaPlayInit = true;

  const SCRIPT_TAG = document.currentScript || document.querySelector('script[src*="ava-play.js"]');
  const ENDPOINT   = (SCRIPT_TAG && SCRIPT_TAG.dataset.avaEndpoint) || 'https://xen.xlrd.org/api/ava-tts';
  const VOICE      = (SCRIPT_TAG && SCRIPT_TAG.dataset.avaVoice)    || 'en-US-AvaMultilingualNeural';
  const TEXT_ATTR  = SCRIPT_TAG && SCRIPT_TAG.dataset.avaText;
  const BOTTOM_PX  = parseInt((SCRIPT_TAG && SCRIPT_TAG.dataset.avaBottom) || '24', 10);
  const RIGHT_PX   = parseInt((SCRIPT_TAG && SCRIPT_TAG.dataset.avaRight)  || '24', 10);

  function extractPageText() {
    if (TEXT_ATTR && TEXT_ATTR.trim()) return TEXT_ATTR.trim();
    const chunks = [];
    document.querySelectorAll('h1, h2, p, .lede, .tag, .lb-mid, blockquote').forEach(el => {
      const t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t && t.length > 8 && t.length < 600) chunks.push(t);
      if (chunks.join(' ').length > 1500) return;
    });
    return chunks.join('. ').slice(0, 2000);
  }

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
  let state = 'idle'; // idle | loading | playing | error

  function setState(next) {
    state = next;
    btn.classList.remove('loading','playing','error');
    if (next === 'loading') { btn.classList.add('loading'); label.textContent = 'Loading...'; label.classList.add('show'); }
    else if (next === 'playing') { btn.classList.add('playing'); label.textContent = 'Playing · tap to stop'; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>'; }
    else if (next === 'error') { btn.classList.add('error'); label.textContent = 'Endpoint unreachable'; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>'; setTimeout(() => setState('idle'), 4000); }
    else { label.classList.remove('show'); label.textContent = 'Listen · Ava'; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>'; }
  }

  btn.addEventListener('click', async () => {
    if (state === 'playing') {
      if (audio) { audio.pause(); audio.currentTime = 0; }
      setState('idle');
      return;
    }
    if (state === 'loading') return;
    setState('loading');
    const text = extractPageText();
    if (!text) { setState('error'); return; }
    try {
      const u = new URL(ENDPOINT);
      u.searchParams.set('text', text);
      u.searchParams.set('voice', VOICE);
      if (audio) { try { audio.pause(); } catch(_){} }
      audio = new Audio(u.toString());
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('canplay',  () => setState('playing'));
      audio.addEventListener('ended',    () => setState('idle'));
      audio.addEventListener('pause',    () => { if (state !== 'idle' && audio.currentTime > 0 && audio.currentTime < audio.duration) {} });
      audio.addEventListener('error',    () => setState('error'));
      await audio.play();
    } catch (e) {
      console.warn('ava-play failed', e);
      setState('error');
    }
  });
})();
