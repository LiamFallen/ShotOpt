/* Lovewall embed — renders a testimonial wall into any page, iframe-free.
 *
 * Usage:
 *   <div data-testimonials-wall="your-slug" data-theme="light"></div>
 *   <script src="https://your-host/embed.js" async></script>
 *
 * Attributes on the div:
 *   data-testimonials-wall  wall slug (required)
 *   data-theme              "light" | "dark" | "auto" (default: auto)
 *   data-accent             optional #hex override of the wall's accent colour
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var BASE = new URL(script.src, location.href).origin;
  var STAR = 'M12 2l2.9 6.26 6.86.72-5.12 4.62 1.43 6.73L12 16.9l-6.07 3.43 1.43-6.73L2.24 8.98l6.86-.72z';
  var PLAY = 'M8 5v14l11-7z';

  var THEMES = {
    light: { bg: 'transparent', card: '#ffffff', text: '#18181b', muted: '#71717a', border: '#e4e4e7' },
    dark: { bg: 'transparent', card: '#1a1a21', text: '#f4f4f5', muted: '#a1a1aa', border: '#2a2a33' },
  };

  function injectStyles() {
    if (document.getElementById('lw-embed-css')) return;
    var css =
      '.lw-wall{font-family:inherit;color:var(--lw-text);line-height:1.5;columns:3 280px;column-gap:16px}' +
      '.lw-card{break-inside:avoid;margin:0 0 16px;background:var(--lw-card);border:1px solid var(--lw-border);border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)}' +
      '.lw-head{display:flex;align-items:center;gap:12px;margin-bottom:10px}' +
      '.lw-avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;background:var(--lw-border)}' +
      '.lw-initials{display:flex;align-items:center;justify-content:center;color:#fff;background:var(--lw-accent);font-weight:600;font-size:16px}' +
      '.lw-name{font-weight:600;font-size:15px;color:var(--lw-text)}' +
      '.lw-name a{color:inherit;text-decoration:none}.lw-name a:hover{text-decoration:underline}' +
      '.lw-role{color:var(--lw-muted);font-size:13px}' +
      '.lw-stars{display:inline-flex;gap:2px;margin-bottom:8px}.lw-stars svg{width:15px;height:15px}' +
      '.lw-text{margin:0;font-size:15px;white-space:pre-line;overflow-wrap:anywhere;color:var(--lw-text)}' +
      '.lw-video{margin-top:12px;border-radius:10px;overflow:hidden;position:relative;aspect-ratio:16/9;background:#000}' +
      '.lw-video iframe,.lw-video img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}' +
      '.lw-video button{position:absolute;inset:0;width:100%;height:100%;background:rgba(0,0,0,.25);border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}' +
      '.lw-video button:hover{background:rgba(0,0,0,.4)}' +
      '.lw-play{width:52px;height:52px;border-radius:50%;background:var(--lw-accent);display:flex;align-items:center;justify-content:center}' +
      '.lw-play svg{width:20px;height:20px;fill:#fff;margin-left:3px}' +
      '.lw-badge{margin-top:16px;text-align:center}' +
      '.lw-badge a{display:inline-block;font-size:12px;color:var(--lw-muted);border:1px solid var(--lw-border);border-radius:999px;padding:5px 14px;text-decoration:none;background:var(--lw-card)}' +
      '.lw-empty{color:var(--lw-muted);font-size:14px;text-align:center;padding:24px;border:1px dashed var(--lw-border);border-radius:12px}';
    var el = document.createElement('style');
    el.id = 'lw-embed-css';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function svg(pathD, fill) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', pathD);
    if (fill) p.setAttribute('fill', fill);
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

  function applyTheme(container, mode, colors) {
    var t = THEMES[mode] || THEMES.light;
    container.style.setProperty('--lw-card', t.card);
    container.style.setProperty('--lw-text', t.text);
    container.style.setProperty('--lw-muted', t.muted);
    container.style.setProperty('--lw-border', t.border);
    container.style.setProperty('--lw-accent', colors.accent);
    container.style.setProperty('--lw-star', '#f59e0b');
  }

  function renderCard(t) {
    var card = el('article', 'lw-card');
    var head = el('div', 'lw-head');

    if (t.avatar) {
      var img = el('img', 'lw-avatar');
      img.src = t.avatar;
      img.alt = '';
      img.loading = 'lazy';
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
      stars.appendChild(svg(STAR, i <= t.rating ? 'var(--lw-star)' : 'var(--lw-border)'));
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
        box.appendChild(thumb);
      }
      var btn = el('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Play video testimonial');
      var play = el('span', 'lw-play');
      play.appendChild(svg(PLAY));
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

  function render(container, data) {
    var themeAttr = (container.getAttribute('data-theme') || 'auto').toLowerCase();
    var accent = container.getAttribute('data-accent') || data.wall.accent || '#6366f1';

    function paint(mode) {
      applyTheme(container, mode, { accent: accent });
    }
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

    if (!data.testimonials.length) {
      container.appendChild(el('div', 'lw-empty', 'No testimonials yet.'));
    } else {
      data.testimonials.forEach(function (t) {
        container.appendChild(renderCard(t));
      });
    }

    if (!data.wall.hideBadge) {
      var badge = el('div', 'lw-badge');
      var a = el('a', null, 'Powered by ' + data.product.name);
      a.href = data.product.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      badge.appendChild(a);
      container.appendChild(badge);
    }
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
