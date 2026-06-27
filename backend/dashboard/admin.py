from django.contrib import admin
from .models import UserStats, DailyHistory


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display  = ('user', 'total_xp', 'streak', 'completed_today', 'percent', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)


@admin.register(DailyHistory)
class DailyHistoryAdmin(admin.ModelAdmin):
    list_display   = ('user', 'date', 'percent')
    list_filter    = ('date',)
    search_fields  = ('user__username',)
    date_hierarchy = 'date'
