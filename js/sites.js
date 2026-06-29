/* ============ hitthe.link — real site launcher ============
   Replaces the template's demo apps with qi's ACTUAL sites from sites.json.
   Each tile opens the real site in an in-OS app window (iframe) with the
   home indicator to return. Reads sites.json live, so new sites auto-appear. */
(function(){
  function shortName(t){
    t = (t||'').split(/[—·|:]/)[0].trim();
    return t.length > 18 ? t.slice(0,17) + '…' : (t || 'site');
  }
  function initials(t){
    const w = (t||'').replace(/[^A-Za-z0-9 ]/g,' ').trim().split(/\s+/).filter(Boolean);
    return (((w[0]||'?')[0]||'?') + ((w[1]||'')[0]||'')).toUpperCase();
  }
  // deterministic accent per slug (metallic/iridescent brand palette)
  const PAL = ['#2f8cff','#0fbf3f','#ff9f0a','#bf5af2','#ff453a','#64d2ff','#ffd60a','#ff7ab6','#5ac8fa','#30d158'];
  function accent(s){ let h=0; for(const c of (s||'')) h=(h*31+c.charCodeAt(0))>>>0; return PAL[h%PAL.length]; }

  function openSite(url, name){
    if(!window.Aura) { location.href = url; return; }
    // register a transient app + open via the existing OS window chrome
    const id = '__site_open__';
    window.APPS[id] = { name: name || 'site', icon:'site', accent:'#0b1020',
      mount(body){
        body.classList.add('flush');
        const f = document.createElement('iframe');
        f.src = url;
        f.setAttribute('allow','clipboard-write; fullscreen; microphone; camera; autoplay');
        f.style.cssText = 'width:100%;height:100%;border:0;background:#000;display:block';
        body.appendChild(f);
      } };
    window.Aura.open(id);
  }

  function render(sites){
    const grid = document.getElementById('grid');
    const dock = document.getElementById('dock');
    if(!grid) return;
    sites = sites.filter(s => s && s.url && s.title);

    // group by category, stable order by most-recent-updated within group
    const byCat = {};
    sites.forEach(s => { const c = s.category || 'Apps'; (byCat[c] = byCat[c] || []).push(s); });

    const cell = (s) => `
      <button class="app-cell site-cell" data-url="${s.url}" data-name="${shortName(s.title).replace(/"/g,'&quot;')}" title="${(s.title||'').replace(/"/g,'&quot;')}">
        <span class="app-ico site-ico" style="--si:${accent(s.slug||s.url)}">${initials(s.title)}</span>
        <span class="app-name">${shortName(s.title)}</span>
      </button>`;

    grid.innerHTML = Object.keys(byCat).sort().map(cat => `
      <div class="site-cat">${cat}</div>
      <div class="site-grid">${byCat[cat].map(cell).join('')}</div>`).join('');

    // dock = 4 pinned key sites if present, else first 4
    const pinSlugs = ['xen','xos','desk','calculators'];
    const pin = pinSlugs.map(sl => sites.find(s => s.slug===sl)).filter(Boolean);
    while(pin.length < 4 && sites[pin.length]) pin.push(sites[pin.length]);
    if(dock) dock.innerHTML = pin.map(cell).join('');

    // page dots -> single page (scrolling)
    const dots = document.getElementById('dots'); if(dots) dots.innerHTML = '';

    // wire taps (capture so it beats the template's fake-app delegation)
    document.addEventListener('click', (e) => {
      const c = e.target.closest('.site-cell');
      if(!c) return;
      e.stopPropagation();
      openSite(c.dataset.url, c.dataset.name);
    }, true);
  }

  const css = document.createElement('style');
  css.textContent = `
    .site-cat{ grid-column:1/-1; width:100%; font:600 12px/1 -apple-system,system-ui,sans-serif;
      letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.55);
      margin:18px 6px 10px; }
    #grid{ display:block !important; padding-bottom:24px; }
    .site-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px 8px; margin-bottom:6px; }
    @media(min-width:680px){ .site-grid{ grid-template-columns:repeat(6,1fr); } }
    .site-ico{ display:flex; align-items:center; justify-content:center;
      font:700 22px/1 -apple-system,system-ui,sans-serif; color:#fff;
      background:linear-gradient(150deg, color-mix(in srgb, var(--si) 92%, #fff 8%), color-mix(in srgb, var(--si) 70%, #000 30%));
      box-shadow:0 6px 16px -6px var(--si), inset 0 1px 0 rgba(255,255,255,.35); }
  `;
  document.head.appendChild(css);

  function boot(){
    fetch('sites.json', {cache:'no-store'})
      .then(r => r.json())
      .then(d => render(d.sites || []))
      .catch(() => { const g=document.getElementById('grid'); if(g) g.innerHTML='<div class="site-cat">Could not load sites.json</div>'; });
  }
  if(document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 60);
  else document.addEventListener('DOMContentLoaded', boot);
})();
