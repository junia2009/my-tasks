import { useCallback, useEffect, useState } from 'react'
import type { ColumnId, Priority, Recurrence, RecurrenceFreq, Subtask, Task } from '../types'
import { COLUMNS, PRIORITY_LABELS, WEEKDAY_LABELS } from '../types'

interface Props {
  /** Existing task to edit, or null when creating a new one */
  task: Task | null
  /** Column the new task will be created in (create mode only) */
  defaultColumn: ColumnId
  onSave: (data: {
    title: string
    description: string
    priority: Priority
    dueDate: string
    tags: string[]
    column: ColumnId
    subtasks?: Subtask[]
    recurrence?: Recurrence
  }) => void
  onDelete?: () => void
  onClose: () => void
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low']

const inputClass =
  'w-full rounded-xl border border-white/10 bg-abyss-950/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-lume/50 focus:outline-none focus:ring-1 focus:ring-lume/40 [color-scheme:dark]'

const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-lume-soft/80'

export function TaskModal({ task, defaultColumn, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [tagsInput, setTagsInput] = useState(task?.tags.join(', ') ?? '')
  const [column, setColumn] = useState<ColumnId>(task?.column ?? defaultColumn)
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks ?? [])
  const [newSubtask, setNewSubtask] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence | null>(task?.recurrence ?? null)

  // 初期値からの変更有無（未保存の入力があるか）
  const isDirty =
    title !== (task?.title ?? '') ||
    description !== (task?.description ?? '') ||
    priority !== (task?.priority ?? 'medium') ||
    dueDate !== (task?.dueDate ?? '') ||
    tagsInput !== (task?.tags.join(', ') ?? '') ||
    column !== (task?.column ?? defaultColumn) ||
    JSON.stringify(subtasks) !== JSON.stringify(task?.subtasks ?? []) ||
    JSON.stringify(recurrence) !== JSON.stringify(task?.recurrence ?? null)

  function addSubtask() {
    const t = newSubtask.trim()
    if (!t) return
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: t, done: false }])
    setNewSubtask('')
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  // チェック切替。全完了になった瞬間だけ（未完了列なら）タスク完了を提案する。
  function toggleSubtask(id: string) {
    const next = subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    setSubtasks(next)
    const wasAllDone = subtasks.length > 0 && subtasks.every((s) => s.done)
    const isAllDone = next.length > 0 && next.every((s) => s.done)
    if (isAllDone && !wasAllDone && column !== 'done') {
      if (window.confirm('すべてのサブタスクが完了しました。タスクを完了にしますか？')) {
        setColumn('done')
      }
    }
  }

  function selectRecurrence(freq: RecurrenceFreq | null) {
    if (freq === null) setRecurrence(null)
    else if (freq === 'daily') setRecurrence({ freq: 'daily' })
    else setRecurrence((prev) => ({ freq: 'weekly', weekdays: prev?.weekdays ?? [] }))
  }

  function toggleWeekday(day: number) {
    setRecurrence((prev) => {
      if (!prev || prev.freq !== 'weekly') return prev
      const set = new Set(prev.weekdays ?? [])
      if (set.has(day)) set.delete(day)
      else set.add(day)
      return { freq: 'weekly', weekdays: Array.from(set).sort((a, b) => a - b) }
    })
  }

  const doneCount = subtasks.filter((s) => s.done).length

  // 入力がある状態で閉じようとしたら破棄確認する
  const requestClose = useCallback(() => {
    if (isDirty && !window.confirm('入力内容を破棄して閉じますか？')) return
    onClose()
  }, [isDirty, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const cleanSubtasks = subtasks
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title)
    onSave({
      title: trimmed,
      description: description.trim(),
      priority,
      dueDate,
      tags,
      column,
      subtasks: cleanSubtasks.length > 0 ? cleanSubtasks : undefined,
      recurrence: recurrence ?? undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss-950/70 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={requestClose}
    >
      <div
        className="max-h-[88dvh] w-full max-w-md animate-sheet-up overflow-y-auto rounded-3xl border border-white/10 bg-abyss-800/85 px-6 pt-5 pb-6 shadow-glow backdrop-blur-xl sm:px-7 sm:pt-6 sm:pb-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* グラバー */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

        <h2 className="mb-5 text-lg font-semibold text-slate-50">
          {task ? 'タスクを編集' : '新しいタスク'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>タイトル</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: PR #42 をレビューする"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="詳細・メモ"
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* ステータス（列の移動） */}
          <div>
            <label className={labelClass}>ステータス</label>
            <div className="flex gap-2">
              {COLUMNS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColumn(c.id)}
                  className={
                    'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition ' +
                    (column === c.id
                      ? 'border-lume/50 bg-lume/15 text-lume-soft shadow-glow-sm'
                      : 'border-white/10 text-slate-400 active:bg-white/5')
                  }
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>優先度</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={
                    'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition ' +
                    (priority === p
                      ? 'border-lume/50 bg-lume/15 text-lume-soft shadow-glow-sm'
                      : 'border-white/10 text-slate-400 active:bg-white/5')
                  }
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>期限</label>
            <input
              type="date"
              title="期限"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass + ' block min-w-0 max-w-full'}
            />
          </div>

          {/* 繰り返し（完了すると次回分を自動生成） */}
          <div>
            <label className={labelClass}>繰り返し</label>
            <div className="flex gap-2">
              {(
                [
                  [null, 'なし'],
                  ['daily', '毎日'],
                  ['weekly', '毎週'],
                ] as [RecurrenceFreq | null, string][]
              ).map(([f, lbl]) => {
                const active = (recurrence?.freq ?? null) === f
                return (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => selectRecurrence(f)}
                    className={
                      'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition ' +
                      (active
                        ? 'border-lume/50 bg-lume/15 text-lume-soft shadow-glow-sm'
                        : 'border-white/10 text-slate-400 active:bg-white/5')
                    }
                  >
                    {lbl}
                  </button>
                )
              })}
            </div>
            {recurrence?.freq === 'weekly' && (
              <div className="mt-2 flex gap-1">
                {WEEKDAY_LABELS.map((lbl, i) => {
                  const active = recurrence.weekdays?.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleWeekday(i)}
                      className={
                        'flex-1 rounded-lg border py-2 text-xs font-medium transition ' +
                        (active
                          ? 'border-lume/50 bg-lume/15 text-lume-soft'
                          : 'border-white/10 text-slate-400 active:bg-white/5')
                      }
                    >
                      {lbl}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>タグ（カンマ区切り）</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例: backend, urgent"
              className={inputClass}
            />
          </div>

          {/* サブタスク（チェックリスト） */}
          <div>
            <label className={labelClass}>
              サブタスク
              {subtasks.length > 0 && (
                <span className="ml-1.5 normal-case tracking-normal text-slate-500">
                  {doneCount}/{subtasks.length}
                </span>
              )}
            </label>
            {subtasks.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {subtasks.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(s.id)}
                      aria-label={s.done ? '未完了に戻す' : '完了にする'}
                      className={
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition ' +
                        (s.done
                          ? 'border-lume/50 bg-lume/20 text-lume-soft'
                          : 'border-white/20 text-transparent active:bg-white/5')
                      }
                    >
                      ✓
                    </button>
                    <input
                      value={s.title}
                      aria-label="サブタスク名"
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)),
                        )
                      }
                      className={
                        'min-w-0 flex-1 bg-transparent text-sm focus:outline-none ' +
                        (s.done ? 'text-slate-500 line-through' : 'text-slate-100')
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(s.id)}
                      aria-label="サブタスクを削除"
                      className="shrink-0 px-1 text-slate-500 transition active:text-rose-300"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
                placeholder="サブタスクを追加"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addSubtask}
                className="shrink-0 rounded-xl border border-white/10 px-3 text-sm text-slate-300 transition active:bg-white/5"
              >
                追加
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {task && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition active:bg-rose-500/10"
              >
                削除
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition active:bg-white/5"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="rounded-xl border border-lume/40 bg-lume/15 px-5 py-2.5 text-sm font-semibold text-lume-soft shadow-glow transition active:bg-lume/25"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
