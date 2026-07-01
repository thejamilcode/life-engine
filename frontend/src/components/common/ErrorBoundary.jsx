import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              অ্যাপ্লিকেশন লোড হতে সমস্যা হয়েছে
            </h1>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। নিচের ডিবাগ তথ্য দেখে সমস্যাটি চিহ্নিত করতে পারেন:
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 my-4 text-left border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-1">
                ERROR LOG:
              </span>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all block whitespace-pre-wrap max-h-40 overflow-y-auto">
                {this.state.error?.message || String(this.state.error)}
              </code>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                ক্যাশ মেমরি পরিষ্কার করে রিলোড করুন
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
