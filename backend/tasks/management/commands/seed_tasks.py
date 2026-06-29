"""
Management command: python manage.py seed_tasks --username jamil
Seeds default tasks for a user if they have none.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tasks.models import Task, DEFAULT_TASKS

User = get_user_model()


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
