// src/components/layout/ViewSwitcher.jsx
import { CalendarCheck, CalendarDays, CalendarRange } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const VIEWS = [
  { id: 'daily',   label: 'আজকের কাজ',          Icon: CalendarCheck  },
  { id: 'monthly', label: 'মাসিক ক্যালেন্ডার',   Icon: CalendarDays   },
  { id: 'yearly',  label: 'বাৎসরিক ধারাবাহিকতা', Icon: CalendarRange  },
]

export default function ViewSwitcher() {
  const { currentView, setCurrentView } = useApp()

  return (
    <div className="bg-slate-200/60 dark:bg-slate-900/80 p-1.5 rounded-2xl flex mb-6 border border-slate-200/30 dark:border-slate-800/40 max-w-2xl mx-auto mt-6">
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setCurrentView(id)}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            currentView === id
              ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
