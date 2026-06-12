export type ColumnId = 'todo' | 'in-progress' | 'done'

export type Priority = 'high' | 'medium' | 'low'

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
