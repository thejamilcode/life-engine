"""
Management command: python manage.py seed_tasks --username jamil
Seeds default tasks for a user if they have none.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tasks.models import Task

User = get_user_model()

DEFAULT_TASKS = [
    {"text": "ফজরের নামাজ পড়া",              "cat": "namaz",     "xp": 30},
    {"text": "কুরআন তিলাওয়াত — ১ পৃষ্ঠা",   "cat": "namaz",     "xp": 40},
    {"text": "সকালের জিকির আজকার",            "cat": "dhikr",     "xp": 20},
    {"text": "Django পড়া বা প্র্যাকটিস",     "cat": "career",    "xp": 50},
    {"text": "WordPress/Fiverr কাজ",           "cat": "career",    "xp": 40},
    {"text": "ইংরেজি চর্চা — ১৫ মিনিট",      "cat": "career",    "xp": 25},
    {"text": "সকালে হাঁটা বা ব্যায়াম",       "cat": "lifestyle", "xp": 20},
    {"text": "পর্যাপ্ত পানি পান",             "cat": "lifestyle", "xp": 10},
    {"text": "এশার নামাজ পড়া",               "cat": "namaz",     "xp": 25},
    {"text": "রাতে সময়মতো ঘুমানো",           "cat": "lifestyle", "xp": 15},
]


class Command(BaseCommand):
    help = 'Seed default tasks for a user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True)

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stderr.write(f"User '{username}' not found.")
            return

        if Task.objects.filter(user=user).exists():
            self.stdout.write(f"User '{username}' already has tasks. Skipping.")
            return

        for i, task_data in enumerate(DEFAULT_TASKS):
            Task.objects.create(user=user, order=i, **task_data)

        self.stdout.write(self.style.SUCCESS(
            f"✅ {len(DEFAULT_TASKS)} default tasks seeded for '{username}'."
        ))
