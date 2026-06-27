// src/context/AppContext.jsx
// ====================================================
// Global App State — Tasks, Stats, Profile, Theme
// ====================================================

import { createContext, useContext, useState, useCallback } from 'react'
import { getTasks, createTask, deleteTask, toggleTaskComplete, resetDailyTasks, markAllComplete } from '../api/tasks'
import { getDashboardStats, getHistory, getProfile, updateProfile } from '../api/dashboard'
import toast from 'react-hot-toast'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [tasks, setTasks]         = useState([])
  const [stats, setStats]         = useState({ total_xp: 0, streak: 0, completed_today: 0, total_tasks: 0, percent: 0 })
  const [history, setHistory]     = useState({})
  const [profile, setProfile]     = useState(null)
  const [theme, setTheme]         = useState(() => localStorage.getItem('life_engine_theme') || 'light')
  const [currentView, setCurrentView] = useState('daily')
  const [loading, setLoading]     = useState(false)

  // ============================
  // DATA LOADING FUNCTIONS
  // ============================

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      toast.error('টাস্ক লোড করতে সমস্যা হয়েছে')
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Stats load error:', err)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const data = await getHistory()
      setHistory(data)
    } catch (err) {
      console.error('History load error:', err)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (err) {
      console.error('Profile load error:', err)
    }
  }, [])

  // সব ডেটা একসাথে লোড
  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadTasks(), loadStats(), loadHistory(), loadProfile()])
    setLoading(false)
  }, [loadTasks, loadStats, loadHistory, loadProfile])

  // ============================
  // TASK ACTIONS
  // ============================

  const addTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData)
      setTasks(prev => [...prev, newTask])
      await loadStats()
      toast.success('নতুন টাস্ক যোগ হয়েছে! ✅')
    } catch (err) {
      toast.error('টাস্ক যোগ করতে সমস্যা হয়েছে')
    }
  }

  const removeTask = async (id) => {
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      await loadStats()
      toast.success('টাস্ক মুছে ফেলা হয়েছে')
    } catch (err) {
      toast.error('টাস্ক মুছতে সমস্যা হয়েছে')
    }
  }

  const toggleTask = async (id) => {
    try {
      const result = await toggleTaskComplete(id)
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, completed: result.completed } : t
      ))
      await loadStats()
      if (result.completed) {
        toast.success(`+${result.xp_earned} XP অর্জিত! 🎯`)
      }
    } catch (err) {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন')
    }
  }

  const resetDay = async () => {
    try {
      await resetDailyTasks()
      await loadAll()
      toast.success('নতুন দিন শুরু হয়েছে! বিসমিল্লাহ 🌅')
    } catch (err) {
      toast.error('রিসেট করতে সমস্যা হয়েছে')
    }
  }

  const markAll = async () => {
    try {
      await markAllComplete()
      await loadAll()
      toast.success('সব টাস্ক সম্পন্ন! আলহামদুলিল্লাহ 🎉')
    } catch (err) {
      toast.error('সমস্যা হয়েছে')
    }
  }

  // ============================
  // PROFILE ACTIONS
  // ============================

  const saveProfile = async (profileData) => {
    try {
      const updated = await updateProfile(profileData)
      setProfile(updated)
      toast.success('প্রোফাইল সেভ হয়েছে! ✨')
    } catch (err) {
      toast.error('প্রোফাইল সেভ করতে সমস্যা হয়েছে')
    }
  }

  // ============================
  // THEME
  // ============================

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'sepia']
    const next = themes[(themes.indexOf(theme) + 1) % themes.length]
    setTheme(next)
    localStorage.setItem('life_engine_theme', next)

    document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('sepia')
    if (next === 'dark')  document.documentElement.classList.add('dark')
    if (next === 'sepia') document.documentElement.classList.add('sepia')
  }

  return (
    <AppContext.Provider value={{
      tasks, stats, history, profile, theme, currentView, loading,
      setCurrentView, loadAll, loadStats, loadHistory,
      addTask, removeTask, toggleTask, resetDay, markAll,
      saveProfile, cycleTheme,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
