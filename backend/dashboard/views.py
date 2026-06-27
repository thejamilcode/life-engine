from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date
import calendar

from .models import UserStats, DailyHistory
from tasks.models import Task, DailyCompletion


# ─────────────────────────── STATS ───────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_view(request):
    """GET /api/dashboard/stats/"""
    today = timezone.localdate()

    # Ensure live data (compute on the fly too, don't fully rely on cache)
    total     = Task.objects.filter(user=request.user).count()
    completed = DailyCompletion.objects.filter(user=request.user, date=today).count()
    percent   = round((completed / total) * 100) if total > 0 else 0

    # XP sum from all time
    xp_values = DailyCompletion.objects.filter(user=request.user).values_list('xp_earned', flat=True)
    total_xp  = sum(xp_values)

    # Streak
    streak = _calculate_streak(request.user, today)

    return Response({
        'total_xp':       total_xp,
        'streak':         streak,
        'completed_today': completed,
        'total_tasks':    total,
        'percent':        percent,
    })


# ─────────────────────────── HISTORY ───────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_view(request):
    """
    GET /api/dashboard/history/
    Returns all history as: { "2026-06-01": { percent, completed }, ... }
    Also includes today's live data.
    """
    history_qs = DailyHistory.objects.filter(user=request.user)
    result = {}

    for h in history_qs:
        result[str(h.date)] = {
            'percent':   h.percent,
            'completed': h.completed_task_ids,
        }

    # Merge today's live data (may not be saved yet)
    today     = timezone.localdate()
    today_key = str(today)
    total     = Task.objects.filter(user=request.user).count()
    completed_ids = list(
        DailyCompletion.objects.filter(user=request.user, date=today)
        .values_list('task_id', flat=True)
    )
    today_percent = round((len(completed_ids) / total) * 100) if total > 0 else 0

    result[today_key] = {
        'percent':   today_percent,
        'completed': completed_ids,
    }

    return Response(result)


# ─────────────────────────── MONTHLY ───────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_view(request):
    """
    GET /api/dashboard/monthly/?year=2026&month=6
    Returns daily percents for the given month.
    """
    try:
        year  = int(request.query_params.get('year',  timezone.localdate().year))
        month = int(request.query_params.get('month', timezone.localdate().month))
    except (TypeError, ValueError):
        return Response({'detail': 'Invalid year or month.'}, status=400)

    # Get all history for that month
    history_qs = DailyHistory.objects.filter(
        user=request.user,
        date__year=year,
        date__month=month,
    )

    result = {}
    for h in history_qs:
        result[str(h.date)] = {'percent': h.percent, 'completed': h.completed_task_ids}

    # Include today if it falls in this month
    today = timezone.localdate()
    if today.year == year and today.month == month:
        total = Task.objects.filter(user=request.user).count()
        completed_ids = list(
            DailyCompletion.objects.filter(user=request.user, date=today)
            .values_list('task_id', flat=True)
        )
        result[str(today)] = {
            'percent':   round((len(completed_ids) / total) * 100) if total > 0 else 0,
            'completed': completed_ids,
        }

    return Response(result)


# ─────────────────────────── YEARLY ───────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_view(request):
    """
    GET /api/dashboard/yearly/?year=2026
    Returns all daily percents for the year.
    """
    try:
        year = int(request.query_params.get('year', timezone.localdate().year))
    except (TypeError, ValueError):
        return Response({'detail': 'Invalid year.'}, status=400)

    history_qs = DailyHistory.objects.filter(user=request.user, date__year=year)

    result = {}
    for h in history_qs:
        result[str(h.date)] = {'percent': h.percent}

    # Today if in this year
    today = timezone.localdate()
    if today.year == year:
        total = Task.objects.filter(user=request.user).count()
        done  = DailyCompletion.objects.filter(user=request.user, date=today).count()
        result[str(today)] = {'percent': round((done / total) * 100) if total > 0 else 0}

    return Response(result)


# ─────────────────────────── HELPER ───────────────────────────

def _calculate_streak(user, today):
    streak = 0
    check  = today
    while True:
        count = DailyCompletion.objects.filter(user=user, date=check).count()
        if count == 0:
            # Check history too (previous days saved before reset)
            hist_exists = DailyHistory.objects.filter(user=user, date=check, percent__gt=0).exists()
            if not hist_exists:
                break
        streak += 1
        check = check - timedelta(days=1)
    return streak
