// 泡の見た目（位置・サイズ・速度・遅延・最大不透明度）は Tailwind の
// arbitrary class で表現する。固定文字列なのでビルド時に CSS へコンパイルされ、
// インライン style を使わずに済む（共通の見た目は index.css の .bubble）。
const BUBBLES = [
  'left-[6%] h-[7px] w-[7px] [animation-duration:19s] [animation-delay:0s] [--bubble-opacity:0.28]',
  'left-[15%] h-[5px] w-[5px] [animation-duration:26s] [animation-delay:7s] [--bubble-opacity:0.18]',
  'left-[24%] h-[11px] w-[11px] [animation-duration:22s] [animation-delay:3s] [--bubble-opacity:0.22]',
  'left-[33%] h-[6px] w-[6px] [animation-duration:30s] [animation-delay:12s] [--bubble-opacity:0.16]',
  'left-[42%] h-[9px] w-[9px] [animation-duration:17s] [animation-delay:5s] [--bubble-opacity:0.3]',
  'left-[51%] h-[5px] w-[5px] [animation-duration:24s] [animation-delay:9s] [--bubble-opacity:0.2]',
  'left-[60%] h-[12px] w-[12px] [animation-duration:21s] [animation-delay:1s] [--bubble-opacity:0.24]',
  'left-[69%] h-[7px] w-[7px] [animation-duration:28s] [animation-delay:14s] [--bubble-opacity:0.18]',
  'left-[78%] h-[8px] w-[8px] [animation-duration:18s] [animation-delay:4s] [--bubble-opacity:0.26]',
  'left-[86%] h-[6px] w-[6px] [animation-duration:25s] [animation-delay:10s] [--bubble-opacity:0.2]',
  'left-[92%] h-[10px] w-[10px] [animation-duration:20s] [animation-delay:6s] [--bubble-opacity:0.22]',
  'left-[48%] h-[4px] w-[4px] [animation-duration:32s] [animation-delay:16s] [--bubble-opacity:0.14]',
]

// 魚のシルエット。dir で泳ぐ向き（l=左へ / r=右へ）。負の delay で起動時から
// 画面内に散らばって見えるようにしている。共通スタイルは index.css の .fish。
const FISH = [
  { dir: 'l', cls: 'top-[15%] w-[58px] [animation-duration:46s] [animation-delay:-8s] [--fish-opacity:0.10]' },
  { dir: 'r', cls: 'top-[40%] w-[42px] [animation-duration:60s] [animation-delay:-25s] [--fish-opacity:0.07]' },
  { dir: 'l', cls: 'top-[64%] w-[72px] [animation-duration:54s] [animation-delay:-38s] [--fish-opacity:0.09]' },
  { dir: 'r', cls: 'top-[82%] w-[34px] [animation-duration:68s] [animation-delay:-14s] [--fish-opacity:0.06]' },
]

/** 左向きの魚シルエット（rは水平反転で右向きに）。 */
function FishSilhouette({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 64 28"
      className={'h-auto w-full ' + (flip ? '-scale-x-100' : '')}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 14C14 2 34 2 44 14 34 26 14 26 2 14Z" />
      <path d="M44 14 62 4 57 14 62 24Z" />
    </svg>
  )
}

/** クラゲのシルエット（傘＋触手）。 */
function JellySilhouette() {
  return (
    <svg viewBox="0 0 40 58" className="h-auto w-full" aria-hidden="true">
      <path
        d="M4 20C4 8 36 8 36 20 36 24 30 26 20 26 10 26 4 24 4 20Z"
        fill="currentColor"
      />
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M11 25c-2 8 0 14-1 22" />
        <path d="M20 26c0 9 2 14 0 22" />
        <path d="M29 25c2 8 0 14 1 22" />
      </g>
    </svg>
  )
}

/** 深海のアンビエント演出：上方からの光の帯、立ち上る泡、漂う魚・クラゲ。CSSのみで軽量。 */
export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 光の帯（god rays） */}
      <div className="godrays absolute -top-1/3 left-1/2 h-[80vh] w-[140vw] -translate-x-1/2 blur animate-sheen" />

      {/* 漂う魚 */}
      {FISH.map((f, i) => (
        <span key={i} className={`fish fish-${f.dir} ${f.cls}`}>
          <FishSilhouette flip={f.dir === 'r'} />
        </span>
      ))}

      {/* ゆっくり昇るクラゲ */}
      <span className="jelly left-[80%] w-[32px] [animation-duration:72s] [animation-delay:-30s] [--fish-opacity:0.08]">
        <JellySilhouette />
      </span>

      {/* 立ち上る泡 */}
      {BUBBLES.map((cls, i) => (
        <span key={i} className={'bubble ' + cls} />
      ))}
    </div>
  )
}
