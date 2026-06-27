from django.urls import path
from . import views

urlpatterns = [
    path('stats/',   views.stats_view,   name='dashboard-stats'),
    path('history/', views.history_view, name='dashboard-history'),
    path('monthly/', views.monthly_view, name='dashboard-monthly'),
    path('yearly/',  views.yearly_view,  name='dashboard-yearly'),
]
