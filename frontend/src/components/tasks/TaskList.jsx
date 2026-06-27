// src/components/tasks/TaskList.jsx
// ====================================================
// Task List — filter tabs + task cards
// ====================================================

import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import TaskCard from './TaskCard'
import { toBengaliDigits } from '../../utils/helpers'

const FILTER_TABS = [
  { id: 'all',       label: 'সব',               emoji: '📋' },
  { id: 'namaz',     label: 'সালাত ও কুরআন',  emoji: '🕌' },
  { id: 'dhikr',     label: 'জিকির',            emoji: '📿' },
  { id: 'career',    label: 'ক্যারিয়ার',       emoji: '💼' },
  { id: 'lifestyle', label: 'লাইফস্টাইল',     emoji: '🌱' },
]

export default function TaskList() {
  const { tasks } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.cat === filter)
  const completedCount = filtered.filter(t => t.completed).length

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800 space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center gap-1 ${
              filter === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.emoji} {tab.label}
            {tab.id === 'all' && (
              <span className="ml-1 bg-white/20 dark:bg-white/10 px-1.5 rounded-lg">
                {toBengaliDigits(tasks.length)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Progress of filtered */}
      {filtered.length > 0 && (
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {toBengaliDigits(completedCount)}/{toBengaliDigits(filtered.length)} টি সম্পন্ন
        </div>
      )}

      {/* Task Cards */}
      <div className="space-y-2 group">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">কোনো টাস্ক নেই</p>
            <p className="text-xs mt-1">উপরে থেকে নতুন টাস্ক যোগ করুন!</p>
          </div>
        ) : (
          filtered.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
