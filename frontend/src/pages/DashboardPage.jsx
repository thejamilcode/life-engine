// src/pages/DashboardPage.jsx
// ====================================================
// Main Dashboard Page — সব section এর container
// ====================================================

import { useEffect } from 'react'
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
  const { currentView, loadAll, loading } = useApp()

  // App open হলে সব ডেটা লোড করো
  useEffect(() => {
    loadAll()
  }, [])

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
