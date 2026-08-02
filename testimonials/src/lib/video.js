// Parse a YouTube / Vimeo / Loom URL into an embeddable descriptor.
// Returns { provider, id, embedUrl, thumbUrl } or null if unsupported.
export function parseVideoUrl(raw) {
  if (!raw) return null;
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^www\./, '');
  const safeId = (s) => (/^[\w-]{3,64}$/.test(s) ? s : null);

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    let id = null;
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2];
    else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2];
    id = id && safeId(id);
    if (!id) return null;
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
      thumbUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (host === 'youtu.be') {
    const id = safeId(url.pathname.slice(1).split('/')[0]);
    if (!id) return null;
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
      thumbUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = url.pathname.match(/(\d{6,12})/);
    if (!m) return null;
    return {
      provider: 'vimeo',
      id: m[1],
      embedUrl: `https://player.vimeo.com/video/${m[1]}?autoplay=1`,
      thumbUrl: `https://vumbnail.com/${m[1]}.jpg`,
    };
  }
  if (host === 'loom.com') {
    const m = url.pathname.match(/^\/(?:share|embed)\/([a-f0-9]{16,64})/);
    if (!m) return null;
    return {
      provider: 'loom',
      id: m[1],
      embedUrl: `https://www.loom.com/embed/${m[1]}?autoplay=1`,
      thumbUrl: '',
    };
  }
  return null;
}
