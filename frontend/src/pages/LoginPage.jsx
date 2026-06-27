// src/pages/LoginPage.jsx
// ====================================================
// Login Page — Username & Password দিয়ে লগইন
// ====================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('সব তথ্য পূরণ করুন')
      return
    }
    setSubmitting(true)
    try {
      await login(form.username, form.password)
      toast.success('স্বাগতম! আলহামদুলিল্লাহ 🎉')
    } catch (err) {
      toast.error('ভুল username বা password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">লাইফ ইঞ্জিন</h1>
          <p className="text-xs text-slate-400 mt-1">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 custom-shadow border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                ইউজারনেম
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="আপনার username লিখুন"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {submitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          নতুন ব্যবহারকারী?{' '}
          <Link to="/register" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
