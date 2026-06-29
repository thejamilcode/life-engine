// src/pages/RegisterPage.jsx
// ====================================================
// Register Page — Gmail OTP Verification Flow (2 Steps)
// ====================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, UserPlus, Mail, KeyRound,
  Send, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react'
import { sendOTP, verifyOTP } from '../api/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [step, setStep]           = useState(1)   // 1 = form, 2 = otp
  const [form, setForm]           = useState({ name: '', username: '', email: '', password: '' })
  const [otp, setOtp]             = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  // ── Step 1: Validate & send OTP ──────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    const { name, username, email, password } = form
    if (!username || !email || !password) {
      toast.error('username, ইমেইল ও পাসওয়ার্ড আবশ্যক')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('সঠিক Gmail ঠিকানা দিন')
      return
    }
    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }
    setSubmitting(true)
    console.log("Sending OTP request to backend for:", email)
    try {
      const res = await sendOTP({ name, username, email, password })
      console.log("OTP API Response:", res)
      setSentEmail(email)
      setStep(2)
      console.log("Step set to 2 successfully!")
      toast.success(res.message || `OTP কোড ${email} এ পাঠানো হয়েছে ✉️`)
    } catch (err) {
      console.error("Error sending OTP:", err)
      const msg = err.response?.data?.error || 'OTP পাঠাতে সমস্যা হয়েছে'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: Verify OTP → create account ──────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('৬ সংখ্যার OTP কোড দিন')
      return
    }
    setSubmitting(true)
    try {
      const data = await verifyOTP(sentEmail, otp)
      // Use the same key that AuthContext reads on startup
      localStorage.setItem('life_engine_token', data.access)
      if (data.refresh) localStorage.setItem('life_engine_refresh', data.refresh)
      toast.success(data.message || 'অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🎉')
      // Hard redirect so AuthContext reinitialises with the new token
      window.location.href = '/dashboard'
    } catch (err) {
      const msg = err.response?.data?.error || 'OTP যাচাই সমস্যা হয়েছে'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: Resend OTP ────────────────────────────────────────
  const handleResendOTP = async () => {
    setSubmitting(true)
    try {
      await sendOTP({ ...form, email: sentEmail })
      setOtp('')
      toast.success('নতুন OTP কোড পাঠানো হয়েছে ✉️')
    } catch (err) {
      toast.error('পুনরায় OTP পাঠাতে সমস্যা হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">লাইফ ইঞ্জিন</h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1 ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Gmail OTP যাচাই করুন'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            step === 1
              ? 'bg-teal-600 text-white'
              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
          }`}>
            {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            তথ্য পূরণ
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            step === 2
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <KeyRound className="w-3.5 h-3.5" />
            OTP যাচাই
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 custom-shadow border border-slate-100 dark:border-slate-800">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {[
                { key: 'name',     label: 'আপনার নাম',      placeholder: 'যেমন: Jamil Hossain',  type: 'text'     },
                { key: 'username', label: 'ইউজারনেম',         placeholder: 'যেমন: jamil123',        type: 'text'     },
                { key: 'email',    label: 'Gmail ঠিকানা ✉️',  placeholder: 'youremail@gmail.com',  type: 'email'    },
                { key: 'password', label: 'পাসওয়ার্ড',        placeholder: 'কমপক্ষে ৬ অক্ষর',       type: 'password' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.key !== 'name'}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
                  />
                </div>
              ))}

              <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-2xl px-4 py-3">
                <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  আপনার Gmail এ একটি ৬-সংখ্যার OTP কোড পাঠানো হবে।
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'OTP পাঠানো হচ্ছে...' : 'Gmail OTP পাঠান'}
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4">
                <Mail className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">OTP পাঠানো হয়েছে!</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium break-all">{sentEmail}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  ৬-সংখ্যার OTP কোড
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  autoFocus
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="381924"
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-center text-2xl font-extrabold tracking-[0.5em] focus:outline-none focus:border-teal-500 dark:text-white transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-2 text-center">Spam/Junk ফোল্ডারও চেক করুন</p>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? 'যাচাই হচ্ছে...' : 'OTP যাচাই করুন ও অ্যাকাউন্ট তৈরি করুন'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-teal-600 font-medium transition-all"
                >
                  ← তথ্য পরিবর্তন করুন
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={submitting}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-bold flex items-center gap-1 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> পুনরায় পাঠান
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          আগে থেকে অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
