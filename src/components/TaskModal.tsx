import { useEffect, useState } from 'react'
import type { Priority, Task } from '../types'
import { PRIORITY_LABELS } from '../types'

interface Props {
  /** Existing task to edit, or null when creating a new one */
  task: Task | null
  onSave: (data: {
    title: string
    description: string
    priority: Priority
    dueDate: string
    tags: string[]
  }) => void
  onDelete?: () => void
  onClose: () => void
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [tagsInput, setTagsInput] = useState(task?.tags.join(', ') ?? '')

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
    onSave({ title: trimmed, description: description.trim(), priority, dueDate, tags })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">
          {task ? 'タスクを編集' : '新しいタスク'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">タイトル</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: PR #42 をレビューする"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="詳細・メモ"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">優先度</label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={
                      'flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ' +
                      (priority === p
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700')
                    }
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">期限</label>
              <input
                type="date"
                title="期限"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              タグ（カンマ区切り）
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例: backend, urgent"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {task && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
