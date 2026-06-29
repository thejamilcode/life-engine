// src/pages/DashboardPage.jsx
// ====================================================
// Main Dashboard Page — containers, animations & banners
// ====================================================

import { useEffect, useRef } from 'react'
import { Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import ViewSwitcher from '../components/layout/ViewSwitcher'
import DailyView from '../components/dashboard/DailyView'
import MonthlyView from '../components/history/MonthlyView'
import YearlyView from '../components/history/YearlyView'
import SettingsModal from '../components/modals/SettingsModal'
import ConfirmModal from '../components/modals/ConfirmModal'
import ResourcesSection from '../components/profile/ResourcesSection'
import Footer from '../components/layout/Footer'

export default function DashboardPage() {
  const { currentView, loadAll, loading, stats, profile } = useApp()
  const prevPercent = useRef(0)

  // App open হলে সব ডেটা লোড করো
  useEffect(() => {
    loadAll()
  }, [])

  // Play chime and trigger confetti on 100% completion
  useEffect(() => {
    if (stats) {
      const currentPercent = stats.percent || 0
      const totalTasks = stats.total_tasks || 0

      if (currentPercent === 100 && totalTasks > 0 && prevPercent.current !== 100) {
        // Play Chime
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
          const playNote = (frequency, startTime, duration) => {
            const osc = audioCtx.createOscillator()
            const gain = audioCtx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(frequency, startTime)
            gain.gain.setValueAtTime(0.15, startTime)
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
            osc.connect(gain)
            gain.connect(audioCtx.destination)
            osc.start(startTime)
            osc.stop(startTime + duration)
          }
          const now = audioCtx.currentTime
          playNote(523.25, now, 0.15)
          playNote(659.25, now + 0.08, 0.25)
        } catch (e) {
          console.error(e)
        }

        // Trigger Confetti
        const colors = ['#34d399', '#38bdf8', '#fbbf24', '#f43f5e', '#a78bfa', '#2dd4bf']
        const container = document.getElementById('confetti-container')
        if (container) {
          for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div')
            confetti.className = 'confetti'
            confetti.style.left = Math.random() * 100 + 'vw'
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            confetti.style.animationDelay = Math.random() * 1.5 + 's'
            confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's'
            container.appendChild(confetti)
            setTimeout(() => confetti.remove(), 3500)
          }
        }
      }
      prevPercent.current = currentPercent
    }
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 min-h-screen pb-20 relative overflow-x-hidden">
      {/* Confetti Container */}
      <div id="confetti-container" className="absolute inset-0 pointer-events-none overflow-hidden z-50"></div>

      {/* Header with stats */}
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-10">

        {/* Active Formula Banner with beautiful glow */}
        {profile && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 custom-shadow mb-6 border border-teal-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-2xl text-teal-600 dark:text-teal-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">চলতি মাস্টারি ফর্মুলা</span>
                <span className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200">{profile.formulaTitle}</span>
              </div>
            </div>
            <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-900/60 self-start sm:self-auto">
              {profile.formulaPhase}
            </span>
          </section>
        )}

        {/* View Tabs */}
        <ViewSwitcher />

        {/* Conditional Views */}
        {currentView === 'daily'   && <DailyView />}
        {currentView === 'monthly' && <MonthlyView />}
        {currentView === 'yearly'  && <YearlyView />}

        {/* Resources always visible */}
        <ResourcesSection />

        {/* Footer */}
        <Footer />
      </main>

      {/* Modals */}
      <SettingsModal />
      <ConfirmModal />
    </div>
  )
}
