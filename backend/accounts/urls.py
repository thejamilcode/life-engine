from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('send-otp/',      views.send_otp_view,    name='send-otp'),    # Step 1 — send OTP
    path('verify-otp/',    views.verify_otp_view,  name='verify-otp'),  # Step 2 — verify OTP & create account
    path('register/',      views.register_view,    name='register'),    # Legacy (no OTP)
    path('login/',         views.login_view,        name='login'),
    path('me/',            views.me_view,           name='me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
