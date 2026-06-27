from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Task, DailyCompletion
from .serializers import TaskSerializer, TaskCreateSerializer
from dashboard.models import DailyHistory, UserStats


# ─────────────────────────── TASK LIST & CREATE ───────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    """
    GET  /api/tasks/  — user's all tasks with today's completion status
    POST /api/tasks/  — create new task
    """
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    # POST
    serializer = TaskCreateSerializer(data=request.data)
    if serializer.is_valid():
        task = serializer.save(user=request.user)
        return Response(
            TaskSerializer(task, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────── SINGLE TASK ───────────────────────────

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    """
    GET    /api/tasks/{id}/
    PATCH  /api/tasks/{id}/
    DELETE /api/tasks/{id}/
    """
    try:
        task = Task.objects.get(pk=pk, user=request.user)
    except Task.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(TaskSerializer(task, context={'request': request}).data)

    if request.method == 'PATCH':
        serializer = TaskCreateSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(TaskSerializer(task, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────── TOGGLE COMPLETE ───────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_toggle(request, pk):
    """POST /api/tasks/{id}/toggle/ — complete or uncomplete a task today"""
    try:
        task = Task.objects.get(pk=pk, user=request.user)
    except Task.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.localdate()
    completion, created = DailyCompletion.objects.get_or_create(
        user=request.user, task=task, date=today,
        defaults={'xp_earned': task.xp}
    )

    if not created:
        # Already completed → uncomplete (delete)
        completion.delete()
        _recalculate_stats(request.user, today)
        return Response({'completed': False, 'xp_earned': 0})

    # Newly completed
    _recalculate_stats(request.user, today)
    return Response({'completed': True, 'xp_earned': task.xp})


# ─────────────────────────── RESET DAY ───────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_reset(request):
    """POST /api/tasks/reset/ — save today to history, clear today's completions"""
    today = timezone.localdate()

    # Save today's snapshot into DailyHistory before clearing
    _save_daily_history(request.user, today)

    # Delete all of today's completions
    DailyCompletion.objects.filter(user=request.user, date=today).delete()

    # Reset stats
    _recalculate_stats(request.user, today)

    return Response({'detail': 'নতুন দিন শুরু হয়েছে।'})


# ─────────────────────────── MARK ALL ───────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_mark_all(request):
    """POST /api/tasks/mark-all/ — mark every task as done today"""
    today = timezone.localdate()
    tasks = Task.objects.filter(user=request.user)

    for task in tasks:
        DailyCompletion.objects.get_or_create(
            user=request.user, task=task, date=today,
            defaults={'xp_earned': task.xp}
        )

    _save_daily_history(request.user, today)
    _recalculate_stats(request.user, today)

    return Response({'detail': 'সব টাস্ক সম্পন্ন হয়েছে।'})


# ─────────────────────────── HELPERS ───────────────────────────

def _recalculate_stats(user, date):
    """Recalculate and save UserStats after any completion change."""
    total     = Task.objects.filter(user=user).count()
    completed = DailyCompletion.objects.filter(user=user, date=date).count()
    percent   = round((completed / total) * 100) if total > 0 else 0

    total_xp = DailyCompletion.objects.filter(user=user).values_list('xp_earned', flat=True)
    xp_sum   = sum(total_xp)

    # Streak calculation
    streak = _calculate_streak(user, date)

    stats, _ = UserStats.objects.get_or_create(user=user)
    stats.total_xp        = xp_sum
    stats.streak          = streak
    stats.completed_today = completed
    stats.total_tasks     = total
    stats.percent         = percent
    stats.save()


def _calculate_streak(user, today):
    """Count consecutive days with > 0 completions going backwards from today."""
    streak = 0
    check  = today
    while True:
        count = DailyCompletion.objects.filter(user=user, date=check).count()
        if count == 0:
            break
        streak += 1
        from datetime import timedelta
        check = check - timedelta(days=1)
    return streak


def _save_daily_history(user, date):
    """Snapshot today's percentage into DailyHistory."""
    total     = Task.objects.filter(user=user).count()
    completed = DailyCompletion.objects.filter(user=user, date=date).count()
    percent   = round((completed / total) * 100) if total > 0 else 0

    completed_ids = list(
        DailyCompletion.objects.filter(user=user, date=date)
        .values_list('task_id', flat=True)
    )

    DailyHistory.objects.update_or_create(
        user=user, date=date,
        defaults={'percent': percent, 'completed_task_ids': completed_ids}
    )
