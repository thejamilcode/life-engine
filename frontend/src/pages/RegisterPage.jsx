// src/pages/RegisterPage.jsx
// ====================================================
// Register Page — Direct Registration (No OTP Flow)
// ====================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, UserPlus, Loader2 } from 'lucide-react'
import { registerUser } from '../api/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm]           = useState({ name: '', username: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    const { name, username, email, password } = form
    
    if (!username || !email || !password) {
      toast.error('username, ইমেইল ও পাসওয়ার্ড আবশ্যক')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('সঠিক ইমেইল ঠিকানা দিন')
      return
    }
    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }

    setSubmitting(true)
    try {
      const data = await registerUser({ name, username, email, password })
      
      // Save tokens & user data (matching AuthContext login)
      localStorage.setItem('life_engine_token', data.access)
      if (data.refresh) localStorage.setItem('life_engine_refresh', data.refresh)
      
      toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম 🎉')
      
      // Hard redirect so AuthContext resets with the new token
      window.location.href = '/'
    } catch (err) {
      const msg = err.response?.data?.error || 
                  (err.response?.data?.username ? err.response.data.username[0] : null) ||
                  (err.response?.data?.email ? err.response.data.email[0] : null) ||
                  'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">লাইফ ইঞ্জিন</h1>
          <p className="text-xs text-slate-400 mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 custom-shadow border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: 'name',     label: 'আপনার নাম',      placeholder: 'যেমন: Jamil Hossain',  type: 'text'     },
              { key: 'username', label: 'ইউজারনেম',         placeholder: 'যেমন: jamil123',        type: 'text'     },
              { key: 'email',    label: 'ইমেইল ঠিকানা ✉️', placeholder: 'youremail@gmail.com',  type: 'email'    },
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>
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
