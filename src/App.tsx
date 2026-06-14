import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BackgroundFX } from './components/BackgroundFX'
import { TaskCard } from './components/TaskCard'
import { TaskModal } from './components/TaskModal'
import { useLocalStorage } from './useLocalStorage'
import {
  COLUMNS,
  PRIORITY_RANK,
  SORT_LABELS,
  type ColumnId,
  type Priority,
  type Recurrence,
  type SortMode,
  type Subtask,
  type Task,
} from './types'
import { dayKey, dueStatus, nextDueDate, relativeDayLabel, todayISO } from './dateUtils'

const STORAGE_KEY = 'kanban.tasks.v1'

function seed(): Task[] {
  const now = Date.now()
  return [
    {
      id: crypto.randomUUID(),
      title: 'ようこそ。タップで編集、⋮⋮で並べ替え',
      description: '「進行中 →」ボタンで次のステータスへ送れます。',
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
      completedAt: now,
    },
  ]
}

const COLUMN_IDS: ColumnId[] = ['todo', 'in-progress', 'done']
const PRIORITIES: Priority[] = ['high', 'medium', 'low']
const SORT_MODES: SortMode[] = ['manual', 'due', 'priority']

/** done へ移動したら完了日時を確定（既存値は保持）、それ以外の列では未設定に戻す。 */
function completedAtFor(target: ColumnId, existing?: number): number | undefined {
  if (target !== 'done') return undefined
  return existing ?? Date.now()
}

/** 完了日時（無ければ作成日時）の新しい順。タイムライン／完了列の並び。 */
function byCompletedDesc(a: Task, b: Task): number {
  return (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt)
}

/**
 * done にした繰り返しタスクから次回分（todo）を生成する。
 * recurrence が無ければ null。期限は元の期限（無ければ今日）を基準に算出し、
 * サブタスクは未チェックで引き継ぐ。元タスクは done のまま履歴に残る。
 */
function spawnRecurrence(task: Task, list: Task[]): Task | null {
  if (!task.recurrence) return null
  const from = task.dueDate || todayISO()
  const dueDate = nextDueDate(task.recurrence.freq, task.recurrence.weekdays, from)
  const order =
    list.filter((t) => t.column === 'todo').reduce((m, t) => Math.max(m, t.order), -1) + 1
  return {
    id: crypto.randomUUID(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate,
    tags: task.tags,
    column: 'todo',
    order,
    createdAt: Date.now(),
    completedAt: undefined,
    subtasks: task.subtasks?.map((s) => ({ ...s, id: crypto.randomUUID(), done: false })),
    recurrence: task.recurrence,
  }
}

function sanitizeSubtasks(raw: unknown): Subtask[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const list = raw
    .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
    .map((s) => ({
      id: typeof s.id === 'string' ? s.id : crypto.randomUUID(),
      title: typeof s.title === 'string' ? s.title : '',
      done: s.done === true,
    }))
    .filter((s) => s.title !== '')
  return list.length > 0 ? list : undefined
}

function sanitizeRecurrence(raw: unknown): Recurrence | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined
  const r = raw as Record<string, unknown>
  if (r.freq !== 'daily' && r.freq !== 'weekly') return undefined
  if (r.freq === 'daily') return { freq: 'daily' }
  const weekdays = Array.isArray(r.weekdays)
    ? r.weekdays.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)
    : undefined
  return { freq: 'weekly', weekdays }
}

/** 壊れた・古い形式の保存データでも落ちないように各タスクを正規化する。 */
function sanitizeTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return seed()
  return raw
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .map((t, i) => ({
      id: typeof t.id === 'string' ? t.id : crypto.randomUUID(),
      title: typeof t.title === 'string' ? t.title : '',
      description: typeof t.description === 'string' ? t.description : '',
      priority: PRIORITIES.includes(t.priority as Priority) ? (t.priority as Priority) : 'medium',
      dueDate: typeof t.dueDate === 'string' ? t.dueDate : '',
      tags: Array.isArray(t.tags) ? t.tags.filter((x): x is string => typeof x === 'string') : [],
      column: COLUMN_IDS.includes(t.column as ColumnId) ? (t.column as ColumnId) : 'todo',
      order: typeof t.order === 'number' ? t.order : i,
      createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      // done なのに完了日時が無い旧データは未設定のまま（表示時に createdAt で代替）
      completedAt: typeof t.completedAt === 'number' ? t.completedAt : undefined,
      subtasks: sanitizeSubtasks(t.subtasks),
      recurrence: sanitizeRecurrence(t.recurrence),
    }))
}

type PriorityFilter = 'all' | Priority

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, seed, {
    sanitize: sanitizeTasks,
  })

  const [activeColumn, setActiveColumn] = useState<ColumnId>('todo')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('manual')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTask, setModalTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [tasks])

  const overdueCount = useMemo(
    () => tasks.filter((t) => t.column !== 'done' && dueStatus(t.dueDate) === 'overdue').length,
    [tasks],
  )

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (t: Task) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (tagFilter !== 'all' && !t.tags.includes(tagFilter)) return false
      if (q) {
        const hay = (t.title + ' ' + t.description + ' ' + t.tags.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    }
  }, [search, priorityFilter, tagFilter])

  const counts = useMemo(() => {
    const map: Record<ColumnId, number> = { todo: 0, 'in-progress': 0, done: 0 }
    tasks.forEach((t) => {
      if (matches(t)) map[t.column]++
    })
    return map
  }, [tasks, matches])

  const visibleTasks = useMemo(() => {
    const list = tasks.filter((t) => t.column === activeColumn && matches(t))
    // 完了列は常にタイムライン順（完了日時の新しい順）。
    if (activeColumn === 'done') return list.sort(byCompletedDesc)
    if (sortMode === 'due') {
      // 期限あり昇順 → 期限なしは末尾。同点は手動順で安定化。
      return list.sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate) || a.order - b.order
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return a.order - b.order
      })
    }
    if (sortMode === 'priority') {
      return list.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.order - b.order,
      )
    }
    return list.sort((a, b) => a.order - b.order)
  }, [tasks, activeColumn, matches, sortMode])

  // 完了列は日付ごとにグルーピングして見出しを付ける（visibleTasks は完了日降順済み）。
  const timelineGroups = useMemo(() => {
    if (activeColumn !== 'done') return [] as { key: string; items: Task[] }[]
    const groups: { key: string; items: Task[] }[] = []
    for (const t of visibleTasks) {
      const key = dayKey(t.completedAt ?? t.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.items.push(t)
      else groups.push({ key, items: [t] })
    }
    return groups
  }, [activeColumn, visibleTasks])

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null
  const filtersActive =
    search.trim() !== '' || priorityFilter !== 'all' || tagFilter !== 'all'

  // 手動並び・未フィルタ・未完了列のときだけドラッグ並べ替えを許可する。
  // （ソート中やフィルタ中の並べ替えは順序が壊れるため無効化）
  const dndEnabled = sortMode === 'manual' && activeColumn !== 'done' && !filtersActive

  function openCreate() {
    setModalTask(null)
    setModalOpen(true)
  }
  function openEdit(task: Task) {
    setModalTask(task)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setModalTask(null)
  }

  function endOrder(column: ColumnId, list: Task[]) {
    return list.filter((t) => t.column === column).reduce((m, t) => Math.max(m, t.order), -1) + 1
  }

  function handleSave(data: {
    title: string
    description: string
    priority: Priority
    dueDate: string
    tags: string[]
    column: ColumnId
    subtasks?: Subtask[]
    recurrence?: Recurrence
  }) {
    setTasks((prev) => {
      if (modalTask) {
        const movedColumn = data.column !== modalTask.column
        const updated = prev.map((t) =>
          t.id === modalTask.id
            ? {
                ...t,
                ...data,
                order: movedColumn ? endOrder(data.column, prev) : t.order,
                completedAt: completedAtFor(data.column, t.completedAt),
              }
            : t,
        )
        // 未完了 → done になった繰り返しタスクは次回分を生成
        if (data.column === 'done' && modalTask.column !== 'done') {
          const doneTask = updated.find((t) => t.id === modalTask.id)!
          const next = spawnRecurrence(doneTask, updated)
          if (next) return [...updated, next]
        }
        return updated
      }
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...data,
        order: endOrder(data.column, prev),
        createdAt: Date.now(),
        completedAt: completedAtFor(data.column),
      }
      const list = [...prev, newTask]
      if (newTask.column === 'done') {
        const next = spawnRecurrence(newTask, list)
        if (next) return [...list, next]
      }
      return list
    })
    // 新規作成した列へ自動で切り替え
    if (!modalTask) setActiveColumn(data.column)
    closeModal()
  }

  function handleDelete() {
    if (modalTask) setTasks((prev) => prev.filter((t) => t.id !== modalTask.id))
    closeModal()
  }

  function moveTask(task: Task, target: ColumnId) {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              column: target,
              order: endOrder(target, prev),
              completedAt: completedAtFor(target, t.completedAt),
            }
          : t,
      )
      // 未完了 → done になった繰り返しタスクは次回分を生成
      if (target === 'done' && task.column !== 'done') {
        const doneTask = updated.find((t) => t.id === task.id)!
        const next = spawnRecurrence(doneTask, updated)
        if (next) return [...updated, next]
      }
      return updated
    })
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over || active.id === over.id) return
    setTasks((prev) => {
      const colTasks = prev
        .filter((t) => t.column === activeColumn)
        .sort((a, b) => a.order - b.order)
      const oldIndex = colTasks.findIndex((t) => t.id === active.id)
      const newIndex = colTasks.findIndex((t) => t.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      const reordered = arrayMove(colTasks, oldIndex, newIndex)
      const orderMap = new Map(reordered.map((t, i) => [t.id, i]))
      return prev.map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t))
    })
  }

  return (
    <>
      <BackgroundFX />
      <div className="relative z-0 mx-auto flex h-full max-w-md flex-col px-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <header className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.42em] text-lume-soft/40">
                Abyss
              </p>
              <h1 className="bg-gradient-to-r from-lume-soft via-lume to-lume-cyan bg-clip-text pb-1 font-serif text-[26px] font-medium italic leading-[1.25] tracking-tight text-transparent drop-shadow-[0_0_12px_rgba(52,231,211,0.25)]">
                Task Management
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="絞り込み"
              className={
                'flex h-10 w-10 items-center justify-center rounded-full border transition ' +
                (showFilters || filtersActive
                  ? 'border-lume/40 bg-lume/10 text-lume-soft shadow-glow-sm'
                  : 'border-white/10 text-slate-300 active:bg-white/5')
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5h18M6 12h12M10 19h4" />
              </svg>
            </button>
          </div>

          {overdueCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300 ring-1 ring-rose-400/25">
              ⚠ 期限切れ {overdueCount} 件
            </div>
          )}

          {/* 絞り込みパネル */}
          {showFilters && (
            <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md animate-fade-in">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 キーワード検索"
                className="h-10 w-full rounded-xl border border-white/10 bg-abyss-950/50 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-lume/50 focus:outline-none focus:ring-1 focus:ring-lume/40"
              />
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityFilter(p)}
                    className={
                      'rounded-full px-3 py-1.5 text-xs font-medium transition ' +
                      (priorityFilter === p
                        ? 'bg-lume/20 text-lume-soft ring-1 ring-lume/40'
                        : 'bg-white/5 text-slate-400')
                    }
                  >
                    {p === 'all' ? '優先度すべて' : p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTagFilter('all')}
                    className={
                      'rounded-full px-3 py-1.5 text-xs font-medium transition ' +
                      (tagFilter === 'all'
                        ? 'bg-lume/20 text-lume-soft ring-1 ring-lume/40'
                        : 'bg-white/5 text-slate-400')
                    }
                  >
                    タグすべて
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter(tag)}
                      className={
                        'rounded-full px-3 py-1.5 text-xs font-medium transition ' +
                        (tagFilter === tag
                          ? 'bg-lume/20 text-lume-soft ring-1 ring-lume/40'
                          : 'bg-white/5 text-slate-400')
                      }
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setPriorityFilter('all')
                    setTagFilter('all')
                  }}
                  className="text-xs text-lume-soft/70 underline-offset-2 active:underline"
                >
                  絞り込みをクリア
                </button>
              )}
            </div>
          )}

          {/* ステータス切替（セグメント） */}
          <div className="mt-3 flex gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md">
            {COLUMNS.map((c) => {
              const active = activeColumn === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColumn(c.id)}
                  className={
                    'relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition ' +
                    (active
                      ? 'bg-lume/15 text-lume-soft shadow-glow-sm ring-1 ring-lume/30'
                      : 'text-slate-400 active:bg-white/5')
                  }
                >
                  {c.title}
                  <span
                    className={
                      'min-w-[1.25rem] rounded-full px-1 text-[11px] ' +
                      (active ? 'bg-lume/20 text-lume-soft' : 'bg-white/5 text-slate-500')
                    }
                  >
                    {counts[c.id]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 並び順（未完了列のみ。完了列は常に完了日タイムライン） */}
          {activeColumn !== 'done' && (
            <div className="mt-2 flex items-center justify-end gap-1.5">
              <span className="mr-0.5 text-[11px] text-slate-500">並び順</span>
              {SORT_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSortMode(m)}
                  className={
                    'rounded-full px-2.5 py-1 text-[11px] font-medium transition ' +
                    (sortMode === m
                      ? 'bg-lume/20 text-lume-soft ring-1 ring-lume/40'
                      : 'bg-white/5 text-slate-400')
                  }
                >
                  {SORT_LABELS[m]}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* タスク一覧（選択中の列） */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <main className="mt-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-24">
            {/* SortableContext は常時マウント（完了列でもカード側で無効化）。 */}
            <SortableContext
              items={visibleTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeColumn === 'done'
                ? // 完了タイムライン：日付見出しごとにグルーピング（ドラッグ無効）
                  timelineGroups.map((g) => (
                    <div key={g.key} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 px-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-lume-soft/50">
                        <span>{relativeDayLabel(g.key)}</span>
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-slate-500">{g.items.length}</span>
                      </div>
                      {g.items.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={openEdit}
                          onMove={moveTask}
                          sortable={false}
                        />
                      ))}
                    </div>
                  ))
                : visibleTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={openEdit}
                      onMove={moveTask}
                      sortable={dndEnabled}
                    />
                  ))}
            </SortableContext>

            {visibleTasks.length === 0 && (
              <div className="mt-16 select-none text-center text-slate-500">
                <div className="text-4xl">🪼</div>
                <p className="mt-3 text-sm">
                  {filtersActive ? '条件に合うタスクがありません' : 'ここにはまだ何も漂っていません'}
                </p>
              </div>
            )}
          </main>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="rotate-1">
                <TaskCard task={activeTask} onClick={() => {}} overlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* バージョン情報・保存先の注記 */}
        <footer className="shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pr-16 pt-1 text-[11px] leading-relaxed text-slate-500/70">
          <span className="text-lume-soft/50">v{__APP_VERSION__}</span>
          <span className="mx-1.5">·</span>
          {__BUILD_DATE__}
          <span className="mx-1.5">·</span>
          {__COMMIT__}
          <br />
          データはこの端末内にのみ保存されます
        </footer>

        {/* 追加ボタン（FAB） */}
        <button
          type="button"
          onClick={openCreate}
          aria-label="タスクを追加"
          className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-lume/40 bg-lume/20 text-3xl font-light text-lume-soft shadow-glow backdrop-blur-md transition active:scale-95 active:bg-lume/30"
        >
          <span className="-mt-0.5">+</span>
        </button>

        {modalOpen && (
          <TaskModal
            task={modalTask}
            defaultColumn={activeColumn}
            onSave={handleSave}
            onDelete={modalTask ? handleDelete : undefined}
            onClose={closeModal}
          />
        )}
      </div>
    </>
  )
}
