"""Auto-seed default tasks when a new user registers."""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Task

DEFAULT_TASKS = [
    {"text": "ফজরের নামাজ পড়া",              "cat": "namaz",     "xp": 30, "order": 0},
    {"text": "কুরআন তিলাওয়াত — ১ পৃষ্ঠা",   "cat": "namaz",     "xp": 40, "order": 1},
    {"text": "সকালের জিকির আজকার",            "cat": "dhikr",     "xp": 20, "order": 2},
    {"text": "Django পড়া বা প্র্যাকটিস",     "cat": "career",    "xp": 50, "order": 3},
    {"text": "WordPress/Fiverr কাজ",           "cat": "career",    "xp": 40, "order": 4},
    {"text": "ইংরেজি চর্চা — ১৫ মিনিট",      "cat": "career",    "xp": 25, "order": 5},
    {"text": "সকালে হাঁটা বা ব্যায়াম",       "cat": "lifestyle", "xp": 20, "order": 6},
    {"text": "পর্যাপ্ত পানি পান",             "cat": "lifestyle", "xp": 10, "order": 7},
    {"text": "এশার নামাজ পড়া",               "cat": "namaz",     "xp": 25, "order": 8},
    {"text": "রাতে সময়মতো ঘুমানো",           "cat": "lifestyle", "xp": 15, "order": 9},
]


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def seed_default_tasks(sender, instance, created, **kwargs):
    if created:
        for task_data in DEFAULT_TASKS:
            Task.objects.create(user=instance, **task_data)
