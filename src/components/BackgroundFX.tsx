interface Bubble {
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

// 泡の配置は props に依存しないため、モジュール読み込み時に一度だけ生成する
// （レンダー中の乱数生成＝不純な計算を避ける）。
const BUBBLES: Bubble[] = Array.from({ length: 14 }, () => ({
  left: rnd(0, 100),
  size: rnd(4, 14),
  duration: rnd(14, 30),
  delay: rnd(0, 18),
  opacity: rnd(0.12, 0.4),
}))

/** 深海のアンビエント演出：上方からの光の帯と、ゆっくり立ち上る泡。CSSのみで軽量。 */
export function BackgroundFX() {
  const bubbles = BUBBLES

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 光の帯（god rays） */}
      <div
        className="absolute -top-1/3 left-1/2 h-[80vh] w-[140vw] -translate-x-1/2 animate-sheen"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(56,224,208,0.10) 12deg, transparent 26deg, rgba(34,211,238,0.08) 40deg, transparent 54deg, rgba(56,224,208,0.10) 70deg, transparent 88deg)',
          filter: 'blur(8px)',
        }}
      />

      {/* 立ち上る泡 */}
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-20px] rounded-full animate-rise"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background:
              'radial-gradient(circle at 35% 30%, rgba(180,255,248,0.9), rgba(52,231,211,0.25) 55%, transparent 70%)',
            boxShadow: '0 0 8px rgba(52,231,211,0.35)',
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            // keyframe 内で参照する個別の最大不透明度
            ['--bubble-opacity' as string]: b.opacity,
          }}
        />
      ))}
    </div>
  )
}
