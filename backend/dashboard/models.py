from django.db import models
from django.conf import settings


class UserStats(models.Model):
    """Cached stats per user — updated after every toggle/reset."""
    user          = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stats')
    total_xp      = models.PositiveIntegerField(default=0)
    streak        = models.PositiveIntegerField(default=0)
    completed_today = models.PositiveIntegerField(default=0)
    total_tasks   = models.PositiveIntegerField(default=0)
    percent       = models.PositiveIntegerField(default=0)
    updated_at    = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} stats — {self.percent}% today"


class DailyHistory(models.Model):
    """
    One row per user per calendar date.
    Stores the day's final completion percentage and which task IDs were done.
    """
    user               = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='history')
    date               = models.DateField()
    percent            = models.PositiveIntegerField(default=0)
    completed_task_ids = models.JSONField(default=list)

    class Meta:
        unique_together = ('user', 'date')
        ordering        = ['-date']

    def __str__(self):
        return f"{self.user.username} | {self.date} | {self.percent}%"
