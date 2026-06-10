/* VENOM INJECTOR — drops Xen VVS layer onto any web surface */
(function () {
  if (window.__xenVenom) return;
  window.__xenVenom = true;

  const TTS_ORIGIN = 'https://api.xlrd.org';
  const SSE_ORIGIN = 'https://xen.xlrd.org';

  /* ── Canonical VVS CSS ─────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #xen-venom-shell {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483647;
      background: rgba(0,0,0,0.92); color: #00ff88; font-family: monospace;
      font-size: 13px; padding: 8px 14px; display: flex; align-items: center;
      gap: 12px; border-top: 1px solid #00ff4430; backdrop-filter: blur(8px);
      transition: transform 0.2s ease;
    }
    #xen-venom-shell.hidden { transform: translateY(100%); }
    #xen-venom-dot { width: 8px; height: 8px; border-radius: 50%; background: #444; flex-shrink: 0; }
    #xen-venom-dot.live { background: #00ff88; box-shadow: 0 0 6px #00ff88; animation: xen-pulse 1.4s infinite; }
    #xen-venom-dot.speaking { background: #fff; box-shadow: 0 0 8px #fff; animation: xen-pulse 0.6s infinite; }
    @keyframes xen-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    #xen-venom-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.85; }
    #xen-venom-toggle { cursor: pointer; opacity: 0.5; font-size: 10px; padding: 2px 6px; border: 1px solid #333; border-radius: 3px; }
    #xen-venom-toggle:hover { opacity: 1; }
  `;
  document.head.appendChild(style);

  /* ── Shell UI ──────────────────────────────────────────────── */
  const shell = document.createElement('div');
  shell.id = 'xen-venom-shell';
  shell.innerHTML = `
    <div id="xen-venom-dot"></div>
    <div id="xen-venom-text">Xen connecting…</div>
    <div id="xen-venom-toggle">hide</div>
  `;
  document.body.appendChild(shell);

  const dot = document.getElementById('xen-venom-dot');
  const txt = document.getElementById('xen-venom-text');
  const tog = document.getElementById('xen-venom-toggle');

  tog.addEventListener('click', () => {
    shell.classList.toggle('hidden');
    tog.textContent = shell.classList.contains('hidden') ? 'show' : 'hide';
  });

  function setText(msg) { txt.textContent = msg; }
  function setLive() { dot.className = 'live'; }
  function setSpeaking() { dot.className = 'speaking'; }
  function setIdle() { dot.className = 'live'; }

  /* ── SSE feed from omnimind ────────────────────────────────── */
  let sse;
  function connect() {
    try {
      sse = new EventSource(SSE_ORIGIN + '/events');
      sse.onopen = () => { setLive(); setText('Xen live — ' + location.hostname); };
      sse.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d.type === 'xen-out' && d.text) speak(d.text);
          if (d.type === 'xen-status') setText(d.text || '');
        } catch (_) {}
      };
      sse.onerror = () => { setTimeout(connect, 3000); setText('reconnecting…'); dot.className = ''; };
    } catch (_) {}
  }
  connect();

  /* ── TTS via M4 api.xlrd.org ───────────────────────────────── */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let speaking = false;
  const queue = [];

  async function speak(text) {
    queue.push(text);
    if (!speaking) drain();
  }

  async function drain() {
    if (!queue.length) { speaking = false; setIdle(); return; }
    speaking = true;
    const text = queue.shift();
    setSpeaking();
    setText(text);
    try {
      const res = await fetch(TTS_ORIGIN + '/api/tts?text=' + encodeURIComponent(text));
      if (!res.ok) throw new Error('tts ' + res.status);
      const buf = await res.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(buf);
      const src = audioCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(audioCtx.destination);
      src.onended = () => drain();
      src.start(0);
    } catch (e) {
      console.warn('[VENOM] TTS error:', e);
      drain();
    }
  }

  /* ── Resume AudioContext on first user gesture ─────────────── */
  function resume() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.removeEventListener('click', resume);
    document.removeEventListener('keydown', resume);
  }
  document.addEventListener('click', resume);
  document.addEventListener('keydown', resume);

  setText('Venom armed — ' + location.hostname);
  console.log('[VENOM] Xen symbiote active on', location.href);
})();
