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

type CreatureType = 'fishA' | 'fishB' | 'angler'

// 横方向に漂う生物。dir で泳ぐ向き（l=左へ / r=右へ）。負の delay で起動時から
// 画面内に散らばって見えるようにしている。共通スタイルは index.css の .fish。
const CREATURES: { type: CreatureType; dir: 'l' | 'r'; cls: string }[] = [
  // 大きめの魚
  { type: 'fishA', dir: 'l', cls: 'top-[13%] w-[58px] [animation-duration:46s] [animation-delay:-8s] [--fish-opacity:0.10]' },
  { type: 'fishA', dir: 'l', cls: 'top-[60%] w-[72px] [animation-duration:54s] [animation-delay:-38s] [--fish-opacity:0.09]' },
  { type: 'fishB', dir: 'r', cls: 'top-[26%] w-[44px] [animation-duration:50s] [animation-delay:-20s] [--fish-opacity:0.08]' },
  { type: 'fishB', dir: 'l', cls: 'top-[88%] w-[36px] [animation-duration:58s] [animation-delay:-12s] [--fish-opacity:0.07]' },
  // 小魚の群れ（近い高さ・同方向・少しずつ遅延をずらす）
  { type: 'fishB', dir: 'r', cls: 'top-[46%] w-[22px] [animation-duration:42s] [animation-delay:-5s] [--fish-opacity:0.07]' },
  { type: 'fishB', dir: 'r', cls: 'top-[50%] w-[20px] [animation-duration:42s] [animation-delay:-7s] [--fish-opacity:0.06]' },
  { type: 'fishB', dir: 'r', cls: 'top-[53%] w-[24px] [animation-duration:42s] [animation-delay:-3s] [--fish-opacity:0.07]' },
  { type: 'fishA', dir: 'r', cls: 'top-[72%] w-[30px] [animation-duration:48s] [animation-delay:-28s] [--fish-opacity:0.06]' },
  { type: 'fishA', dir: 'r', cls: 'top-[34%] w-[50px] [animation-duration:56s] [animation-delay:-30s] [--fish-opacity:0.08]' },
  // チョウチンアンコウ風（発光ルアー付き。やや見えやすく）
  { type: 'angler', dir: 'l', cls: 'top-[78%] w-[58px] [animation-duration:66s] [animation-delay:-50s] [--fish-opacity:0.13]' },
]

// 漂うクラゲ
const JELLIES = [
  'left-[80%] w-[32px] [animation-duration:72s] [animation-delay:-30s] [--fish-opacity:0.08]',
  'left-[22%] w-[24px] [animation-duration:88s] [animation-delay:-55s] [--fish-opacity:0.06]',
]

/** 細身の魚（左向き。flip で右向き）。 */
function FishA({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 64 28" className={'h-auto w-full ' + (flip ? '-scale-x-100' : '')} fill="currentColor" aria-hidden="true">
      <path d="M2 14C14 2 34 2 44 14 34 26 14 26 2 14Z" />
      <path d="M44 14 62 4 57 14 62 24Z" />
    </svg>
  )
}

/** 体高のある魚（背びれ付き。左向き、flip で右向き）。 */
function FishB({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 48 34" className={'h-auto w-full ' + (flip ? '-scale-x-100' : '')} fill="currentColor" aria-hidden="true">
      <path d="M18 7 23 1 27 8Z" />
      <path d="M4 18C10 7 26 5 34 11 40 15 40 21 34 25 26 31 10 29 4 18Z" />
      <path d="M34 18 47 10 43 18 47 26Z" />
    </svg>
  )
}

/** チョウチンアンコウ風（丸い体＋発光ルアー。左向き、flip で右向き）。 */
function Angler({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 52 36" className={'h-auto w-full ' + (flip ? '-scale-x-100' : '')} aria-hidden="true">
      {/* 体・尾 */}
      <g fill="currentColor">
        <path d="M16 18C16 8 30 6 40 12 46 16 46 20 40 24 30 30 16 28 16 18Z" />
        <path d="M40 18 51 12 48 18 51 24Z" />
      </g>
      {/* ルアーの竿 */}
      <path d="M20 9C16 4 11 4 8 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* 発光する誘引突起：にじむ光暈＋明滅する芯（.lure で発光） */}
      <g className="lure">
        <circle cx="7" cy="6" r="5.5" fill="#7ff0e6" opacity="0.35" />
        <circle cx="7" cy="6" r="2.6" fill="#eafffb" />
      </g>
    </svg>
  )
}

/** クラゲ（傘＋触手）。 */
function Jelly() {
  return (
    <svg viewBox="0 0 40 58" className="h-auto w-full" aria-hidden="true">
      <path d="M4 20C4 8 36 8 36 20 36 24 30 26 20 26 10 26 4 24 4 20Z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M11 25c-2 8 0 14-1 22" />
        <path d="M20 26c0 9 2 14 0 22" />
        <path d="M29 25c2 8 0 14 1 22" />
      </g>
    </svg>
  )
}

function Creature({ type, flip }: { type: CreatureType; flip: boolean }) {
  switch (type) {
    case 'fishB':
      return <FishB flip={flip} />
    case 'angler':
      return <Angler flip={flip} />
    default:
      return <FishA flip={flip} />
  }
}

/** 深海のアンビエント演出：光の帯、立ち上る泡、漂う魚・アンコウ・クラゲ。CSSのみで軽量。 */
export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 光の帯（god rays） */}
      <div className="godrays absolute -top-1/3 left-1/2 h-[80vh] w-[140vw] -translate-x-1/2 blur animate-sheen" />

      {/* 漂う生物 */}
      {CREATURES.map((c, i) => (
        <span key={i} className={`fish fish-${c.dir} ${c.cls}`}>
          <Creature type={c.type} flip={c.dir === 'r'} />
        </span>
      ))}

      {/* ゆっくり昇るクラゲ */}
      {JELLIES.map((cls, i) => (
        <span key={i} className={'jelly ' + cls}>
          <Jelly />
        </span>
      ))}

      {/* 立ち上る泡 */}
      {BUBBLES.map((cls, i) => (
        <span key={i} className={'bubble ' + cls} />
      ))}
    </div>
  )
}
