import { useEffect, useState } from 'react'
import type { ColumnId, Priority, Task } from '../types'
import { COLUMNS, PRIORITY_LABELS } from '../types'

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({ title: trimmed, description: description.trim(), priority, dueDate, tags, column })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss-950/70 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={onClose}
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

          <div>
            <label className={labelClass}>タグ（カンマ区切り）</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例: backend, urgent"
              className={inputClass}
            />
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
                onClick={onClose}
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
