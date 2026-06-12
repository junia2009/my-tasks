import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { BoardColumn } from './components/BoardColumn'
import { TaskCard } from './components/TaskCard'
import { TaskModal } from './components/TaskModal'
import { useLocalStorage } from './useLocalStorage'
import { useTheme } from './useTheme'
import { COLUMNS, type ColumnId, type Priority, type Task } from './types'
import { dueStatus, todayISO } from './dateUtils'

const STORAGE_KEY = 'kanban.tasks.v1'

function seed(): Task[] {
  const now = Date.now()
  return [
    {
      id: crypto.randomUUID(),
      title: 'ようこそ！カードをクリックして編集できます',
      description: 'カードはドラッグ＆ドロップで列の間を移動できます。',
      priority: 'medium',
      dueDate: '',
      tags: ['ヒント'],
      column: 'todo',
      order: 0,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'ステージング環境にデプロイ',
      description: '',
      priority: 'high',
      dueDate: todayISO(),
      tags: ['infra'],
      column: 'in-progress',
      order: 0,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'ユニットテストを書く',
      description: '',
      priority: 'low',
      dueDate: '',
      tags: ['test'],
      column: 'done',
      order: 0,
      createdAt: now,
    },
  ]
}

type PriorityFilter = 'all' | Priority

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, seed())
  const { theme, toggle } = useTheme()

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')

  const [modalTask, setModalTask] = useState<Task | null>(null)
  const [modalColumn, setModalColumn] = useState<ColumnId | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [tasks])

  const overdueCount = useMemo(
    () =>
      tasks.filter((t) => t.column !== 'done' && dueStatus(t.dueDate) === 'overdue').length,
    [tasks],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (tagFilter !== 'all' && !t.tags.includes(tagFilter)) return false
      if (q) {
        const haystack = (t.title + ' ' + t.description + ' ' + t.tags.join(' ')).toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [tasks, search, priorityFilter, tagFilter])

  const tasksByColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = { todo: [], 'in-progress': [], done: [] }
    filtered.forEach((t) => map[t.column].push(t))
    ;(Object.keys(map) as ColumnId[]).forEach((col) =>
      map[col].sort((a, b) => a.order - b.order),
    )
    return map
  }, [filtered])

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null

  function openCreate(columnId: ColumnId) {
    setModalColumn(columnId)
    setModalTask(null)
  }

  function handleSave(data: {
    title: string
    description: string
    priority: Priority
    dueDate: string
    tags: string[]
  }) {
    if (modalTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === modalTask.id ? { ...t, ...data } : t)),
      )
    } else if (modalColumn) {
      const maxOrder = tasks
        .filter((t) => t.column === modalColumn)
        .reduce((m, t) => Math.max(m, t.order), -1)
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...data,
        column: modalColumn,
        order: maxOrder + 1,
        createdAt: Date.now(),
      }
      setTasks((prev) => [...prev, newTask])
    }
    closeModal()
  }

  function handleDelete() {
    if (modalTask) {
      setTasks((prev) => prev.filter((t) => t.id !== modalTask.id))
    }
    closeModal()
  }

  function closeModal() {
    setModalTask(null)
    setModalColumn(null)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const activeTaskId = active.id as string
    const overId = over.id as string
    if (activeTaskId === overId) return

    setTasks((prev) => {
      const dragged = prev.find((t) => t.id === activeTaskId)
      if (!dragged) return prev

      const overTask = prev.find((t) => t.id === overId)
      const targetColumn: ColumnId = overTask
        ? overTask.column
        : COLUMNS.some((c) => c.id === overId)
          ? (overId as ColumnId)
          : dragged.column

      const columnIds = prev
        .filter((t) => t.column === targetColumn && t.id !== activeTaskId)
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id)

      let insertIndex = columnIds.length
      if (overTask && overTask.id !== activeTaskId) {
        const idx = columnIds.indexOf(overId)
        if (idx >= 0) insertIndex = idx
      }
      columnIds.splice(insertIndex, 0, activeTaskId)

      return prev.map((t) => {
        if (t.id === activeTaskId) {
          return { ...t, column: targetColumn, order: columnIds.indexOf(activeTaskId) }
        }
        if (t.column === targetColumn) {
          const idx = columnIds.indexOf(t.id)
          if (idx >= 0) return { ...t, order: idx }
        }
        return t
      })
    })
  }

  const filtersActive = search.trim() !== '' || priorityFilter !== 'all' || tagFilter !== 'all'

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-5">
      <header className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            📋 タスクボード
          </h1>
          <div className="flex items-center gap-3">
            {overdueCount > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                ⚠ 期限切れ {overdueCount} 件
              </span>
            )}
            <button
              type="button"
              onClick={toggle}
              title={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 検索..."
            className="w-44 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            title="優先度で絞り込み"
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">優先度: すべて</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            title="タグで絞り込み"
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">タグ: すべて</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPriorityFilter('all')
                setTagFilter('all')
              }}
              className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              クリア
            </button>
          )}
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 md:flex-row md:overflow-x-auto">
          {COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id]}
              onCardClick={setModalTask}
              onAdd={openCreate}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {(modalTask || modalColumn) && (
        <TaskModal
          task={modalTask}
          onSave={handleSave}
          onDelete={modalTask ? handleDelete : undefined}
          onClose={closeModal}
        />
      )}

      <footer className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        データはこのブラウザ内（localStorage）にのみ保存されます
      </footer>
    </div>
  )
}
