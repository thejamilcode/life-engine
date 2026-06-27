// src/components/modals/ConfirmModal.jsx
// ====================================================
// Reusable Confirm Dialog Modal
// ====================================================

import { useEffect, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ConfirmModal() {
  const { resetDay, markAll } = useApp()
  const [modal, setModal] = useState(null) // { title, desc, onConfirm }

  useEffect(() => {
    const openHandler = (e) => setModal(e.detail)
    const resetHandler  = () => { resetDay();  setModal(null) }
    const markHandler   = () => { markAll();   setModal(null) }

    document.addEventListener('open-confirm', openHandler)
    document.addEventListener('do-reset', resetHandler)
    document.addEventListener('do-mark-all', markHandler)

    return () => {
      document.removeEventListener('open-confirm', openHandler)
      document.removeEventListener('do-reset', resetHandler)
      document.removeEventListener('do-mark-all', markHandler)
    }
  }, [resetDay, markAll])

  if (!modal) return null

  const handleConfirm = () => {
    modal.onConfirm?.()
    setModal(null)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{modal.title}</h4>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{modal.desc}</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setModal(null)}
            className="flex-1 py-3 text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            বাতিল
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 text-xs md:text-sm bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md transition-all"
          >
            হ্যাঁ, নিশ্চিত
          </button>
        </div>
      </div>
    </div>
  )
}
