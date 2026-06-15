import { useEffect, useMemo } from 'react'
import type { Task } from '../types'
import { WEEKDAY_LABELS } from '../types'
import { dayKey, todayISO } from '../dateUtils'

interface Props {
  tasks: Task[]
  onClose: () => void
}

/** 完了実績（completedAt）をもとにした振り返りシート。 */
export function StatsModal({ tasks, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const stats = useMemo(() => {
    // 完了日ごとの件数
    const byDay = new Map<string, number>()
    let total = 0
    for (const t of tasks) {
      if (typeof t.completedAt === 'number') {
        total++
        const k = dayKey(t.completedAt)
        byDay.set(k, (byDay.get(k) ?? 0) + 1)
      }
    }

    const today = todayISO()
    const todayTs = new Date(today + 'T00:00:00').getTime()

    // 連続達成日数。今日が未完了でも昨日まで続いていれば継続中とみなす。
    let streak = 0
    let cursor = todayTs
    if (!byDay.has(dayKey(cursor))) cursor -= 86400000
    while (byDay.has(dayKey(cursor))) {
      streak++
      cursor -= 86400000
    }

    // 直近7日（古い→新しい）
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const ts = todayTs - (6 - i) * 86400000
      const k = dayKey(ts)
      return {
        key: k,
        count: byDay.get(k) ?? 0,
        weekday: WEEKDAY_LABELS[new Date(ts).getDay()],
        isToday: k === today,
      }
    })
    const week = last7.reduce((n, d) => n + d.count, 0)
    const max = Math.max(1, ...last7.map((d) => d.count))
    return { total, streak, last7, week, max }
  }, [tasks])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss-950/70 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[88dvh] w-full max-w-md animate-sheet-up overflow-y-auto rounded-3xl border border-white/10 bg-abyss-800/85 px-6 pt-5 pb-6 shadow-glow backdrop-blur-xl sm:px-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
        <h2 className="mb-5 text-lg font-semibold text-slate-50">振り返り</h2>

        {/* 数値カード */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="連続日数" value={stats.streak} unit="日" accent="text-orange-300" flame />
          <StatCard label="直近7日" value={stats.week} unit="件" accent="text-lume-soft" />
          <StatCard label="累計" value={stats.total} unit="件" accent="text-slate-100" />
        </div>

        {/* 直近7日の完了グラフ */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-lume-soft/70">
            直近7日の完了
          </p>
          <div className="flex h-28 items-end justify-between gap-1.5">
            {stats.last7.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-slate-400">{d.count || ''}</span>
                <div className="flex w-full flex-1 items-end">
                  {/* バー高さは動的値のためインライン指定 */}
                  <div
                    className={'w-full rounded-t-md ' + (d.isToday ? 'bg-lume/70' : 'bg-lume/30')}
                    style={{ height: `${(d.count / stats.max) * 100}%` }}
                  />
                </div>
                <span className={'text-[10px] ' + (d.isToday ? 'text-lume-soft' : 'text-slate-500')}>
                  {d.weekday}
                </span>
              </div>
            ))}
          </div>
        </div>

        {stats.total === 0 && (
          <p className="mt-4 text-center text-xs text-slate-500">
            まだ完了したタスクがありません。完了するとここに実績が貯まります。
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition active:bg-white/5"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  accent,
  flame = false,
}: {
  label: string
  value: number
  unit: string
  accent: string
  flame?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-3 text-center">
      <div className={'text-2xl font-semibold tabular-nums ' + accent}>
        {flame && value > 0 ? '🔥' : ''}
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{label}</div>
    </div>
  )
}
