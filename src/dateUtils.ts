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

/** 日付キー(YYYY-MM-DD)を「今日 / 昨日 / M月D日」の見出しラベルに変換。 */
export function relativeDayLabel(key: string): string {
  const today = todayISO()
  if (key === today) return '今日'
  const yesterday = dayKey(new Date(today + 'T00:00:00').getTime() - 86400000)
  if (key === yesterday) return '昨日'
  const [, m, d] = key.split('-')
  return `${Number(m)}月${Number(d)}日`
}
