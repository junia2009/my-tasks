import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { PRIORITY_LABELS } from '../types'
import { dueStatus, formatDue } from '../dateUtils'

interface Props {
  task: Task
  onClick: (task: Task) => void
}

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

const PRIORITY_BAR: Record<Task['priority'], string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
}

export function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  // Done tasks never show due warnings.
  const status = task.column === 'done' ? 'normal' : dueStatus(task.dueDate)
  const dueStyle =
    status === 'overdue'
      ? 'bg-red-100 text-red-700 font-semibold'
      : status === 'today'
        ? 'bg-orange-100 text-orange-700 font-semibold'
        : status === 'soon'
          ? 'bg-yellow-50 text-yellow-700'
          : 'bg-slate-100 text-slate-500'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="group relative cursor-grab overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
    >
      <div className={'absolute inset-y-0 left-0 w-1 ' + PRIORITY_BAR[task.priority]} />
      <div className="pl-1.5">
        <p
          className={
            'text-sm font-medium text-slate-800 dark:text-slate-100 ' +
            (task.column === 'done' ? 'line-through opacity-60' : '')
          }
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={
              'rounded px-1.5 py-0.5 text-[10px] font-bold ' + PRIORITY_STYLE[task.priority]
            }
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.dueDate && (
            <span className={'rounded px-1.5 py-0.5 text-[10px] ' + dueStyle}>
              {status === 'overdue' ? '⚠ ' : '📅 '}
              {formatDue(task.dueDate)}
            </span>
          )}
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
