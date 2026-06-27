// src/pages/RegisterPage.jsx
// ====================================================
// Register Page — নতুন অ্যাকাউন্ট তৈরি
// ====================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.username || !form.password) {
      toast.error('নাম, username ও password আবশ্যক')
      return
    }
    if (form.password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }
    setSubmitting(true)
    try {
      await register(form)
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🎉')
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || 'রেজিস্ট্রেশন সমস্যা হয়েছে'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { key: 'name',     label: 'আপনার নাম',   placeholder: 'যেমন: Jamil Hossain', type: 'text'     },
    { key: 'username', label: 'ইউজারনেম',     placeholder: 'যেমন: jamil123',       type: 'text'     },
    { key: 'email',    label: 'ইমেইল (ঐচ্ছিক)', placeholder: 'jamil@example.com', type: 'email'    },
    { key: 'password', label: 'পাসওয়ার্ড',    placeholder: 'কমপক্ষে ৬ অক্ষর',      type: 'password' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">লাইফ ইঞ্জিন</h1>
          <p className="text-xs text-slate-400 mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 custom-shadow border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 dark:text-white transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 premium-gradient text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
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
