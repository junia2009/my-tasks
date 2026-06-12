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
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}
