from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',      include('accounts.urls')),
    path('api/tasks/',     include('tasks.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/profile/',   include('accounts.profile_urls')),
]
