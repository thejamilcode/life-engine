// src/components/layout/Footer.jsx
import { ShieldAlert } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Footer() {
  const { profile } = useApp()
  const name = profile?.userName || 'Smart Life'

  return (
    <footer className="text-center space-y-2 pt-4 pb-4">
      <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 px-4 py-1.5 rounded-full text-[10px] md:text-xs text-teal-700 dark:text-teal-400 font-semibold border border-teal-100 dark:border-teal-900/60">
        <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
        "নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে।"
      </div>
      <p className="text-[10px] md:text-xs text-slate-400">
        © {name}'s Smart Life Dashboard 2026. Built with Clean Code & Iman.
      </p>
    </footer>
  )
}
