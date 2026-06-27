// src/components/history/YearlyView.jsx
// ====================================================
// Yearly Heatmap View — GitHub-style contribution grid
// ====================================================

import { useState } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

const BN_MONTHS = ['জান','ফেব','মার','এপ্র','মে','জুন','জুলা','আগ','সেপ','অক্ট','নভে','ডিসে']

export default function YearlyView() {
  const { history } = useApp()
  const [year, setYear] = useState(new Date().getFullYear())

  const getColor = (percent) => {
    if (percent === undefined) return 'bg-slate-100 dark:bg-slate-800'
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 50) return 'bg-teal-400'
    if (percent > 0)   return 'bg-amber-300'
    return 'bg-rose-200 dark:bg-rose-900/30'
  }

  // Build all months
  const months = Array.from({ length: 12 }, (_, m) => {
    const firstDay = new Date(year, m, 1).getDay()
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      cells.push({ d, key, percent: history[key]?.percent })
    }
    return { name: BN_MONTHS[m], cells }
  })

  // Yearly stats
  const allDays = Object.entries(history).filter(([k]) => k.startsWith(String(year)))
  const avgPercent = allDays.length
    ? Math.round(allDays.reduce((sum, [, v]) => sum + v.percent, 0) / allDays.length)
    : 0
  const perfectDays = allDays.filter(([, v]) => v.percent === 100).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            বাৎসরিক হিটম্যাপ — {toBengaliDigits(year)}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setYear(y => y - 1)} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>
            <button onClick={() => setYear(y => y + 1)} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1">
              পরবর্তী <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12 Month Grids */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((mon, mi) => (
            <div key={mi}>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">{mon.name}</p>
              <div className="grid grid-cols-7 gap-0.5">
                {mon.cells.map((cell, ci) =>
                  cell === null
                    ? <div key={`e${ci}`} className="aspect-square" />
                    : (
                      <div
                        key={cell.key}
                        title={`${cell.d}: ${cell.percent ?? '?'}%`}
                        className={`aspect-square rounded-sm ${getColor(cell.percent)}`}
                      />
                    )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { color: 'bg-emerald-500', label: '≥৮০%' },
            { color: 'bg-teal-400',    label: '৫০–৭৯%' },
            { color: 'bg-amber-300',   label: '<৫০%' },
            { color: 'bg-rose-200 dark:bg-rose-900/30', label: '০%' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Yearly Stats */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {toBengaliDigits(year)} সালের সারসংক্ষেপ
          </h4>
          <div className="space-y-3">
            <StatRow label="মোট ট্র্যাক করা দিন" value={toBengaliDigits(allDays.length)} />
            <StatRow label="গড় সম্পন্নতা"        value={`${toBengaliDigits(avgPercent)}%`} />
            <StatRow label="১০০% সম্পন্ন দিন"    value={toBengaliDigits(perfectDays)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  )
}
