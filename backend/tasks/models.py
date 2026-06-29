from django.db import models
from django.conf import settings


DEFAULT_TASKS = [
    # 🕌 সালাত ও কুরআন (namaz)
    {"text": "তাহাজ্জুদ ৪ রাকআত আদায় করা", "cat": "namaz", "xp": 40},
    {"text": "তাহিয়্যাতুল মসজিদ ২ রাকআত সালাত", "cat": "namaz", "xp": 20},
    {"text": "বিতর ৩ রাকআত সালাত আদায়", "cat": "namaz", "xp": 25},
    {"text": "আজান এর সঠিক উত্তর দেয়া ও দুয়া করা", "cat": "namaz", "xp": 15},
    {"text": "কুরআন তিলাওয়াত (কমপক্ষে ২০ আয়াত)", "cat": "namaz", "xp": 35},
    {"text": "সুরা মূলক তিলাওয়াত বা শোনা (রাতে ঘুমানোর আগে)", "cat": "namaz", "xp": 30},
    {"text": "সুরা বাকারার শেষ ৩ আয়াত তিলাওয়াত", "cat": "namaz", "xp": 15},
    {"text": "মুনাজাতে মকবুল থেকে প্রতিদিন কিছু অংশ পাঠ", "cat": "namaz", "xp": 20},

    # 📿 জিকির ও দোয়া (dhikr)
    {"text": "আস্তাগফিরুল্লাহ পাঠ (১,০০০ বার)", "cat": "dhikr", "xp": 50},
    {"text": "দুরুদে ইব্রাহিম পাঠ (১,০০০ বার)", "cat": "dhikr", "xp": 50},
    {"text": "সুবাহানাল্লাহ (২০০ বার)", "cat": "dhikr", "xp": 20},
    {"text": "আলহামদুলিল্লাহ (২০০ বার)", "cat": "dhikr", "xp": 20},
    {"text": "আল্লাহু আকবার (২০০ বার)", "cat": "dhikr", "xp": 20},
    {"text": "লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ (২০০ বার)", "cat": "dhikr", "xp": 25},
    {"text": "লা ইলাহা ইল্লাল্লাহ (২০০ বার)", "cat": "dhikr", "xp": 25},
    {"text": "সুবহানাল্লাহি ওয়া বিহামদিহি (১০০ বার)", "cat": "dhikr", "xp": 15},
    {"text": "রাব্বি ইন্নি লিমা আনজালতা ইলাইয়া... মিন খায়রিন ফাকির (৫০ বার)", "cat": "dhikr", "xp": 20},
    {"text": "আল্লাহুম্মা আইন্নি আলা জিকরিকা ওয়া শুকরিকা ওয়া হুসনি ইবাদাতিক (২০ বার)", "cat": "dhikr", "xp": 15},
    {"text": "আল্লাহুম্মা ইন্নাকা আফুউউন তুহিব্বুল আফওয়া ফাফু আন্নি (৫০ বার)", "cat": "dhikr", "xp": 20},
    {"text": "সকাল বেলার নিয়মিত মাসনুন জিকিরসমূহ সম্পন্ন করা", "cat": "dhikr", "xp": 25},
    {"text": "সন্ধ্যা/রাতের মাসনুন জিকিরসমূহ সম্পন্ন করা", "cat": "dhikr", "xp": 25},

    # 💼 ক্যারিয়ার ও স্টাডি (career)
    {"text": "🧠 Django — Course / Practice / DRF Project (৩ ঘণ্টা)", "cat": "career", "xp": 80},
    {"text": "💼 WordPress — Fiverr Gigs বা Client এর কাজ (২ ঘণ্টা)", "cat": "career", "xp": 60},
    {"text": "🇬🇧 English — Podcast শোনা / ডায়েরি রাইটিং (৩০ মিনিট)", "cat": "career", "xp": 40},
    {"text": "💻 GitHub — আজ একটি প্রজেক্টে মিনিমাম ১টি Commit করা", "cat": "career", "xp": 35},
    {"text": "🔎 Fiverr — Buyer Request ও গিগস ইম্প্রেশন চেক করা", "cat": "career", "xp": 20},
    {"text": "🎓 Academic Study — ক্লাস প্রিপারেশন বা এক্সামের পড়ালেখা", "cat": "career", "xp": 50},
    {"text": "📝 রিপোর্ট রাইটিং — নিয়মিত যেকোনো একটি প্র্যাকটিক্যাল রিপোর্ট লেখা", "cat": "career", "xp": 40},

    # 🌱 লাইফস্টাইল (lifestyle)
    {"text": "👁️ চোখের হেফাজত — স্ক্রিন ও বাইরের অপদৃষ্টি থেকে বিরত থাকা", "cat": "lifestyle", "xp": 60},
    {"text": "❤️ প্রতিদিন কিছু দান করা (কমপক্ষে ১০ টাকা)", "cat": "lifestyle", "xp": 30},
    {"text": "📱 সোশ্যাল মিডিয়া বা হোয়াটসঅ্যাপে একটি মোтивногоেশনাল ইসলামিক কোট শেয়ার", "cat": "lifestyle", "xp": 15},
    {"text": "🛡️ সকল প্রকার ছোট-বড় গুনাহের কাজ থেকে নিজেকে বাঁচানো", "cat": "lifestyle", "xp": 100},
    {"text": "🥗 হেলথ ও ডায়েট ফলো করা (ডাঃ জাহাঙ্গীর কবিরের গাইডলাইন অনুযায়ী)", "cat": "lifestyle", "xp": 35},
    {"text": "🌙 ঘুমানোর আগে — আগামীকালের কাজের সুন্দর একটি নিখুঁত প্ল্যান করা", "cat": "lifestyle", "xp": 20}
]


class Task(models.Model):
    """A user's recurring daily task / amal."""

    CATEGORY_CHOICES = [
        ('namaz',     'সালাত ও কুরআন'),
        ('dhikr',     'জিকির ও দোয়া'),
        ('career',    'ক্যারিয়ার ও স্টাডি'),
        ('lifestyle', 'লাইফস্টাইল'),
    ]

    user  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    text  = models.CharField(max_length=300)
    cat   = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='lifestyle')
    xp    = models.PositiveIntegerField(default=20)
    order = models.PositiveIntegerField(default=0)   # for drag-to-reorder later

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.text}"


class DailyCompletion(models.Model):
    """
    Records which tasks were completed on which date.
    One record per (user, task, date).
    """
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completions')
    task      = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='completions')
    date      = models.DateField()
    xp_earned = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'task', 'date')
        ordering        = ['-date']

    def __str__(self):
        return f"{self.user.username} | {self.task.text[:30]} | {self.date}"
