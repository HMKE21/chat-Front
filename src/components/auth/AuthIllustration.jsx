/**
 * Hero artwork for the auth screens: two chat bubbles, a video tile and a
 * call button floating together. Pure inline SVG, themed with CSS variables
 * (--pa-*), so it follows light / dark automatically.
 */
export default function AuthIllustration() {
  return (
    <svg className="pa-art" viewBox="0 0 400 360" role="img" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="paBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2B7BFF" /><stop offset="1" stopColor="#1250C8" />
        </linearGradient>
        <linearGradient id="paCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3CD0F5" /><stop offset="1" stopColor="#1A8FE0" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="185" r="150" fill="var(--pa-azure-50)" opacity=".7" />
      {/* video tile */}
      <rect x="196" y="40" width="170" height="116" rx="22" fill="var(--pa-surface)" stroke="var(--pa-line)" />
      <rect x="208" y="52" width="146" height="92" rx="14" fill="#0B1B4D" />
      <circle cx="281" cy="88" r="17" fill="url(#paCyan)" />
      <path d="M250 134c4-17 16-24 31-24s27 7 31 24z" fill="url(#paCyan)" />
      <circle cx="340" cy="64" r="5" fill="#19B573" />
      {/* incoming bubble */}
      <path d="M44 120a24 24 0 0 1 24-24h104a24 24 0 0 1 24 24v36a24 24 0 0 1-24 24H92l-30 22v-22h-4a24 24 0 0 1-14-22z" fill="var(--pa-surface)" stroke="var(--pa-line)" />
      <rect x="66" y="118" width="96" height="9" rx="4.5" fill="var(--pa-line-2)" />
      <rect x="66" y="138" width="62" height="9" rx="4.5" fill="var(--pa-line)" />
      {/* outgoing bubble */}
      <path d="M356 196a24 24 0 0 0-24-24H152a24 24 0 0 0-24 24v40a24 24 0 0 0 24 24h160l36 24v-24a24 24 0 0 0 8-18z" fill="url(#paBlue)" />
      <rect x="152" y="196" width="128" height="9" rx="4.5" fill="#fff" opacity=".9" />
      <rect x="152" y="216" width="84" height="9" rx="4.5" fill="#fff" opacity=".55" />
      {/* call button */}
      <circle cx="96" cy="288" r="30" fill="#19B573" />
      <path d="M86 276c-2 0-4 2-3 6 3 12 12 21 24 24 4 1 6-1 6-3v-5l-8-3-4 4c-5-2-9-6-11-11l4-4-3-8z" fill="#fff" />
      <circle cx="96" cy="288" r="40" fill="none" stroke="#19B573" strokeOpacity=".3" />
    </svg>
  );
}
