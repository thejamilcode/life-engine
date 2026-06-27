// src/components/profile/ResourcesSection.jsx
import { ExternalLink, ArrowUpRight, Video, HeartPulse } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ResourcesSection() {
  const { profile } = useApp()
  if (!profile) return null

  const items = (profile.resources || []).filter(r => r.title?.trim())
  if (items.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 custom-shadow my-6 border border-slate-100 dark:border-slate-800">
      <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <ExternalLink className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        সহায়ক লিংক ও রিসোর্স সেন্টার
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((res, i) => (
          <ResourceCard key={i} res={res} />
        ))}
      </div>
    </section>
  )
}

function ResourceCard({ res }) {
  const hasUrl = res.url?.trim()

  if (hasUrl) {
    return (
      <a
        href={res.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col justify-between p-4 rounded-2xl bg-teal-50/20 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-slate-800/50 border border-teal-100/40 dark:border-teal-900/30 transition-all group"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              {res.title}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{res.desc}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-4">
          {res.linkText || 'লিঙ্কটি দেখুন'}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </a>
    )
  }

  return (
    <div className="flex flex-col p-4 rounded-2xl bg-teal-50/20 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-900/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{res.title}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{res.desc}</p>
        </div>
      </div>
    </div>
  )
}
