from django.urls import path
from . import views

urlpatterns = [
    path('',               views.task_list_create, name='task-list-create'),
    path('reset/',         views.task_reset,       name='task-reset'),
    path('mark-all/',      views.task_mark_all,    name='task-mark-all'),
    path('<int:pk>/',      views.task_detail,      name='task-detail'),
    path('<int:pk>/toggle/', views.task_toggle,    name='task-toggle'),
]
