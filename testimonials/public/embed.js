/* Lovewall embed — renders a testimonial wall into any page, iframe-free.
 *
 * Usage:
 *   <div data-testimonials-wall="your-slug"></div>
 *   <script src="https://your-host/embed.js" async></script>
 *
 * Attributes on the div:
 *   data-testimonials-wall  wall slug (required)
 *   data-layout             "wall" (masonry, default) | "carousel" (auto-advancing row)
 *   data-theme              "light" (default) | "dark" | "auto" (follow the visitor's OS)
 *   data-accent             optional #hex override of the wall's accent colour
 *   data-max                optional cap on how many testimonials to show
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var BASE = new URL(script.src, location.href).origin;
  var STAR = 'M12 2.6l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5-4.9-4.5 6.6-.8z';
  var PLAY = 'M8 5v14l11-7z';
  var CHEV = 'M9 6l6 6-6 6';

  var THEMES = {
    light: {
      card: '#ffffff', text: '#0a2540', body: '#425466', muted: '#8792a2',
      border: '#e6ebf1', shadow: '0 1px 2px rgba(0,0,0,.04), 0 6px 18px rgba(50,50,93,.08)',
    },
    dark: {
      card: '#14141b', text: '#f2f2f6', body: '#c6c7d2', muted: '#8e8f9e',
      border: 'rgba(255,255,255,0.1)', shadow: '0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.35)',
    },
  };

  function injectStyles() {
    if (document.getElementById('lw-embed-css')) return;
    var css =
      '.lw-wall{font-family:inherit;color:var(--lw-body);line-height:1.55}' +
      '.lw-cols{columns:3 280px;column-gap:16px}' +
      '.lw-cols .lw-card{break-inside:avoid;margin:0 0 16px}' +
      '.lw-card{background:var(--lw-card);border:1px solid var(--lw-border);border-radius:12px;padding:18px;box-shadow:var(--lw-shadow);transition:transform .22s ease,box-shadow .22s ease}' +
      '.lw-card:hover{transform:translateY(-2px)}' +
      '.lw-head{display:flex;align-items:center;gap:11px;margin-bottom:9px}' +
      '.lw-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;background:var(--lw-border);border:1px solid var(--lw-border)}' +
      '.lw-initials{display:flex;align-items:center;justify-content:center;color:#fff;background:var(--lw-accent);font-weight:600;font-size:15px;border:0}' +
      '.lw-name{font-weight:600;font-size:14.5px;color:var(--lw-text);letter-spacing:-.01em}' +
      '.lw-name a{color:inherit;text-decoration:none}.lw-name a:hover{text-decoration:underline}' +
      '.lw-role{color:var(--lw-muted);font-size:12.5px}' +
      '.lw-stars{display:inline-flex;gap:2px;margin-bottom:7px;color:#f5a623}' +
      '.lw-stars svg{width:14px;height:14px;display:block}' +
      '.lw-stars .lw-off{color:var(--lw-border)}' +
      '.lw-text{margin:0;font-size:14.5px;white-space:pre-line;overflow-wrap:anywhere;color:var(--lw-body)}' +
      '.lw-video{margin-top:11px;border-radius:9px;overflow:hidden;position:relative;aspect-ratio:16/9;background:#0a2540}' +
      '.lw-video iframe,.lw-video img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}' +
      '.lw-video button{position:absolute;inset:0;width:100%;height:100%;background:rgba(10,37,64,.25);border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background .2s}' +
      '.lw-video button:hover{background:rgba(10,37,64,.45)}' +
      '.lw-play{width:48px;height:48px;border-radius:50%;background:#fff;color:#0a2540;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3);transition:transform .2s}' +
      '.lw-video button:hover .lw-play{transform:scale(1.07)}' +
      '.lw-play svg{width:19px;height:19px;fill:currentColor;margin-left:2px}' +
      '.lw-badge{column-span:all;margin-top:14px;text-align:center}' +
      '.lw-badge a{display:inline-block;font-size:12px;font-weight:500;color:var(--lw-muted);border:1px solid var(--lw-border);border-radius:999px;padding:5px 13px;text-decoration:none;background:var(--lw-card)}' +
      '.lw-badge a:hover{color:var(--lw-accent);border-color:var(--lw-accent)}' +
      '.lw-empty{color:var(--lw-muted);font-size:14px;text-align:center;padding:24px;border:1px dashed var(--lw-border);border-radius:12px}' +
      /* carousel */
      '.lw-carousel{position:relative}' +
      '.lw-track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:4px 2px 8px}' +
      '.lw-track::-webkit-scrollbar{display:none}' +
      '.lw-track .lw-card{flex:0 0 300px;max-width:300px;scroll-snap-align:start}' +
      '.lw-arrow{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;border:1px solid var(--lw-border);background:var(--lw-card);color:var(--lw-text);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--lw-shadow);z-index:2;transition:transform .15s}' +
      '.lw-arrow:hover{transform:translateY(-50%) scale(1.08)}' +
      '.lw-arrow svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.lw-prev{left:-10px}.lw-prev svg{transform:rotate(180deg)}' +
      '.lw-next{right:-10px}';
    var el = document.createElement('style');
    el.id = 'lw-embed-css';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function svg(pathD, filled) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', pathD);
    if (filled) p.setAttribute('fill', 'currentColor');
    s.appendChild(p);
    return s;
  }

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join('');
  }

  function applyTheme(container, mode, accent) {
    var t = THEMES[mode] || THEMES.light;
    container.style.setProperty('--lw-card', t.card);
    container.style.setProperty('--lw-text', t.text);
    container.style.setProperty('--lw-body', t.body);
    container.style.setProperty('--lw-muted', t.muted);
    container.style.setProperty('--lw-border', t.border);
    container.style.setProperty('--lw-shadow', t.shadow);
    container.style.setProperty('--lw-accent', accent);
  }

  function renderCard(t) {
    var card = el('article', 'lw-card');
    var head = el('div', 'lw-head');

    if (t.avatar) {
      var img = el('img', 'lw-avatar');
      img.src = t.avatar;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', function () { img.style.display = 'none'; });
      head.appendChild(img);
    } else {
      head.appendChild(el('span', 'lw-avatar lw-initials', initials(t.name || '?')));
    }

    var who = el('div');
    var nameEl = el('div', 'lw-name');
    if (t.url && /^https?:\/\//.test(t.url)) {
      var a = el('a', null, t.name);
      a.href = t.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer nofollow';
      nameEl.appendChild(a);
    } else {
      nameEl.textContent = t.name;
    }
    who.appendChild(nameEl);
    if (t.role) who.appendChild(el('div', 'lw-role', t.role));
    head.appendChild(who);
    card.appendChild(head);

    var stars = el('span', 'lw-stars');
    for (var i = 1; i <= 5; i++) {
      var st = svg(STAR, true);
      if (i > t.rating) st.setAttribute('class', 'lw-off');
      stars.appendChild(st);
    }
    card.appendChild(stars);
    card.appendChild(el('p', 'lw-text', t.text));

    if (t.video && t.video.embedUrl) {
      var box = el('div', 'lw-video');
      if (t.video.thumbUrl) {
        var thumb = el('img');
        thumb.src = t.video.thumbUrl;
        thumb.alt = '';
        thumb.loading = 'lazy';
        thumb.addEventListener('error', function () { thumb.style.display = 'none'; });
        box.appendChild(thumb);
      }
      var btn = el('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Play video testimonial');
      var play = el('span', 'lw-play');
      play.appendChild(svg(PLAY, true));
      btn.appendChild(play);
      btn.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = t.video.embedUrl;
        iframe.title = 'Video testimonial from ' + t.name;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
        iframe.allowFullscreen = true;
        box.textContent = '';
        box.appendChild(iframe);
      });
      box.appendChild(btn);
      card.appendChild(box);
    }
    return card;
  }

  function renderBadge(container, data) {
    if (data.wall.hideBadge) return;
    var badge = el('div', 'lw-badge');
    var a = el('a', null, 'Powered by ' + data.product.name);
    a.href = data.product.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    badge.appendChild(a);
    container.appendChild(badge);
  }

  function renderWallLayout(container, items, data) {
    var cols = el('div', 'lw-cols');
    items.forEach(function (t) { cols.appendChild(renderCard(t)); });
    container.appendChild(cols);
    renderBadge(container, data);
  }

  function renderCarousel(container, items, data) {
    var wrap = el('div', 'lw-carousel');
    var track = el('div', 'lw-track');
    items.forEach(function (t) { track.appendChild(renderCard(t)); });
    wrap.appendChild(track);

    function arrow(cls, dir) {
      var b = el('button', 'lw-arrow ' + cls);
      b.type = 'button';
      b.setAttribute('aria-label', dir > 0 ? 'Next testimonials' : 'Previous testimonials');
      b.appendChild(svg(CHEV, false));
      b.addEventListener('click', function () {
        stop();
        track.scrollBy({ left: dir * 320, behavior: 'smooth' });
      });
      return b;
    }
    wrap.appendChild(arrow('lw-prev', -1));
    wrap.appendChild(arrow('lw-next', 1));
    container.appendChild(wrap);
    renderBadge(container, data);

    // Gentle auto-advance; pauses on hover/touch and stops after manual use.
    var timer = setInterval(function () {
      if (track.matches(':hover')) return;
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      if (track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: 320, behavior: 'smooth' });
    }, 4500);
    function stop() { clearInterval(timer); }
    track.addEventListener('touchstart', stop, { passive: true });
    track.addEventListener('wheel', stop, { passive: true });
  }

  function render(container, data) {
    var themeAttr = (container.getAttribute('data-theme') || 'light').toLowerCase();
    var accent = container.getAttribute('data-accent') || data.wall.accent || '#635bff';
    var layout = (container.getAttribute('data-layout') || 'wall').toLowerCase();
    var max = parseInt(container.getAttribute('data-max'), 10);
    var items = data.testimonials;
    if (max > 0) items = items.slice(0, max);

    function paint(mode) { applyTheme(container, mode, accent); }
    if (themeAttr === 'auto') {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      paint(mq.matches ? 'dark' : 'light');
      if (mq.addEventListener) {
        mq.addEventListener('change', function (e) { paint(e.matches ? 'dark' : 'light'); });
      }
    } else {
      paint(themeAttr === 'dark' ? 'dark' : 'light');
    }

    container.classList.add('lw-wall');
    container.textContent = '';

    if (!items.length) {
      container.appendChild(el('div', 'lw-empty', 'No testimonials yet.'));
      renderBadge(container, data);
      return;
    }
    if (layout === 'carousel') renderCarousel(container, items, data);
    else renderWallLayout(container, items, data);
  }

  function boot() {
    var targets = document.querySelectorAll('[data-testimonials-wall]');
    if (!targets.length) return;
    injectStyles();
    Array.prototype.forEach.call(targets, function (container) {
      if (container.getAttribute('data-lw-loaded')) return;
      container.setAttribute('data-lw-loaded', '1');
      var slug = container.getAttribute('data-testimonials-wall');
      fetch(BASE + '/api/walls/' + encodeURIComponent(slug))
        .then(function (r) {
          if (!r.ok) throw new Error('wall not found');
          return r.json();
        })
        .then(function (data) { render(container, data); })
        .catch(function () {
          container.textContent = '';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
