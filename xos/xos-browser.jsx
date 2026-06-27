/* XOS Browser surface (LMHJ render surface).
 * Additive module: self-mounts its own React root, never edits app.jsx.
 * Summons the host-side mirror (XBB :8044) as an overlay above the voice home,
 * inside the center field, beneath the bottom glass clearance. Touch-native:
 * real pointer taps relayed to the host with epoch validation. No fake keyboards.
 * window.XOS.open(url) / window.XOS.close()  +  event 'xos:open' {detail:{url}}.
 */
(function () {
  const { useState, useRef, useEffect, useCallback } = React;

  // When the PWA is served from the mesh bridge itself (ts.net:8444), use same-origin so there is
  // no CORS and no Chrome Local Network Access wall (public origin -> local IP is blocked).
  // When loaded from public hitthe.link, point at the tailnet bridge absolutely (works on iOS WebKit;
  // Chrome desktop/Android will hit the LNA wall, so the canonical live URL is the ts.net one).
  // Override for local dev with localStorage['xos.bridge'] = 'http://localhost:8044'.
  const sameOrigin = (location.port === '8444') || /\.ts\.net$/i.test(location.hostname);
  const BRIDGE = localStorage.getItem('xos.bridge') || (sameOrigin ? location.origin : 'https://nitro.salmon-alkaline.ts.net:8444');
  const WSBASE = BRIDGE.replace(/^http/, 'ws');
  let cachedTok = null;
  async function getToken() {
    const ls = localStorage.getItem('xos.token'); if (ls) return ls;
    if (cachedTok) return cachedTok;
    try { const r = await fetch(BRIDGE + '/ticket'); const j = await r.json(); if (j.ok) { cachedTok = j.ticket; return cachedTok; } } catch (e) {}
    return '';
  }

  function XOSBrowser() {
    const [tab, setTab] = useState(null); // {tabId}
    const [status, setStatus] = useState('idle'); // idle|opening|live|error|closed
    const [err, setErr] = useState('');
    const [kbd, setKbd] = useState(null); // {value} when a host textfield is focused
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const epochRef = useRef(1);

    const draw = useCallback((arrbuf) => {
      const dv = new DataView(arrbuf);
      epochRef.current = dv.getUint32(0);
      const jpeg = arrbuf.slice(8);
      const blob = new Blob([jpeg], { type: 'image/jpeg' });
      createImageBitmap(blob).then((bm) => {
        const c = canvasRef.current; if (!c) { bm.close(); return; }
        if (c.width !== bm.width) { c.width = bm.width; c.height = bm.height; }
        const ctx = c.getContext('2d'); ctx.drawImage(bm, 0, 0); bm.close();
      }).catch(() => {});
    }, []);

    const open = useCallback(async (url) => {
      setStatus('opening'); setErr('');
      try {
        const tok = await getToken();
        const r = await fetch(BRIDGE + '/tab', { method: 'POST',
          headers: { 'authorization': 'Bearer ' + tok, 'content-type': 'application/json' },
          body: JSON.stringify({ url, scope: 'xos' }) });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'open-failed');
        epochRef.current = j.epoch || 1;
        setTab({ tabId: j.tabId });
        const ws = new WebSocket(WSBASE + '/tab/' + j.tabId + '?t=' + tok);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;
        ws.onmessage = (ev) => {
          if (typeof ev.data !== 'string') { draw(ev.data); if (status !== 'live') setStatus('live'); return; }
          const m = JSON.parse(ev.data);
          if (m.type === 'snapshot' || m.type === 'nav') epochRef.current = m.payload.epoch;
          if (m.type === 'event' && m.payload.kind === 'textfield-focus') setKbd({ value: '' });
        };
        ws.onerror = () => { setStatus('error'); setErr('bridge unreachable (' + BRIDGE + ')'); };
        ws.onclose = () => setStatus((s) => (s === 'closed' ? s : 'error'));
      } catch (e) { setStatus('error'); setErr(String(e.message || e)); }
    }, [draw, status]);

    const close = useCallback(async () => {
      const t = tab; setStatus('closed'); setTab(null);
      try { wsRef.current && wsRef.current.close(); } catch (e) {}
      if (t) { try { await fetch(BRIDGE + '/tab/' + t.tabId, { method: 'DELETE', headers: { 'authorization': 'Bearer ' + (await getToken()) } }); } catch (e) {} }
    }, [tab]);

    useEffect(() => {
      window.XOS = { open, close };
      const onOpen = (e) => open((e.detail && e.detail.url) || 'https://hitthe.link/vvsvei');
      const onClose = () => close();
      window.addEventListener('xos:open', onOpen);
      window.addEventListener('xos:close', onClose);
      return () => { window.removeEventListener('xos:open', onOpen); window.removeEventListener('xos:close', onClose); };
    }, [open, close]);

    const sendInput = (type, payload) => {
      const ws = wsRef.current; if (!ws || ws.readyState !== 1) return;
      ws.send(JSON.stringify({ ch: 'input', type, epoch: epochRef.current, payload }));
    };
    const norm = (e) => { const c = canvasRef.current; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
    const onPointerDown = (e) => { const p = norm(e); sendInput('tap', p); };
    const onWheel = (e) => { const p = norm(e); sendInput('scroll', { x: p.x, y: p.y, dx: e.deltaX, dy: e.deltaY }); };

    if (!tab && status === 'idle') return null;
    if (status === 'closed' && !tab) return null;

    return (
      React.createElement('div', { className: 'xos-browser-overlay' },
        React.createElement('div', { className: 'xos-browser-bar' },
          React.createElement('span', { className: 'xos-dot ' + (status === 'live' ? 'on' : 'off') }),
          React.createElement('span', { className: 'xos-browser-title' }, status === 'live' ? 'live mirror' : status),
          React.createElement('button', { className: 'xos-browser-close', onClick: close, 'aria-label': 'close' }, '×')
        ),
        React.createElement('div', { className: 'xos-browser-stage' },
          React.createElement('canvas', { ref: canvasRef, className: 'xos-browser-canvas',
            onPointerDown: onPointerDown, onWheel: onWheel, style: { touchAction: 'none' } }),
          status !== 'live' && React.createElement('div', { className: 'xos-browser-state' },
            status === 'error' ? ('reconnect needed — ' + err) : (status + '…'))
        ),
        kbd && React.createElement('div', { className: 'xos-browser-kbd' },
          React.createElement('input', { autoFocus: true, type: 'text', placeholder: 'type…', defaultValue: '',
            onKeyDown: (e) => { if (e.key === 'Enter') { sendInput('text', { value: e.target.value }); setKbd(null); } } }),
          React.createElement('button', { onClick: () => setKbd(null) }, 'done'))
      )
    );
  }

  // self-mount a dedicated root so app.jsx is never touched
  function mount() {
    if (document.getElementById('xos-browser-root')) return;
    const el = document.createElement('div'); el.id = 'xos-browser-root';
    document.body.appendChild(el);
    ReactDOM.createRoot(el).render(React.createElement(XOSBrowser));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
