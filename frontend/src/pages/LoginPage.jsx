// src/pages/LoginPage.jsx
// ====================================================
// Login Page — Username/Password & Forgot Password Flow
// ====================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, LogIn, Eye, EyeOff,
  Mail, Send, CheckCircle2, Loader2, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendForgotPasswordOTP, resetPassword } from '../api/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  // App Mode: 'login' | 'forgot' (request OTP) | 'reset' (verify & reset)
  const [mode, setMode]             = useState('login') 
  const [form, setForm]             = useState({ username: '', password: '' })
  const [showPass, setShowPass]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Forgot password form states
  const [resetUsername, setResetUsername] = useState('')
  const [resetEmail, setResetEmail]       = useState('')
  const [otpCode, setOtpCode]             = useState('')
  const [newPassword, setNewPassword]     = useState('')
  const [showNewPass, setShowNewPass]     = useState(false)

  // ── Standard Login handler ───────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('সব তথ্য পূরণ করুন')
      return
    }
    setSubmitting(true)
    try {
      await login(form.username, form.password)
      toast.success('স্বাগতম! আলহামদুলিল্লাহ 🎉')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error('ভুল username বা password')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 1: Send Reset OTP ────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!resetUsername) {
      toast.error('ইউজারনেম অথবা ইমেইল দিন')
      return
    }
    setSubmitting(true)
    try {
      const res = await sendForgotPasswordOTP(resetUsername)
      setResetEmail(res.email)
      setMode('reset')
      toast.success(res.message || 'পাসওয়ার্ড রিসেট কোড পাঠানো হয়েছে ✉️')
    } catch (err) {
      const msg = err.response?.data?.error || 'রিসেট অনুরোধ ব্যর্থ হয়েছে'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: Verify Reset OTP & Reset Password ────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      toast.error('৬ সংখ্যার OTP কোড দিন')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }
    setSubmitting(true)
    try {
      const res = await resetPassword(resetEmail, otpCode, newPassword)
      toast.success(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে 🎉')
      // Reset forms and return to login mode
      setMode('login')
      setForm({ username: resetUsername.includes('@') ? '' : resetUsername, password: '' })
      setOtpCode('')
      setNewPassword('')
    } catch (err) {
      const msg = err.response?.data?.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="w-full max-w-sm">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">লাইফ ইঞ্জিন</h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'আপনার অ্যাকাউন্টে প্রবেশ করুন'}
            {mode === 'forgot' && 'পাসওয়ার্ড ভুলে গেছেন?'}
            {mode === 'reset' && 'নতুন পাসওয়ার্ড সেট করুন'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 custom-shadow border border-slate-100 dark:border-slate-800">
          
          {/* ── MODE 1: Standard Login Form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username / Email */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  ইউজারনেম অথবা ইমেইল
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="ইউজারনেম অথবা জিমেইল লিখুন"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
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
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {submitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>
            </form>
          )}

          {/* ── MODE 2: Forgot Password (Request Code) ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  ইউজারনেম অথবা ইমেইল
                </label>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={e => setResetUsername(e.target.value)}
                  placeholder="রেজিস্ট্রেশন করা ইউজারনেম বা জিমেইল"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
                />
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-2xl px-4 py-3">
                <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  আপনার নিবন্ধিত জিমেইলে ওটিপি (OTP) কোড পাঠানো হবে।
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'ওটিপি পাঠানো হচ্ছে...' : 'রিসেট ওটিপি পাঠান'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                লগইন পেজে ফিরুন
              </button>
            </form>
          )}

          {/* ── MODE 3: Verify Code & Save New Password ── */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4">
                <Mail className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">রিসেট কোড পাঠানো হয়েছে!</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium break-all">{resetEmail}</p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  ৬-সংখ্যার রিসেট কোড
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="যেমন: 489210"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-center text-xl font-bold tracking-[0.3em] focus:outline-none focus:border-teal-500 dark:text-white transition-all"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  নতুন পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-slate-400 hover:text-teal-600 font-medium transition-all"
                >
                  ← পুনরায় কোড পাঠান
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                >
                  লগইন পেজে ফিরুন
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Register link */}
        {mode === 'login' && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
            নতুন ব্যবহারকারী?{' '}
            <Link to="/register" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              রেজিস্ট্রেশন করুন
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
