// src/components/tasks/AddTaskForm.jsx
// ====================================================
// Add New Task Form — collapsible accordion
// ====================================================

import { useState } from 'react'
import { PlusCircle, ChevronDown, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CATS = [
  { value: 'namaz',     label: '🕌 সালাত ও কুরআন' },
  { value: 'dhikr',     label: '📿 জিকির ও দোয়া' },
  { value: 'career',    label: '💼 ক্যারিয়ার ও স্টাডি' },
  { value: 'lifestyle', label: '🌱 লাইফস্টাইল' },
]

export default function AddTaskForm() {
  const { addTask } = useApp()
  const [open, setOpen] = useState(false)
  const [text, setText]   = useState('')
  const [cat, setCat]     = useState('namaz')
  const [xp, setXp]       = useState(20)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return
    setLoading(true)
    await addTask({ text: text.trim(), cat, xp: Number(xp) })
    setText('')
    setXp(20)
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 custom-shadow border border-teal-100 dark:border-teal-950/30 space-y-3">
      {/* Accordion Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 block">
              নতুন আমল বা টাস্ক যোগ করুন
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
              আপনার ইচ্ছেমতো আমল যুক্ত বা মডিফাই করুন
            </span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Form Body */}
      {open && (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Task Text */}
            <div className="sm:col-span-6">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                টাস্ক / আমলের নাম
              </label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="যেমন: নতুন ৫টি হাদিস মুখস্থ করা..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                ক্যাটাগরি
              </label>
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 dark:text-white transition-all"
              >
                {CATS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* XP */}
            <div className="sm:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                XP পয়েন্ট
              </label>
              <input
                type="number"
                value={xp}
                onChange={e => setXp(e.target.value)}
                min="5" max="250"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAdd}
              disabled={loading || !text.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus className="w-4 h-4" />
              }
              যোগ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
