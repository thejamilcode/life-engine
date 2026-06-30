from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('send-otp/',        views.send_otp_view,        name='send-otp'),
    path('verify-otp/',      views.verify_otp_view,      name='verify-otp'),
    path('forgot-password/', views.forgot_password_view, name='forgot-password'), # Send Reset OTP
    path('reset-password/',  views.reset_password_view,  name='reset-password'),  # Reset password
    path('register/',        views.register_view,        name='register'),
    path('login/',           views.login_view,           name='login'),
    path('me/',              views.me_view,              name='me'),
    path('token/refresh/',   TokenRefreshView.as_view(), name='token-refresh'),
]
