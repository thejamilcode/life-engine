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
            {"title": "Django ব্যাকএন্ড", "duration": "৩ ঘণ্টা", "period": "সকাল", "percent": 50},
            {"title": "WordPress/Fiverr",  "duration": "২ ঘণ্টা", "period": "বিকাল", "percent": 30},
            {"title": "ইংরেজি চর্চা",     "duration": "১ ঘণ্টা", "period": "রাত",   "percent": 20},
        ]

    @classmethod
    def get_default_avoid_list(cls):
        return [
            {"label": "Laravel",   "value": "এখন না! Django ফোকাস করো"},
            {"label": "React শুধু", "value": "Django শেষ না করে না"},
            {"label": "অপ্রয়োজনীয় YouTube", "value": "শুধু tutorial দেখলে হবে না"},
            {"label": "Overthinking", "value": "শুরু করো, ভাববে পরে"},
        ]

    @classmethod
    def get_default_resources(cls):
        return [
            {"title": "Phitron LMS", "desc": "ডেইলি লেকচার ও অ্যাসাইনমেন্ট",
             "url": "https://phitron.io", "linkText": "ক্লাসে যান"},
            {"title": "Django Docs", "desc": "Official Django documentation",
             "url": "https://docs.djangoproject.com", "linkText": "পড়ুন"},
            {"title": "ফিটনেস রুটিন", "desc": "সুস্থ শরীর = সুস্থ মন", "url": "", "linkText": ""},
        ]
