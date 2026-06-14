export type ColumnId = 'todo' | 'in-progress' | 'done'

export type Priority = 'high' | 'medium' | 'low'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export type RecurrenceFreq = 'daily' | 'weekly'

export interface Recurrence {
  freq: RecurrenceFreq
  /** weekly のときの対象曜日（0=日 … 6=土）。空配列なら同じ曜日の翌週。 */
  weekdays?: number[]
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  /** ISO date string (YYYY-MM-DD) or empty string when unset */
  dueDate: string
  tags: string[]
  column: ColumnId
  /** ordering within a column; lower comes first */
  order: number
  createdAt: number
  /** epoch ms when moved to done; undefined while not completed */
  completedAt?: number
  subtasks?: Subtask[]
  /** 繰り返し設定。done にすると次回分を自動生成する */
  recurrence?: Recurrence
}

/** 曜日ラベル（index = getDay() の 0..6）。 */
export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

/** 未完了列での表示順。完了列は常に完了日時の新しい順（タイムライン）。 */
export type SortMode = 'manual' | 'due' | 'priority'

export const SORT_LABELS: Record<SortMode, string> = {
  manual: '手動',
  due: '期限順',
  priority: '優先度順',
}

/** 優先度の並べ替え用ランク（小さいほど先＝高優先）。 */
export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export interface Column {
  id: ColumnId
  title: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: '未着手' },
  { id: 'in-progress', title: '進行中' },
  { id: 'done', title: '完了' },
]

/** ステータスを1つ進める／戻す先（深海の流れ：未着手→進行中→完了）。 */
export const NEXT_COLUMN: Record<ColumnId, ColumnId | null> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: null,
}
export const PREV_COLUMN: Record<ColumnId, ColumnId | null> = {
  todo: null,
  'in-progress': 'todo',
  done: 'in-progress',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}
