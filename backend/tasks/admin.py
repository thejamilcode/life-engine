from django.contrib import admin
from .models import Task, DailyCompletion


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ('user', 'text', 'cat', 'xp', 'created_at')
    list_filter   = ('cat', 'user')
    search_fields = ('text', 'user__username')


@admin.register(DailyCompletion)
class DailyCompletionAdmin(admin.ModelAdmin):
    list_display  = ('user', 'task', 'date', 'xp_earned')
    list_filter   = ('date', 'user')
    search_fields = ('user__username',)
    date_hierarchy = 'date'
