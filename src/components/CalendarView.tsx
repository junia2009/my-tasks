import { useMemo, useState } from 'react'
import type { Task } from '../types'
import { WEEKDAY_LABELS } from '../types'
import { dayKey, todayISO } from '../dateUtils'

// 日セルのドット色（優先度）
const PRIORITY_DOT: Record<Task['priority'], string> = {
  high: 'bg-rose-400',
  medium: 'bg-amber-300',
  low: 'bg-lume',
}

interface Props {
  /** 期限ドット表示の対象（未完了＋フィルタ済みを想定） */
  tasks: Task[]
  selectedDay: string
  onSelectDay: (day: string) => void
}

/** 月グリッドのカレンダー。各日に期限タスクをドット表示し、タップで日を選択する。 */
export function CalendarView({ tasks, selectedDay, onSelectDay }: Props) {
  // 表示中の月（選択日の月を初期表示）
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selectedDay + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const today = todayISO()

  // 期限日 → その日のタスク
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.dueDate) continue
      const arr = map.get(t.dueDate)
      if (arr) arr.push(t)
      else map.set(t.dueDate, [t])
    }
    return map
  }, [tasks])

  // 月初の週頭から 6 週ぶん（42 セル）= 高さが安定する
  const cells = useMemo(() => {
    const startWeekday = new Date(cursor.year, cursor.month, 1).getDay()
    return Array.from({ length: 42 }, (_, i) =>
      new Date(cursor.year, cursor.month, 1 - startWeekday + i),
    )
  }, [cursor])

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const m = c.month + delta
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  function goToday() {
    const d = new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    onSelectDay(today)
  }

  const navBtn =
    'flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition active:bg-white/10'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md">
      {/* 月ヘッダー */}
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="前の月" className={navBtn}>
          ◀
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-100">
            {cursor.year}年 {cursor.month + 1}月
          </span>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 transition active:bg-white/10"
          >
            今日
          </button>
        </div>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="次の月" className={navBtn}>
          ▶
        </button>
      </div>

      {/* 曜日見出し */}
      <div className="grid grid-cols-7 text-center text-[10px]">
        {WEEKDAY_LABELS.map((w, i) => (
          <div
            key={w}
            className={i === 0 ? 'text-rose-300/60' : i === 6 ? 'text-lume-soft/50' : 'text-slate-500'}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日グリッド */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const key = dayKey(d.getTime())
          const inMonth = d.getMonth() === cursor.month
          const isToday = key === today
          const isSelected = key === selectedDay
          const dayTasks = tasksByDay.get(key) ?? []
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={
                'flex aspect-square flex-col items-center rounded-lg py-1 text-xs transition ' +
                (isSelected ? 'bg-lume/15 ring-1 ring-lume/40 ' : 'active:bg-white/5 ') +
                (inMonth ? 'text-slate-200' : 'text-slate-600')
              }
            >
              <span
                className={
                  'flex h-5 w-5 items-center justify-center rounded-full ' +
                  (isToday ? 'bg-lume/30 font-semibold text-lume-soft' : '')
                }
              >
                {d.getDate()}
              </span>
              <span className="mt-0.5 flex h-1.5 items-center justify-center gap-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <span key={t.id} className={'h-1 w-1 rounded-full ' + PRIORITY_DOT[t.priority]} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
