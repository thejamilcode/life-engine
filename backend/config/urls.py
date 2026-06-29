from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/',      include('accounts.urls')),
    path('api/tasks/',     include('tasks.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/profile/',   include('accounts.profile_urls')),
]
