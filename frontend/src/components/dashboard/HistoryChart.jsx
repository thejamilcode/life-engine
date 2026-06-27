// src/components/dashboard/HistoryChart.jsx
// ====================================================
// Last 7 Days History Bar Chart
// ====================================================

import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

export default function HistoryChart() {
  const { history } = useApp()

  // গত ৭ দিনের data নেওয়া
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const dayNames = ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি']
    last7.push({
      day: dayNames[d.getDay()],
      date: toBengaliDigits(d.getDate()),
      percent: history[key]?.percent ?? (i === 0 ? null : 0),
      isToday: i === 0,
      key,
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-5 custom-shadow border border-slate-100 dark:border-slate-800">
      <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
        গত ৭ দিনের অগ্রগতি
      </h3>
      <div className="flex items-end gap-1.5 h-24">
        {last7.map((d) => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
            {/* Bar */}
            <div className="w-full flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden">
              {d.percent !== null && (
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-700 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-teal-600 to-teal-400'
                      : d.percent >= 80
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      : d.percent >= 50
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                      : 'bg-gradient-to-t from-slate-400 to-slate-300'
                  }`}
                  style={{ height: `${d.percent}%` }}
                />
              )}
            </div>
            {/* Labels */}
            <span className={`text-[9px] font-bold ${d.isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              {d.day}
            </span>
            <span className="text-[8px] text-slate-300 dark:text-slate-600">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
