from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import path, include


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


urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('health/db/', database_health_check, name='database-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/',      include('accounts.urls')),
    path('api/tasks/',     include('tasks.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/profile/',   include('accounts.profile_urls')),
]
