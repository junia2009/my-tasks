/** Returns YYYY-MM-DD for today in local time. */
export function todayISO(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

export type DueStatus = 'none' | 'overdue' | 'today' | 'soon' | 'normal'

/** Classify a due date relative to today (done tasks should be treated as normal by caller). */
export function dueStatus(dueDate: string): DueStatus {
  if (!dueDate) return 'none'
  const today = todayISO()
  if (dueDate < today) return 'overdue'
  if (dueDate === today) return 'today'

  const due = new Date(dueDate + 'T00:00:00')
  const now = new Date(today + 'T00:00:00')
  const diffDays = Math.round((due.getTime() - now.getTime()) / 86400000)
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

export function formatDue(dueDate: string): string {
  if (!dueDate) return ''
  const [, m, d] = dueDate.split('-')
  return `${Number(m)}/${Number(d)}`
}

/** epoch ms をローカルの YYYY-MM-DD に（タイムライン日付グループのキー）。 */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']

/** 日付キー(YYYY-MM-DD)を「6月15日(月)」形式に。 */
export function formatDayHeading(key: string): string {
  const d = new Date(key + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`
}

/** 日付キー(YYYY-MM-DD)を「今日 / 昨日 / M月D日」の見出しラベルに変換。 */
export function relativeDayLabel(key: string): string {
  const today = todayISO()
  if (key === today) return '今日'
  const yesterday = dayKey(new Date(today + 'T00:00:00').getTime() - 86400000)
  if (key === yesterday) return '昨日'
  const [, m, d] = key.split('-')
  return `${Number(m)}月${Number(d)}日`
}

/**
 * 繰り返しタスクの次回期限を算出（YYYY-MM-DD）。
 * - daily: 基準日の翌日
 * - weekly: 基準日より後で最初に該当曜日になる日（曜日未指定なら同曜日の翌週）
 * 基準日 `from` は元タスクの期限（無ければ完了日＝今日）を渡す。
 */
export function nextDueDate(
  freq: 'daily' | 'weekly',
  weekdays: number[] | undefined,
  from: string,
): string {
  const base = new Date(from + 'T00:00:00').getTime()
  if (freq === 'daily') return dayKey(base + 86400000)
  if (weekdays && weekdays.length > 0) {
    for (let i = 1; i <= 7; i++) {
      const d = base + i * 86400000
      if (weekdays.includes(new Date(d).getDay())) return dayKey(d)
    }
  }
  return dayKey(base + 7 * 86400000)
}
