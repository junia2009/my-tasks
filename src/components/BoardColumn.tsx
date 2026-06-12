import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column, Task } from '../types'
import { TaskCard } from './TaskCard'

interface Props {
  column: Column
  tasks: Task[]
  onCardClick: (task: Task) => void
  onAdd: (columnId: Column['id']) => void
}

export function BoardColumn({ column, tasks, onCardClick, onAdd }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex h-full w-[82vw] shrink-0 snap-start flex-col rounded-xl bg-slate-200/60 dark:bg-slate-800/60 sm:w-72 sm:shrink md:w-80">
      <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          {column.title}
          <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {tasks.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => onAdd(column.id)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-2xl leading-none text-slate-500 hover:bg-slate-300/70 dark:text-slate-400 dark:hover:bg-slate-700"
          title="タスクを追加"
          aria-label={`${column.title} にタスクを追加`}
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={
          'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-lg px-3 pb-3 transition ' +
          (isOver ? 'bg-blue-100/50 dark:bg-blue-900/30' : '')
        }
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onCardClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="select-none py-6 text-center text-xs text-slate-400 dark:text-slate-500">
            タスクなし
          </p>
        )}
      </div>
    </div>
  )
}
