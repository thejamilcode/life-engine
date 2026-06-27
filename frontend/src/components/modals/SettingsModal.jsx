// src/components/modals/SettingsModal.jsx
// ====================================================
// Profile & Settings Customizer Modal
// ====================================================

import { useEffect, useState } from 'react'
import { X, Sliders, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function SettingsModal() {
  const { profile, saveProfile } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const handler = () => {
      if (profile) setForm(JSON.parse(JSON.stringify(profile)))
      setOpen(true)
    }
    document.addEventListener('open-settings', handler)
    return () => document.removeEventListener('open-settings', handler)
  }, [profile])

  if (!open || !form) return null

  const updateFocus = (i, field, value) => {
    const next = [...form.focusTime]
    next[i] = { ...next[i], [field]: field === 'percent' ? parseInt(value) : value }
    setForm({ ...form, focusTime: next })
  }

  const updateAvoid = (i, field, value) => {
    const next = [...form.avoidList]
    next[i] = { ...next[i], [field]: value }
    setForm({ ...form, avoidList: next })
  }

  const updateResource = (i, field, value) => {
    const next = [...form.resources]
    next[i] = { ...next[i], [field]: value }
    setForm({ ...form, resources: next })
  }

  const handleSave = async () => {
    await saveProfile(form)
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 mx-auto overflow-y-auto max-h-[90vh] scrollbar-none">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">প্রোফাইল ও লক্ষ্য কাস্টমাইজ করুন</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">আপনার নিজস্ব তথ্য ও রুটিন অনুযায়ী সাজান</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section 1: General */}
          <Section title="১. সাধারণ তথ্য ও লক্ষ্য" icon={<User className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <Label>আপনার নাম</Label>
                <Input value={form.userName} onChange={v => setForm({ ...form, userName: v })} placeholder="Jamil" />
              </div>
              <div className="md:col-span-5">
                <Label>চলতি মাস্টারি ফর্মুলা</Label>
                <Input value={form.formulaTitle} onChange={v => setForm({ ...form, formulaTitle: v })} placeholder="WordPress + Django + English" />
              </div>
              <div className="md:col-span-3">
                <Label>ফেজ</Label>
                <Input value={form.formulaPhase} onChange={v => setForm({ ...form, formulaPhase: v })} placeholder="PHASE 1" />
              </div>
            </div>
          </Section>

          {/* Section 2: Focus Time */}
          <Section title="২. দৈনিক ফোকাস সময় বরাদ্দ">
            <div className="space-y-2">
              {(form.focusTime || []).map((slot, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div><Label>কাজের নাম</Label><Input value={slot.title} onChange={v => updateFocus(i, 'title', v)} placeholder="Django" /></div>
                  <div><Label>সময়কাল</Label><Input value={slot.duration} onChange={v => updateFocus(i, 'duration', v)} placeholder="২ ঘণ্টা" /></div>
                  <div><Label>সময়কাল (বাংলা)</Label><Input value={slot.period} onChange={v => updateFocus(i, 'period', v)} placeholder="সকাল" /></div>
                  <div>
                    <Label>শতকরা %</Label>
                    <input type="number" value={slot.percent} min="0" max="100" onChange={e => updateFocus(i, 'percent', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none dark:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 3: Avoid List */}
          <Section title="৩. বর্জনীয় বিষয়সমূহ">
            <div className="space-y-2">
              {(form.avoidList || []).map((av, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div><Label>বিষয়</Label><Input value={av.label} onChange={v => updateAvoid(i, 'label', v)} placeholder="Laravel" /></div>
                  <div><Label>কেন?</Label><Input value={av.value} onChange={v => updateAvoid(i, 'value', v)} placeholder="এখন না!" /></div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 4: Resources */}
          <Section title="৪. সহায়ক লিংক ও রিসোর্স">
            <div className="space-y-3">
              {(form.resources || []).map((res, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>শিরোনাম</Label><Input value={res.title} onChange={v => updateResource(i, 'title', v)} placeholder="প্রেরণাদায়ক ভিডিও" /></div>
                    <div><Label>বিবরণ</Label><Input value={res.desc} onChange={v => updateResource(i, 'desc', v)} placeholder="ছোট বিবরণ" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><Label>URL লিঙ্ক</Label><Input value={res.url || ''} onChange={v => updateResource(i, 'url', v)} placeholder="https://..." /></div>
                    <div><Label>বাটন টেক্সট</Label><Input value={res.linkText || ''} onChange={v => updateResource(i, 'linkText', v)} placeholder="দেখুন" /></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Save */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setOpen(false)} className="flex-1 py-3 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all">
            বাতিল
          </button>
          <button onClick={handleSave} className="flex-1 py-3 text-xs bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md transition-all">
            সেভ করুন ✨
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
        {icon} {title}
      </h5>
      {children}
    </div>
  )
}

function Label({ children }) {
  return <label className="text-[9px] font-bold text-slate-400 block mb-0.5">{children}</label>
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:outline-none dark:text-white"
    />
  )
}
