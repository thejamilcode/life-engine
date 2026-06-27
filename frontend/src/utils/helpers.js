// src/utils/helpers.js
// ====================================================
// Utility Functions — Bengali digits, dates, XP, etc.
// ====================================================

// বাংলা সংখ্যায় রূপান্তর
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '০'
  const digits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
  return String(num).replace(/[0-9]/g, d => digits[d])
}

// আজকের তারিখ key format: "2026-06-26"
export const getFormattedDateKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Bengali date display: "২৬ জুন ২০২৬, বৃহস্পতিবার"
export const getBengaliDate = (date = new Date()) => {
  const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
  const days   = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার']
  return `${toBengaliDigits(date.getDate())} ${months[date.getMonth()]} ${toBengaliDigits(date.getFullYear())}, ${days[date.getDay()]}`
}

// Motivational quotes
export const QUOTES = [
  '"আল্লাহর নিকট প্রিয় আমল তা-ই, যা নিয়মিত করা হয়।"',
  '"কষ্টের পরেই স্বস্তি আসে।" — সূরা ইনশিরাহ',
  '"ছোট ছোট পদক্ষেপই বড় সাফল্য তৈরি করে।"',
  '"আজকের পরিশ্রমই আগামীকালের গল্প।"',
  '"ধৈর্য ধরো, ইনশাআল্লাহ সাফল্য আসবে।"',
]

export const getRandomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)]

// Category config
export const CATEGORIES = {
  namaz:     { label: 'সালাত ও কুরআন',  emoji: '🕌', color: 'text-emerald-700',  bg: 'bg-emerald-50',  dark: 'dark:bg-emerald-950/40 dark:text-emerald-400' },
  dhikr:     { label: 'জিকির ও দোয়া',  emoji: '📿', color: 'text-purple-700',   bg: 'bg-purple-50',   dark: 'dark:bg-purple-950/40 dark:text-purple-400'  },
  career:    { label: 'ক্যারিয়ার ও স্টাডি', emoji: '💼', color: 'text-blue-700', bg: 'bg-blue-50',    dark: 'dark:bg-blue-950/40 dark:text-blue-400'      },
  lifestyle: { label: 'লাইফস্টাইল',     emoji: '🌱', color: 'text-teal-700',    bg: 'bg-teal-50',    dark: 'dark:bg-teal-950/40 dark:text-teal-400'      },
}

// XP to Level
export const getLevel = (xp) => {
  if (xp >= 5000) return { level: 10, title: 'গ্র্যান্ড মাস্টার' }
  if (xp >= 3000) return { level: 8,  title: 'চ্যাম্পিয়ন' }
  if (xp >= 2000) return { level: 7,  title: 'এক্সপার্ট' }
  if (xp >= 1000) return { level: 5,  title: 'প্রো' }
  if (xp >= 500)  return { level: 3,  title: 'ইন্টারমিডিয়েট' }
  return { level: 1, title: 'বিগিনার' }
}

// Confetti colors
export const CONFETTI_COLORS = ['#0d9488','#10b981','#fcd34d','#f472b6','#818cf8']

// Default tasks if backend returns empty
export const DEFAULT_TASKS = [
  { id: 1, text: 'ফজরের নামাজ পড়া', cat: 'namaz', xp: 30, completed: false },
  { id: 2, text: 'কুরআন তিলাওয়াত', cat: 'namaz', xp: 40, completed: false },
  { id: 3, text: 'Django পড়া — ১ ঘণ্টা', cat: 'career', xp: 50, completed: false },
  { id: 4, text: 'ইংরেজি চর্চা করা', cat: 'career', xp: 25, completed: false },
  { id: 5, text: 'সকালে হাঁটা বা ব্যায়াম', cat: 'lifestyle', xp: 20, completed: false },
]
