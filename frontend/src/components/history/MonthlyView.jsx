// src/components/history/MonthlyView.jsx
// ====================================================
// Monthly Calendar View
// ====================================================

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getMonthlyData } from '../../api/dashboard'
import { toBengaliDigits } from '../../utils/helpers'

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
const BN_DAYS   = ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি']

export default function MonthlyView() {
  const { history } = useApp()
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [monthData, setMonthData] = useState({})
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    // Merge local history for offline fallback
    setMonthData(history)
  }, [history, year, month])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getKey = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const getColor = (percent) => {
    if (percent === undefined) return 'bg-slate-100 dark:bg-slate-800 text-slate-400'
    if (percent >= 80) return 'bg-emerald-500 text-white'
    if (percent >= 50) return 'bg-amber-400 text-white'
    if (percent > 0)   return 'bg-rose-300 text-white'
    return 'bg-slate-200 dark:bg-slate-700 text-slate-400'
  }

  const changeMonth = (dir) => {
    let nm = month + dir
    let ny = year
    if (nm > 11) { nm = 0; ny++ }
    if (nm < 0)  { nm = 11; ny-- }
    setMonth(nm)
    setYear(ny)
    setSelected(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            {BN_MONTHS[month]} {toBengaliDigits(year)}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition-all flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>
            <button onClick={() => changeMonth(1)} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition-all flex items-center gap-1">
              পরবর্তী <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {BN_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const key = getKey(day)
            const data = monthData[key]
            const percent = data?.percent
            const isToday = key === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
            return (
              <button
                key={key}
                onClick={() => setSelected(selected === key ? null : key)}
                className={`aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all hover:scale-110 ${getColor(percent)}
                  ${isToday ? 'ring-2 ring-teal-500 ring-offset-1' : ''}
                  ${selected === key ? 'ring-2 ring-offset-1 ring-slate-400' : ''}
                `}
              >
                {toBengaliDigits(day)}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { color: 'bg-emerald-500', label: '≥৮০%' },
            { color: 'bg-amber-400',   label: '৫০–৭৯%' },
            { color: 'bg-rose-300',    label: '<৫০%' },
            { color: 'bg-slate-200 dark:bg-slate-700', label: 'ডেটা নেই' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-md ${l.color}`} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Detail Panel */}
      <div className="lg:col-span-5 xl:col-span-4">
        {selected && monthData[selected] ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-teal-100 dark:border-teal-950">
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wider">{selected}</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{toBengaliDigits(monthData[selected].percent)}%</p>
            <p className="text-xs text-slate-400 mt-1">সম্পন্ন হয়েছিল</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">কোনো দিনে ক্লিক করুন বিস্তারিত দেখতে</p>
          </div>
        )}
      </div>
    </div>
  )
}
