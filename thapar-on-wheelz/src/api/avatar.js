/**
 * Generates a deterministic gradient avatar with initials and geometric doodles.
 * Works 100% offline and requires no backend or external API calls.
 */
export function getAvatarSvg(username = '') {
  const cleanUsername = String(username || 'User');
  let hash = 0;
  for (let i = 0; i < cleanUsername.length; i++) {
    hash = cleanUsername.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Premium, harmonious gradients
  const gradients = [
    ['#8c0623', '#ea760a'], // Crimson -> Orange
    ['#0f172a', '#38bdf8'], // Slate -> Sky
    ['#065f46', '#34d399'], // Emerald -> Mint
    ['#1e3a8a', '#60a5fa'], // Cobalt -> Light Blue
    ['#581c87', '#c084fc'], // Purple -> Lavender
    ['#7c2d12', '#fb923c'], // Rust -> Peach
    ['#0369a1', '#0ea5e9'], // Ocean -> Light Blue
    ['#831843', '#f472b6']  // Rose -> Pink
  ];

  const palette = gradients[Math.abs(hash) % gradients.length];
  const shapeIndex = Math.abs(hash) % 4;
  let doodles = '';

  // Deterministic professional background doodles
  if (shapeIndex === 0) {
    doodles = `
      <circle cx="25" cy="25" r="14" fill="rgba(255,255,255,0.08)" />
      <circle cx="75" cy="75" r="22" fill="rgba(255,255,255,0.06)" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
    `;
  } else if (shapeIndex === 1) {
    doodles = `
      <rect x="15" y="15" width="30" height="30" rx="8" fill="rgba(255,255,255,0.06)" transform="rotate(45 30 30)" />
      <rect x="60" y="60" width="25" height="25" rx="6" fill="rgba(255,255,255,0.08)" transform="rotate(15 72 72)" />
    `;
  } else if (shapeIndex === 2) {
    doodles = `
      <path d="M50 15 L85 75 L15 75 Z" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
      <circle cx="50" cy="55" r="12" fill="rgba(255,255,255,0.08)" />
    `;
  } else {
    doodles = `
      <circle cx="30" cy="50" r="20" fill="rgba(255,255,255,0.06)" />
      <circle cx="70" cy="50" r="20" fill="rgba(255,255,255,0.08)" />
    `;
  }

  // Generate 2 initials safely
  const parts = cleanUsername.split('@')[0].split(/[._-]/);
  let initials = '';
  if (parts.length > 1) {
    initials = (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  } else {
    initials = cleanUsername.substring(0, 2).toUpperCase();
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad-${Math.abs(hash)})" />
      ${doodles}
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="34" fill="#ffffff" style="letter-spacing: -1px; opacity: 0.95;">
        ${initials}
      </text>
    </svg>
  `.trim().replace(/\s+/g, ' ');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
