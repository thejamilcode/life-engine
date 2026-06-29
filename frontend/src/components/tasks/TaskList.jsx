// src/components/tasks/TaskList.jsx
// ====================================================
// Task List — filter tabs + search + task cards
// ====================================================

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TaskCard from './TaskCard'
import { toBengaliDigits } from '../../utils/helpers'

const FILTER_TABS = [
  { id: 'all',       label: 'সবগুলো',            emoji: '📋' },
  { id: 'namaz',     label: 'সালাত ও কুরআন',  emoji: '🕌' },
  { id: 'dhikr',     label: 'জিকির ও দোয়া',    emoji: '📿' },
  { id: 'career',    label: 'ক্যারিয়ার ও স্টাডি', emoji: '💼' },
  { id: 'lifestyle', label: 'লাইফস্টাইল',     emoji: '🌱' },
]

export default function TaskList() {
  const { tasks } = useApp()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // First filter by category
  let filtered = filter === 'all' ? tasks : tasks.filter(t => t.cat === filter)

  // Filter by search query
  if (searchQuery.trim() !== '') {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  // Filter by completion status
  if (statusFilter === 'pending') {
    filtered = filtered.filter(t => !t.completed)
  } else if (statusFilter === 'completed') {
    filtered = filtered.filter(t => t.completed)
  }

  const completedCount = filtered.filter(t => t.completed).length

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800 space-y-4">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="টাস্ক খুঁজুন বা টাইপ করুন..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center gap-1 ${
              filter === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-slate-700'
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

      {/* Sub-Filter for Task State */}
      <div className="flex gap-2 justify-end text-xs text-slate-500 pt-2 border-t border-slate-55 dark:border-slate-800/80">
        <button
          onClick={() => setStatusFilter('all')}
          className={`font-semibold ${statusFilter === 'all' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'hover:text-teal-600 dark:hover:text-teal-400 text-slate-500'}`}
        >
          সব ({toBengaliDigits(tasks.length)})
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`font-semibold ${statusFilter === 'pending' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'hover:text-teal-600 dark:hover:text-teal-400 text-slate-500'}`}
        >
          বাকি আছে
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`font-semibold ${statusFilter === 'completed' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'hover:text-teal-600 dark:hover:text-teal-400 text-slate-500'}`}
        >
          সম্পন্ন
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-2 group">
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/60 dark:border-slate-800 custom-shadow col-span-full">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-300">ℹ️</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">কোনো টাস্ক পাওয়া যায়নি!</p>
          </div>
        ) : (
          filtered.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
