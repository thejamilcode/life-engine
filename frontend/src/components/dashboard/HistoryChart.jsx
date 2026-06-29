// src/components/dashboard/HistoryChart.jsx
// ====================================================
// Premium SVG Slope Area Graph Trend Analyzer
// ====================================================

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toBengaliDigits } from '../../utils/helpers'

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
]

export default function HistoryChart() {
  const { history, tasks } = useApp()
  const [timeframe, setTimeframe] = useState('weekly')

  const getFormattedDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Calculate today's live completion percentage
  const totalTasks = tasks.length
  const completedTodayCount = tasks.filter(t => t.completed).length
  const todayPercent = totalTasks > 0 ? Math.round((completedTodayCount / totalTasks) * 100) : 0

  const scoreHistory = []
  const labels = []
  let trendStatus = 'stable'

  if (timeframe === 'weekly') {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days.push(getFormattedDateKey(d))
    }

    last7Days.forEach((dateKey, index) => {
      let percentage = 0
      const todayKey = getFormattedDateKey(new Date())
      if (dateKey === todayKey) {
        percentage = todayPercent
      } else {
        const entry = history[dateKey]
        percentage = entry ? (typeof entry === 'object' ? entry.percent : entry) : 0
      }
      scoreHistory.push(percentage)

      const dateParts = dateKey.split('-')
      labels.push(`${dateParts[2]}/${dateParts[1]}`)
    })

    const yesterdayScore = scoreHistory[5] || 0
    const todayScore = scoreHistory[6] || 0
    if (todayScore > yesterdayScore) trendStatus = 'increasing'
    else if (todayScore < yesterdayScore) trendStatus = 'decreasing'

  } else if (timeframe === 'monthly') {
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last30Days.push(getFormattedDateKey(d))
    }

    last30Days.forEach((dateKey, index) => {
      let percentage = 0
      const todayKey = getFormattedDateKey(new Date())
      if (dateKey === todayKey) {
        percentage = todayPercent
      } else {
        const entry = history[dateKey]
        percentage = entry ? (typeof entry === 'object' ? entry.percent : entry) : 0
      }
      scoreHistory.push(percentage)

      if (index % 5 === 0 || index === 29) {
        const dateParts = dateKey.split('-')
        labels.push(`${dateParts[2]}/${dateParts[1]}`)
      } else {
        labels.push('')
      }
    })

    const firstHalfSum = scoreHistory.slice(0, 15).reduce((a, b) => a + b, 0)
    const secondHalfSum = scoreHistory.slice(15, 30).reduce((a, b) => a + b, 0)
    const firstHalfAvg = firstHalfSum / 15
    const secondHalfAvg = secondHalfSum / 15

    if (secondHalfAvg > firstHalfAvg + 2) trendStatus = 'increasing'
    else if (secondHalfAvg < firstHalfAvg - 2) trendStatus = 'decreasing'

  } else if (timeframe === 'yearly') {
    const currentYear = new Date().getFullYear()
    for (let m = 0; m < 12; m++) {
      let monthSum = 0
      let daysCount = 0

      const daysInMonth = new Date(currentYear, m + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const dateInstance = new Date(currentYear, m, d)
        const dateKey = getFormattedDateKey(dateInstance)

        let percentage = 0
        const entry = history[dateKey]
        const todayKey = getFormattedDateKey(new Date())

        if (dateKey === todayKey) {
          percentage = todayPercent
        } else if (entry) {
          percentage = typeof entry === 'object' ? entry.percent : entry
        }

        if (entry || dateKey === todayKey) {
          monthSum += percentage
          daysCount++
        }
      }

      const monthAvg = daysCount > 0 ? Math.round(monthSum / daysCount) : 0
      scoreHistory.push(monthAvg)
      labels.push(BN_MONTHS[m].substring(0, 4))
    }

    const currentMonthIdx = new Date().getMonth()
    const currentMonthAvg = scoreHistory[currentMonthIdx] || 0
    const prevMonthAvg = scoreHistory[currentMonthIdx - 1] || scoreHistory[0] || 0

    if (currentMonthAvg > prevMonthAvg) trendStatus = 'increasing'
    else if (currentMonthAvg < prevMonthAvg) trendStatus = 'decreasing'
  }

  // Draw SVG slope line & area paths
  const svgW = 300
  const svgH = 80
  const paddingX = 15
  const plotW = svgW - (paddingX * 2)
  const dataLen = scoreHistory.length
  const stepX = plotW / (dataLen - 1 || 1)

  const points = scoreHistory.map((val, i) => {
    const x = paddingX + (i * stepX)
    const y = 70 - (val / 100 * 60)
    return { x, y, val }
  })

  let linePathString = ''
  let areaPathString = ''

  if (points.length > 0) {
    linePathString = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + (stepX / 2)
      const cpY1 = points[i].y
      const cpX2 = points[i + 1].x - (stepX / 2)
      const cpY2 = points[i + 1].y
      linePathString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`
    }
    areaPathString = `${linePathString} L ${points[dataLen - 1].x} 78 L ${points[0].x} 78 Z`
  }

  let trendBadgeText = 'স্থিতিশীল ⚖️'
  let trendBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/40'
  let trendColor = '#0d9488'
  let fillGradientId = 'gradient-stable'

  if (trendStatus === 'increasing') {
    trendBadgeText = 'ঊর্ধ্বমুখী 📈'
    trendBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40'
    trendColor = '#10b981'
    fillGradientId = 'gradient-increasing'
  } else if (trendStatus === 'decreasing') {
    trendBadgeText = 'निम्নমুখী 📉'
    trendBadgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/40'
    trendColor = '#f43f5e'
    fillGradientId = 'gradient-decreasing'
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 custom-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-teal-650 dark:text-teal-400" />
              অগ্রগতি ও রূপান্তর ট্রেন্ড
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">টাইমফ্রেম সিলেক্ট করে অগ্রগতি ট্র্যাক করুন</p>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide border ${trendBadgeClass}`}>
            {trendBadgeText}
          </span>
        </div>

        {/* Timeframe Switcher */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-slate-700/50">
          {['weekly', 'monthly', 'yearly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-700 text-teal-850 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tf === 'weekly' ? 'সাপ্তাহিক' : tf === 'monthly' ? 'মাসিক' : 'বাৎসরিক'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Slope Area Sparkline */}
      <div className="relative w-full h-36">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 80">
          <defs>
            <linearGradient id="gradient-increasing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-decreasing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-stable" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {points.length > 0 && (
            <>
              <path d={areaPathString} fill={`url(#${fillGradientId})`} />
              <path d={linePathString} fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((pt, index) => {
                const isToday = index === (dataLen - 1)
                const shouldShowDot = (timeframe === 'weekly') || (timeframe === 'yearly') || isToday || (index % 5 === 0)
                if (!shouldShowDot) return null

                const r = isToday ? 4.5 : 3
                return (
                  <circle
                    key={index}
                    cx={pt.x}
                    cy={pt.y}
                    r={r}
                    fill={isToday ? '#ffffff' : trendColor}
                    stroke={trendColor}
                    strokeWidth={isToday ? '3' : '1.5'}
                    className="cursor-pointer hover:scale-125 transition-all duration-200"
                  >
                    <title>{`${pt.val}% সম্পন্ন`}</title>
                  </circle>
                )
              })}
            </>
          )}
        </svg>
      </div>

      {/* X-Axis labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        {labels.map((lbl, idx) => (
          <span key={idx} className="truncate text-[8px] xs:text-[9px]">
            {toBengaliDigits(lbl)}
          </span>
        ))}
      </div>
    </section>
  )
}
