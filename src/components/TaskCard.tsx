import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ColumnId, Task } from '../types'
import { COLUMNS, NEXT_COLUMN, PREV_COLUMN, PRIORITY_LABELS } from '../types'
import { dueStatus, formatDue } from '../dateUtils'

interface Props {
  task: Task
  onClick: (task: Task) => void
  onMove?: (task: Task, target: ColumnId) => void
  /** Overlay copy rendered in DragOverlay — no sortable wiring needed. */
  overlay?: boolean
}

// 発光ドット（優先度）
const PRIORITY_DOT: Record<Task['priority'], string> = {
  high: 'bg-rose-400 shadow-[0_0_10px_2px_rgba(251,113,133,0.7)]',
  medium: 'bg-amber-300 shadow-[0_0_10px_2px_rgba(252,211,77,0.6)]',
  low: 'bg-lume shadow-[0_0_10px_2px_rgba(52,231,211,0.6)]',
}

const PRIORITY_TEXT: Record<Task['priority'], string> = {
  high: 'text-rose-300',
  medium: 'text-amber-200',
  low: 'text-lume-soft',
}

const columnTitle = (id: ColumnId) => COLUMNS.find((c) => c.id === id)?.title ?? ''

export function TaskCard({ task, onClick, onMove, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: overlay })

  // transform / transition は @dnd-kit がドラッグ中に毎フレーム更新する動的値で、
  // 静的な CSS クラスにはできない（ライブラリ標準のパターン）。それ以外の見た目は
  // className 側に寄せている。
  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition }

  const isDone = task.column === 'done'
  const status = isDone ? 'normal' : dueStatus(task.dueDate)
  const dueStyle =
    status === 'overdue'
      ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
      : status === 'today'
        ? 'bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/30'
        : status === 'soon'
          ? 'bg-amber-300/10 text-amber-200'
          : 'bg-white/5 text-slate-400'

  const next = NEXT_COLUMN[task.column]
  const prev = PREV_COLUMN[task.column]

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      onClick={() => onClick(task)}
      className={
        'group relative flex shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-md transition ' +
        (overlay
          ? 'cursor-grabbing shadow-glow ring-1 ring-lume/40'
          : 'cursor-pointer shadow-card active:bg-white/[0.1]') +
        (isDragging ? ' opacity-[0.35]' : '')
      }
    >
      {/* 左端の発光アクセント */}
      <div className="flex w-9 shrink-0 flex-col items-center justify-start pt-4">
        <span className={'h-2.5 w-2.5 rounded-full ' + PRIORITY_DOT[task.priority]} />
      </div>

      {/* 本文（タップで編集） */}
      <div className="min-w-0 flex-1 py-3 pr-2">
        <p
          className={
            'break-words text-[15px] font-medium leading-snug ' +
            (isDone ? 'text-slate-400 line-through' : 'text-slate-50')
          }
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {task.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={'text-[11px] font-semibold ' + PRIORITY_TEXT[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.dueDate && (
            <span className={'rounded-md px-1.5 py-0.5 text-[11px] ' + dueStyle}>
              {status === 'overdue' ? '⚠ ' : '🜨 '}
              {formatDue(task.dueDate)}
            </span>
          )}
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-lume/10 px-1.5 py-0.5 text-[11px] text-lume-soft ring-1 ring-lume/15"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* クイック移動（列をまたぐ操作はここで確実に） */}
        {!overlay && onMove && (
          <div className="mt-2.5 flex items-center gap-2">
            {prev && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove(task, prev)
                }}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition active:bg-white/10"
              >
                ← {columnTitle(prev)}
              </button>
            )}
            {next && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove(task, next)
                }}
                className="rounded-lg border border-lume/30 bg-lume/10 px-2 py-1 text-[11px] font-medium text-lume-soft shadow-glow-sm transition active:bg-lume/20"
              >
                {columnTitle(next)} →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ドラッグハンドル（並べ替え専用。ここだけがドラッグを開始する） */}
      <button
        type="button"
        aria-label="ドラッグして並べ替え"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex w-10 shrink-0 cursor-grab touch-none items-center justify-center self-stretch text-slate-500 transition hover:text-lume-soft active:cursor-grabbing"
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
