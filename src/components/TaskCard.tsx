import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { PRIORITY_LABELS } from '../types'
import { dueStatus, formatDue } from '../dateUtils'

interface Props {
  task: Task
  onClick: (task: Task) => void
  /** Overlay copy rendered in DragOverlay — no sortable wiring needed. */
  overlay?: boolean
}

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

const PRIORITY_BAR: Record<Task['priority'], string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
}

export function TaskCard({ task, onClick, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }

  // Done tasks never show due warnings.
  const status = task.column === 'done' ? 'normal' : dueStatus(task.dueDate)
  const dueStyle =
    status === 'overdue'
      ? 'bg-red-100 text-red-700 font-semibold dark:bg-red-900/40 dark:text-red-300'
      : status === 'today'
        ? 'bg-orange-100 text-orange-700 font-semibold dark:bg-orange-900/40 dark:text-orange-300'
        : status === 'soon'
          ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      onClick={() => onClick(task)}
      className={
        'group relative flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition active:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:active:bg-slate-700/60 ' +
        (overlay ? 'cursor-grabbing shadow-lg' : 'cursor-pointer hover:shadow-md')
      }
    >
      <div className={'w-1 shrink-0 ' + PRIORITY_BAR[task.priority]} />

      {/* Tappable content area — opens the editor; remains scrollable on touch */}
      <div className="min-w-0 flex-1 py-2.5 pl-2.5">
        <p
          className={
            'break-words text-sm font-medium text-slate-800 dark:text-slate-100 ' +
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
              'rounded px-1.5 py-0.5 text-[11px] font-bold ' + PRIORITY_STYLE[task.priority]
            }
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.dueDate && (
            <span className={'rounded px-1.5 py-0.5 text-[11px] ' + dueStyle}>
              {status === 'overdue' ? '⚠ ' : '📅 '}
              {formatDue(task.dueDate)}
            </span>
          )}
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Dedicated drag handle — only this initiates a drag, so the list stays
          scrollable and the card body stays tappable on touch devices. */}
      <button
        type="button"
        aria-label="ドラッグして移動"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex w-9 shrink-0 cursor-grab touch-none items-center justify-center self-stretch text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="3" r="1.4" />
          <circle cx="11" cy="3" r="1.4" />
          <circle cx="5" cy="8" r="1.4" />
          <circle cx="11" cy="8" r="1.4" />
          <circle cx="5" cy="13" r="1.4" />
          <circle cx="11" cy="13" r="1.4" />
        </svg>
      </button>
    </div>
  )
}
