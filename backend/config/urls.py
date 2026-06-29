from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import path, include

from accounts.email_service import get_email_backend_name, is_email_configured


def health_check(request):
    return JsonResponse({'status': 'ok'})


def database_health_check(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()

    settings = connection.settings_dict
    return JsonResponse({
        'status': 'ok',
        'database': connection.vendor,
        'host': settings.get('HOST') or str(settings.get('NAME')),
    })


def email_health_check(request):
    backend = get_email_backend_name()
    return JsonResponse({
        'status': 'ok' if is_email_configured() else 'misconfigured',
        'email_configured': is_email_configured(),
        'email_backend': backend,
        'hint': (
            None if backend else
            'Set BREVO_API_KEY or RESEND_API_KEY on Railway/Render (SMTP is blocked on free tiers).'
        ),
    })


urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('health/db/', database_health_check, name='database-health-check'),
    path('health/email/', email_health_check, name='email-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/',      include('accounts.urls')),
    path('api/tasks/',     include('tasks.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/profile/',   include('accounts.profile_urls')),
]
