// src/components/profile/FocusTimePanel.jsx
import { Activity } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function FocusTimePanel() {
  const { profile } = useApp()
  if (!profile?.focusTime?.length) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-5 custom-shadow border border-slate-100 dark:border-slate-800 space-y-3">
      <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        ফোকাস টাইম বরাদ্দ
      </h3>
      {profile.focusTime.map((slot, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>{slot.title} — {slot.duration}</span>
            <span className="text-teal-600 dark:text-teal-400">{slot.period}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full transition-all duration-700" style={{ width: `${slot.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
