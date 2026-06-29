// src/components/history/MonthlyView.jsx
// ====================================================
// Monthly Calendar View with Stats and Day Detail Logs
// ====================================================

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Award, CheckCircle2, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
const BN_DAYS   = ['শনি','রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র']

export default function MonthlyView() {
  const { history, tasks } = useApp()
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [selected, setSelected]   = useState(null)

  const getKey = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  // Calculate today's live completion percentage
  const totalTasksCount = tasks.length
  const completedTodayCount = tasks.filter(t => t.completed).length
  const todayPercent = totalTasksCount > 0 ? Math.round((completedTodayCount / totalTasksCount) * 100) : 0
  const todayCompletedIds = tasks.filter(t => t.completed).map(t => t.id)

  // Build calendar grid cells
  // Netlify: firstDay offset is (standardDayOfWeek + 1) % 7 because week starts on Saturday in Bengali view (Shoni to Shukro)
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const banyWeekDayOffset = (firstDayOfWeek + 1) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const cells = []
  for (let i = 0; i < banyWeekDayOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getColor = (percent) => {
    if (percent === undefined) return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/50 dark:border-slate-700/60'
    if (percent >= 80) return 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
    if (percent >= 40) return 'bg-teal-500 text-white shadow-sm hover:bg-teal-600'
    if (percent > 0)   return 'bg-amber-400 text-amber-950 hover:bg-amber-500'
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

  // Monthly stats calculations
  let activeDaysCount = 0
  let perfectDaysCount = 0
  let cumulativePercentage = 0
  let totalTrackedDays = 0

  const todayKey = getKey(now.getDate())

  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = getKey(day)
    let percentage = undefined

    if (dayKey === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`) {
      percentage = todayPercent
    } else {
      const entry = history[dayKey]
      if (entry !== undefined) {
        percentage = typeof entry === 'object' ? entry.percent : entry
      }
    }

    if (percentage !== undefined && percentage > 0) {
      activeDaysCount++
      cumulativePercentage += percentage
      totalTrackedDays++
    }
    if (percentage !== undefined && percentage >= 80) {
      perfectDaysCount++
    }
  }

  const monthlyAverage = totalTrackedDays > 0 ? Math.round(cumulativePercentage / totalTrackedDays) : 0

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

    const isTodaySelected = selected === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
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
      const isCustomTask = String(curr.id).startsWith('custom_')
      // For tasks in history, we match either ID or text for consistency
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
      
      {/* Calendar Panel */}
      <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 custom-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
        
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
        <div className="grid grid-cols-7 gap-1.5 xs:gap-2 md:gap-2.5 text-center font-bold">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="py-2" />
            const key = getKey(day)
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

            return (
              <button
                key={key}
                onClick={() => setSelected(selected === key ? null : key)}
                className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 mx-auto rounded-full text-xs font-extrabold flex items-center justify-center transition-all hover:scale-110 ${getColor(percent)}
                  ${isToday ? 'ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
                  ${selected === key ? 'ring-2 ring-offset-1 ring-slate-400' : ''}
                `}
              >
                {toBengaliDigits(day)}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-teal-700"></span> ০% সম্পন্ন</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400"></span> ১% - ৩৯%</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-teal-500"></span> ৪০% - ৭৯%</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> ৮০%+ সম্পন্ন</span>
        </div>
      </section>

      {/* Side Metrics & Day Detail */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        
        {/* Monthly Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-655" />
            মাসিক পরিসংখ্যান
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">গড় অগ্রগতি</span>
              <span className="text-sm font-extrabold text-teal-650">{toBengaliDigits(monthlyAverage)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span class="text-xs text-slate-500 dark:text-slate-400">পারফেক্ট দিন (৮০%+)</span>
              <span className="text-sm font-extrabold text-emerald-605">{toBengaliDigits(perfectDaysCount)} দিন</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">সক্রিয় ট্র্যাক করা দিন</span>
              <span className="text-sm font-extrabold text-indigo-605">{toBengaliDigits(activeDaysCount)} দিন</span>
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
