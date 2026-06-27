// src/components/dashboard/DailyView.jsx
// ====================================================
// Daily View — Task panel + sidebar stats
// ====================================================

import { RotateCcw, CheckCheck } from 'lucide-react'
import AddTaskForm from '../tasks/AddTaskForm'
import TaskList from '../tasks/TaskList'
import AvoidList from '../profile/AvoidList'
import FocusTimePanel from '../profile/FocusTimePanel'
import HistoryChart from './HistoryChart'
import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

export default function DailyView() {
  const { stats } = useApp()

  const handleReset = () => {
    document.dispatchEvent(new CustomEvent('open-confirm', {
      detail: {
        title: 'নতুন দিন শুরু করুন',
        desc: 'আজকের সফল কাজের রুটিন রিসেট করে কি নতুন দিনের ট্র্যাকিং শুরু করতে চান? এটি আজকের সম্পন্ন করা টাস্কগুলো রিসেট করে দিবে।',
        onConfirm: () => document.dispatchEvent(new Event('do-reset')),
      }
    }))
  }

  const handleMarkAll = () => {
    document.dispatchEvent(new CustomEvent('open-confirm', {
      detail: {
        title: 'সবগুলো টাস্ক সম্পন্ন করুন',
        desc: 'আপনি কি নিশ্চিত যে আপনি আজকের সবগুলো টাস্ক এক ক্লিকে সফল চিহ্নিত করতে চান?',
        onConfirm: () => document.dispatchEvent(new Event('do-mark-all')),
      }
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Task Panel */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        <AddTaskForm />
        <TaskList />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-2xl hover:border-rose-200 dark:hover:border-rose-900/50 hover:text-rose-600 transition-all flex items-center justify-center gap-2 custom-shadow"
          >
            <RotateCcw className="w-4 h-4" />
            নতুন দিন শুরু
          </button>
          <button
            onClick={handleMarkAll}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            সবগুলো সম্পন্ন
          </button>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="মোট XP" value={`+${toBengaliDigits(stats?.total_xp || 0)}`} sub="আজ পর্যন্ত" color="text-teal-600 dark:text-teal-400" />
          <StatCard label="স্ট্রিক" value={`🔥 ${toBengaliDigits(stats?.streak || 0)}`} sub="ধারাবাহিক দিন" color="text-amber-600 dark:text-amber-400" />
        </div>

        {/* Focus Time */}
        <FocusTimePanel />

        {/* Avoid List */}
        <AvoidList />

        {/* History Chart */}
        <HistoryChart />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 custom-shadow border border-slate-100 dark:border-slate-800">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">{label}</span>
      <span className={`text-xl font-extrabold block mt-1 ${color}`}>{value}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</span>
    </div>
  )
}
