// src/components/layout/Header.jsx
// ====================================================
// Premium Header — Progress bar, streak, XP, controls
// ====================================================

import { useState } from 'react'
import { Sparkles, ShieldCheck, Settings, Eye } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { toBengaliDigits, getRandomQuote, getBengaliDate } from '../../utils/helpers'

const THEME_LABELS = { light: '☀️ লাইট মোড', dark: '🌙 ডার্ক মোড', sepia: '📖 বুক মোড' }

export default function Header() {
  const { stats, profile, theme, cycleTheme } = useApp()
  const { logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const percent       = stats?.percent || 0
  const streak        = stats?.streak || 0
  const xp            = stats?.total_xp || 0
  const completedToday = stats?.completed_today || 0
  const totalTasks    = stats?.total_tasks || 0

  // SVG circle animation
  const circumference = 251.2
  const dashOffset    = circumference - (percent / 100) * circumference

  const userName = profile?.userName || 'লাইফ ইঞ্জিন'

  return (
    <header className="premium-gradient text-white pt-8 pb-16 px-4 md:px-8 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none rounded-b-[2.5rem] md:rounded-b-[3.5rem]"></div>

      <div className="max-w-6xl mx-auto">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-teal-200 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {userName} এর লাইফ ইঞ্জিন
              </h1>
              <p className="text-[11px] text-teal-100 flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                {getBengaliDate()}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap sm:flex-row gap-2 items-stretch sm:items-center w-full md:w-auto">
            {/* Settings */}
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-settings'))}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 text-xs flex items-center gap-1.5 transition-all justify-center font-bold text-teal-100 hover:text-white"
            >
              <Settings className="w-4 h-4 text-emerald-300" />
              <span>কাস্টমাইজ ⚙️</span>
            </button>

            {/* Theme Cycle */}
            <button
              onClick={cycleTheme}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs flex items-center gap-2 transition-all justify-center"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span className="font-bold text-teal-50">{THEME_LABELS[theme]}</span>
            </button>

            {/* User Badge + Logout */}
            <div className="relative">
              <button
                onClick={() => setShowLogout(!showLogout)}
                className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs flex items-center gap-1.5 justify-center"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="font-bold text-teal-50">{profile?.userName || 'আমার প্রোফাইল'}</span>
              </button>
              {showLogout && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 min-w-[120px]">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 text-xs text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  >
                    লগআউট 🚪
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white/10 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-xs text-teal-100 block font-medium">আজকের সার্বিক স্কোর</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl md:text-5xl font-extrabold">{percent}%</span>
                <span className="text-xs md:text-sm text-teal-200">+{toBengaliDigits(xp)} XP অর্জিত</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-teal-100">
                  <span>সম্পন্ন টাস্ক</span>
                  <span className="font-bold">
                    {toBengaliDigits(completedToday)}/{toBengaliDigits(totalTasks)}
                  </span>
                </div>
                <div className="w-full bg-teal-950/40 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quote + Streak Ring */}
            <div className="flex items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4">
              <p className="text-[11px] md:text-xs text-teal-100 text-left md:text-center font-medium max-w-[200px]">
                {getRandomQuote()}
              </p>
              {/* Streak Ring */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 aspect-square flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" className="text-teal-900/30" strokeWidth="6" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="currentColor"
                    className="text-emerald-300 transition-all duration-700 ease-out"
                    strokeWidth="6" fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="text-lg md:text-xl font-bold block leading-none">{toBengaliDigits(streak)}</span>
                  <span className="text-[8px] md:text-[9px] text-teal-200 uppercase tracking-wider block mt-1">STREAK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Formula Banner */}
        {profile && (
          <div className="mt-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-teal-100">{profile.formulaTitle}</span>
            <span className="bg-teal-50/20 text-teal-100 font-bold text-xs px-3 py-1 rounded-full border border-teal-100/20 self-start sm:self-auto">
              {profile.formulaPhase}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
