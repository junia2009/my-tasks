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

/** 深海のアンビエント演出：上方からの光の帯と、ゆっくり立ち上る泡。CSSのみで軽量。 */
export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 光の帯（god rays） */}
      <div className="godrays absolute -top-1/3 left-1/2 h-[80vh] w-[140vw] -translate-x-1/2 blur animate-sheen" />

      {/* 立ち上る泡 */}
      {BUBBLES.map((cls, i) => (
        <span key={i} className={'bubble ' + cls} />
      ))}
    </div>
  )
}
