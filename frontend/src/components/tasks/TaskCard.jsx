// src/components/tasks/TaskCard.jsx
// ====================================================
// Individual Task Card — complete toggle + delete
// ====================================================

import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, toBengaliDigits } from '../../utils/helpers'

export default function TaskCard({ task }) {
  const { toggleTask, removeTask } = useApp()
  const cat = CATEGORIES[task.cat] || CATEGORIES.lifestyle

  return (
    <div
      className={`task-card flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer
        ${task.completed
          ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }`}
      onClick={() => toggleTask(task.id)}
    >
      {/* Check icon */}
      <div className="shrink-0">
        {task.completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        }
      </div>

      {/* Category emoji */}
      <span className="text-lg shrink-0">{cat.emoji}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs md:text-sm font-semibold leading-tight truncate ${
          task.completed
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-700 dark:text-slate-200'
        }`}>
          {task.text}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${cat.bg} ${cat.color} ${cat.dark}`}>
            {cat.label}
          </span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
            +{toBengaliDigits(task.xp)} XP
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          document.dispatchEvent(new CustomEvent('open-confirm', {
            detail: {
              title: 'টাস্ক মুছে ফেলুন',
              desc: 'আপনি কি নিশ্চিত যে এই আমলটি তালিকা থেকে বাদ দিতে চান?',
              onConfirm: () => removeTask(task.id),
            }
          }))
        }}
        className="shrink-0 w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
