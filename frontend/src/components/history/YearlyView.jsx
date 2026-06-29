// src/components/history/YearlyView.jsx
// ====================================================
// Yearly Heatmap View with Stats and Day Detail Logs
// ====================================================

import { useState } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight, Award, CheckCircle2, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
const SHORT_BN_MONTHS = ['জান','ফেব','মার','এপ্র','মে','জুন','জুলা','আগ','সেপ','অক্ট','নভে','ডিসে']

export default function YearlyView() {
  const { history, tasks } = useApp()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [selected, setSelected] = useState(null)

  const getFormattedDateKey = (date) => {
    const yearVal = date.getFullYear()
    const monthVal = String(date.getMonth() + 1).padStart(2, '0')
    const dayVal = String(date.getDate()).padStart(2, '0')
    return `${yearVal}-${monthVal}-${dayVal}`
  }

  // Calculate today's live completion percentage
  const totalTasksCount = tasks.length
  const completedTodayCount = tasks.filter(t => t.completed).length
  const todayPercent = totalTasksCount > 0 ? Math.round((completedTodayCount / totalTasksCount) * 100) : 0
  const todayCompletedIds = tasks.filter(t => t.completed).map(t => t.id)

  const getColor = (percent) => {
    if (percent === undefined) return 'bg-slate-200/60 dark:bg-slate-800 border-slate-300/40 hover:bg-slate-300'
    if (percent >= 80) return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-100 dark:shadow-none'
    if (percent >= 40) return 'bg-teal-500 text-white hover:bg-teal-600'
    if (percent > 0)   return 'bg-amber-400 text-amber-950 hover:bg-amber-500'
    return 'bg-slate-200/60 dark:bg-slate-800 border-slate-300/40 hover:bg-slate-300'
  }

  // Build all months
  const months = Array.from({ length: 12 }, (_, m) => {
    // Netlify: starts on Saturday offset: (firstDay.getDay() + 1) % 7
    const firstDay = new Date(year, m, 1)
    const startDayOffset = (firstDay.getDay() + 1) % 7
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    
    const cells = []
    for (let i = 0; i < startDayOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      
      let percent = undefined
      const isToday = key === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      if (isToday) {
        percent = todayPercent
      } else {
        const entry = history[key]
        if (entry) {
          percent = typeof entry === 'object' ? entry.percent : entry
        }
      }
      cells.push({ d, key, percent, isToday })
    }
    return { name: BN_MONTHS[m], shortName: SHORT_BN_MONTHS[m], cells }
  })

  // Yearly stats calculations
  let activeDays = 0
  let perfectDays = 0
  let yearlyCumulativePercent = 0
  let totalTrackedDays = 0

  Object.keys(history).forEach(dateKey => {
    if (dateKey.startsWith(String(year))) {
      const entry = history[dateKey]
      let percentage = typeof entry === 'object' ? entry.percent : entry

      if (percentage > 0) {
        activeDays++
        yearlyCumulativePercent += percentage
        totalTrackedDays++
      }
      if (percentage >= 80) {
        perfectDays++
      }
    }
  })

  // Merge today if in this year
  const todayKeyStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  if (todayKeyStr.startsWith(String(year)) && completedTodayCount > 0) {
    activeDays++
    yearlyCumulativePercent += todayPercent
    totalTrackedDays++
    if (todayPercent >= 80) {
      perfectDays++
    }
  }

  const yearlyAverage = totalTrackedDays > 0 ? Math.round(yearlyCumulativePercent / totalTrackedDays) : 0

  // Day detail calculations
  let detailDateLabel = 'আজকের তারিখ'
  let detailDesc = 'ক্যালেন্ডারের বা বাৎসরিক গ্রিডের যেকোনো দিনে ক্লিক করে সেই দিনের সম্পন্ন ও অসমাপ্ত কাজের বিস্তারিত লগ দেখুন!'
  let detailTasks = []

  if (selected) {
    const selectedDay = selected.split('-')[2]
    const selectedMonth = selected.split('-')[1]
    const selectedYear = selected.split('-')[0]
    detailDateLabel = `${toBengaliDigits(parseInt(selectedDay))}ই ${BN_MONTHS[parseInt(selectedMonth) - 1]} ${toBengaliDigits(selectedYear)}`

    let percentage = 0
    let completedList = []

    const isTodaySelected = selected === todayKeyStr
    if (isTodaySelected) {
      percentage = todayPercent
      completedList = todayCompletedIds
    } else {
      const entry = history[selected]
      if (entry) {
        if (typeof entry === 'object') {
          percentage = entry.percent
          completedList = entry.completed || []
        } else {
          percentage = entry
          completedList = []
        }
      }
    }

    const earnedXp = tasks.reduce((accum, curr) => {
      const wasDone = completedList.includes(curr.id)
      return accum + (wasDone ? curr.xp : 0)
    }, 0)

    if (percentage === 0 && completedList.length === 0) {
      detailDesc = "এই দিনটিতে কোনো কাজের ট্র্যাকিং ডেটা পাওয়া যায়নি।"
    } else {
      detailDesc = `সেদিন আপনি সফলভাবে ${toBengaliDigits(percentage)}% কাজ সম্পন্ন করেছিলেন এবং প্রায় +${toBengaliDigits(earnedXp)} XP অর্জন করেছিলেন!`
      detailTasks = tasks.map(task => {
        const wasDone = completedList.includes(task.id)
        return {
          id: task.id,
          text: task.text,
          completed: wasDone
        }
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Heatmap Grid */}
      <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            বাৎসরিক ধারাবাহিকতা গ্রিড — {toBengaliDigits(year)}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => { setYear(y => y - 1); setSelected(null); }} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>
            <button onClick={() => { setYear(y => y + 1); setSelected(null); }} className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1">
              পরবর্তী <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12 Months Heatmap container grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((mon, mi) => (
            <div key={mi} className="bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block border-b border-slate-200/50 dark:border-slate-700/50 pb-1">
                {mon.name}
              </span>
              <div className="grid grid-cols-7 gap-1 text-center">
                {mon.cells.map((cell, ci) =>
                  cell === null ? (
                    <div key={`empty-${ci}`} className="aspect-square" />
                  ) : (
                    <button
                      key={cell.key}
                      onClick={() => setSelected(selected === cell.key ? null : cell.key)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-lg text-[9px] font-bold flex items-center justify-center transition-all hover:scale-110 ${getColor(cell.percent)}
                        ${cell.isToday ? 'ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
                        ${selected === cell.key ? 'ring-2 ring-offset-1 ring-slate-400' : ''}
                      `}
                      title={`${cell.d}ই ${mon.name} - ${cell.percent !== undefined ? cell.percent : 0}% সম্পন্ন`}
                    >
                      {toBengaliDigits(cell.d)}
                    </button>
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
            { color: 'bg-teal-405',    label: '৫০–৭৯%' },
            { color: 'bg-amber-400',   label: '<৫০%' },
            { color: 'bg-slate-200/65 dark:bg-slate-800 border border-slate-300/40', label: '০% বা ডেটা নেই' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Side Stats & Day Detail */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        
        {/* Yearly Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-655" />
            বাৎসরিক সারাংশ — {toBengaliDigits(year)}
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">বাৎসরিক গড় অগ্রগতি</span>
              <span className="text-sm font-extrabold text-teal-650">{toBengaliDigits(yearlyAverage)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">পারফেক্ট দিন (৮০%+)</span>
              <span className="text-sm font-extrabold text-emerald-606">{toBengaliDigits(perfectDays)} দিন</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">সক্রিয় ট্র্যাকিং দিন</span>
              <span className="text-sm font-extrabold text-indigo-650">{toBengaliDigits(activeDays)} দিন</span>
            </div>
          </div>
        </div>

        {/* Interactive Day Detail Log */}
        <div className="bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-950 rounded-3xl p-5 custom-shadow space-y-4">
          <div className="text-center">
            <span className="text-xs text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider block">
              {detailDateLabel}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {detailDesc}
            </p>
          </div>
          
          {selected && detailTasks.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5 max-h-80 overflow-y-auto scrollbar-none">
              {detailTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs gap-4 ${
                    task.completed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300'
                      : 'bg-rose-50/10 dark:bg-rose-950/5 border-rose-100/20 dark:border-rose-900/10 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="font-medium truncate text-left flex-1 min-w-0">{task.text}</span>
                  <div className="shrink-0 text-[10px]">
                    {task.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold shrink-0">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> সম্পন্ন
                      </span>
                    ) : (
                      <span className="text-rose-450 dark:text-rose-900/50 flex items-center gap-1 font-bold shrink-0">
                        <XCircle className="w-4 h-4 shrink-0" /> বাদ পড়েছে
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
