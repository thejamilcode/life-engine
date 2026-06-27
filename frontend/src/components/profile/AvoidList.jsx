// src/components/profile/AvoidList.jsx
import { Ban } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AvoidList() {
  const { profile } = useApp()
  if (!profile) return null

  const items = (profile.avoidList || []).filter(av => av.label?.trim())
  if (items.length === 0) return null

  return (
    <div className="bg-rose-50/60 dark:bg-rose-950/10 rounded-3xl p-4 border border-rose-100 dark:border-rose-900/20 space-y-2">
      <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
        <Ban className="w-4 h-4" />
        🚫 {profile.userName}, এগুলো স্পর্শ করবে না
      </h3>
      {items.map((av, i) => (
        <div key={i} className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-rose-100/50 dark:border-rose-900/20 text-xs text-slate-700 dark:text-slate-300">
          <strong>{av.label}:</strong> {av.value}
        </div>
      ))}
    </div>
  )
}
