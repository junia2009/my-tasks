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
    <div className="flex w-full flex-col rounded-xl bg-slate-200/60 md:w-80 md:shrink-0">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
          {column.title}
          <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => onAdd(column.id)}
          className="rounded-md px-2 py-1 text-lg leading-none text-slate-500 hover:bg-slate-300/70"
          title="タスクを追加"
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={
          'flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg px-3 pb-3 transition ' +
          (isOver ? 'bg-blue-100/50' : '')
        }
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onCardClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="select-none py-6 text-center text-xs text-slate-400">タスクなし</p>
        )}
      </div>
    </div>
  )
}
