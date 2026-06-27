from django.db import models
from django.conf import settings


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
