from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User — extra fields for Life Engine"""
    name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.username


class Profile(models.Model):
    """
    Per-user dashboard profile & customization settings.
    One-to-one with User. Auto-created on register.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    user_name     = models.CharField(max_length=150, default='লাইফ ইঞ্জিন')
    formula_title = models.CharField(max_length=300, default='WordPress 💸 + Django 🚀 + English 🌍')
    formula_phase = models.CharField(max_length=50,  default='PHASE 1')

    # JSON fields for nested data
    focus_time  = models.JSONField(default=list)   # [{title, duration, period, percent}]
    avoid_list  = models.JSONField(default=list)   # [{label, value}]
    resources   = models.JSONField(default=list)   # [{title, desc, url, linkText}]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    @classmethod
    def get_default_focus_time(cls):
        return [
            {"title": "🧠 Django (70%)", "duration": "৩ ঘণ্টা", "period": "সকাল", "percent": 70},
            {"title": "💼 WordPress (20%)", "duration": "২ ঘণ্টা", "period": "বিকাল", "percent": 20},
            {"title": "🇬🇧 English (10%)", "duration": "৩০ মিনিট", "period": "রাত", "percent": 10},
        ]

    @classmethod
    def get_default_avoid_list(cls):
        return [
            {"label": "Laravel", "value": "এখন না!"},
            {"label": "AI Automation", "value": "Phase 2 তে"},
            {"label": "React JS", "value": "Phase 2 তে"},
            {"label": "IELTS prep", "value": "গ্র্যাজুয়েশন শেষে"},
        ]

    @classmethod
    def get_default_resources(cls):
        return [
            {"title": "প্রেরণাদায়ক ফেসবুক ভিডিও", "desc": "ইসলামিক জিকির ও জীবনধারা",
             "url": "https://www.facebook.com/share/v/1bpctsWmcE/", "linkText": "ভিডিওটি দেখুন"},
            {"title": "ডাঃ জাহাঙ্গীর কবির স্যারের নির্দেশিকা", "desc": "পর্যাপ্ত পানি পান, শর্করা নিয়ন্ত্রণ ও সঠিক সময়ে ফাস্টিং-এর মাধ্যমে শরীরকে সুস্থ ও হালকা রাখুন।",
             "url": "", "linkText": ""},
            {"title": "রিপোর্ট রাইটিং গাইডলাইন", "desc": "একাডেমিক ক্লাস প্রিপারেশনের পাশাপাশি প্রফেশনাল রিপোর্ট রাইটিং ও প্রজেক্ট ডকুমেন্টিং জোরদার করুন।",
             "url": "", "linkText": ""},
        ]


class OTPVerification(models.Model):
    """
    Stores a temporary OTP code for email verification during registration.
    Pending users are not yet registered — they must verify the OTP first.
    """
    email      = models.EmailField(unique=True)
    username   = models.CharField(max_length=150)
    name       = models.CharField(max_length=150, blank=True)
    password   = models.CharField(max_length=255)   # hashed before storing
    otp_code   = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    attempts   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP({self.email}) — {self.otp_code}"

    def is_expired(self):
        from django.utils import timezone
        from django.conf import settings
        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        return (timezone.now() - self.created_at).total_seconds() > expiry_minutes * 60
