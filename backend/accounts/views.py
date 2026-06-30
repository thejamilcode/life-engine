from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings as django_settings
from django.db import DatabaseError
import random
import string

from .models import Profile, OTPVerification
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ProfileSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


# ─────────────────────────── OTP HELPERS ─────────────────────────

def _generate_otp():
    """Generate a secure 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))


def _send_otp_email(email, otp, name=''):
    """Send a nicely formatted OTP email via Gmail SMTP."""
    if not django_settings.EMAIL_HOST_USER or not django_settings.EMAIL_HOST_PASSWORD:
        raise RuntimeError('EMAIL_HOST_USER and EMAIL_HOST_PASSWORD must be set on the server.')

    greeting = f"আস্সালামু আলাইকুম {name}," if name else "আস্সালামু আলাইকুম,"
    subject = f"🔐 Life Engine — আপনার OTP কোড: {otp}"
    message = f"""
{greeting}

আপনার Life Engine অ্যাকাউন্ট যাচাই করতে নিচের OTP কোডটি ব্যবহার করুন:

  ━━━━━━━━━━━━━━━━━━━
      {otp}
  ━━━━━━━━━━━━━━━━━━━

⏱️  এই কোডটি {django_settings.OTP_EXPIRY_MINUTES} মিনিটের মধ্যে মেয়াদ শেষ হবে।

যদি আপনি এই রেজিস্ট্রেশন না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।

আল্লাহ হাফেজ 🤲
Life Engine Team
    """
    send_mail(
        subject=subject,
        message=message.strip(),
        from_email=django_settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


# ─────────────────────────── AUTH VIEWS ───────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    """
    POST /api/auth/send-otp/
    Body: { username, email, name, password }
    Generates OTP, saves pending user data, sends email.
    """
    try:
        from .models import User
        username = request.data.get('username', '').strip()
        email    = request.data.get('email', '').strip().lower()
        name     = request.data.get('name', '').strip()
        password = request.data.get('password', '')

        # Validation
        if not username or not email or not password:
            return Response({'error': 'username, email এবং password আবশ্যক।'}, status=400)
        if len(password) < 6:
            return Response({'error': 'Password কমপক্ষে ৬ অক্ষরের হতে হবে।'}, status=400)
        try:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'এই username টি ইতিমধ্যে ব্যবহৃত হয়েছে।'}, status=400)
            if User.objects.filter(email=email).exists():
                return Response({'error': 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে।'}, status=400)

            # Generate OTP
            otp = _generate_otp()

            # Save/update pending OTP record
            OTPVerification.objects.update_or_create(
                email=email,
                defaults={
                    'username': username,
                    'name':     name,
                    'password': make_password(password),   # hash immediately
                    'otp_code': otp,
                    'attempts': 0,
                }
            )
        except DatabaseError as e:
            return Response({'error': f'Database connection or migration problem: {str(e)}'}, status=500)

        # Send email
        try:
            _send_otp_email(email, otp, name)
        except Exception as e:
            return Response({'error': f'ইমেইল পাঠাতে সমস্যা হয়েছে: {str(e)}'}, status=500)

        otp_minutes = getattr(django_settings, 'OTP_EXPIRY_MINUTES', 10)
        return Response({
            'message': f'OTP কোড {email} এ পাঠানো হয়েছে। {otp_minutes} মিনিটের মধ্যে যাচাই করুন।',
            'email': email,
        }, status=200)

    except Exception as e:
        import traceback
        return Response({'error': f'Server error: {str(e)}', 'trace': traceback.format_exc()}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """
    POST /api/auth/verify-otp/
    Body: { email, otp_code }
    Verifies OTP and creates the user account + tasks + profile.
    """
    email    = request.data.get('email', '').strip().lower()
    otp_code = request.data.get('otp_code', '').strip()

    if not email or not otp_code:
        return Response({'error': 'email এবং otp_code আবশ্যক।'}, status=400)

    try:
        pending = OTPVerification.objects.get(email=email)
    except OTPVerification.DoesNotExist:
        return Response({'error': 'এই ইমেইলের জন্য কোনো OTP পাওয়া যায়নি। আবার চেষ্টা করুন।'}, status=400)

    # Check attempt limit (max 5)
    if pending.attempts >= 5:
        pending.delete()
        return Response({'error': 'অনেক বার ভুল চেষ্টা হয়েছে। আবার রেজিস্ট্রেশন করুন।'}, status=400)

    # Check expiry
    if pending.is_expired():
        pending.delete()
        return Response({'error': 'OTP কোডের মেয়াদ শেষ হয়ে গেছে। আবার রেজিস্ট্রেশন করুন।'}, status=400)

    # Check OTP match
    if pending.otp_code != otp_code:
        pending.attempts += 1
        pending.save()
        remaining = 5 - pending.attempts
        return Response({'error': f'ভুল OTP কোড। আরও {remaining} বার চেষ্টা করতে পারবেন।'}, status=400)

    # ✅ OTP correct — create the user
    from .models import User
    if User.objects.filter(username=pending.username).exists():
        pending.delete()
        return Response({'error': 'এই username টি ইতিমধ্যে ব্যবহৃত হয়েছে।'}, status=400)

    user = User(
        username=pending.username,
        email=pending.email,
        name=pending.name,
        password=pending.password,  # already hashed
        is_active=True,
    )
    user.save()

    # Auto-create Profile
    Profile.objects.create(
        user=user,
        user_name=pending.name or pending.username,
        focus_time=Profile.get_default_focus_time(),
        avoid_list=Profile.get_default_avoid_list(),
        resources=Profile.get_default_resources(),
    )

    # Auto-seed 34 default tasks
    from tasks.models import Task, DEFAULT_TASKS
    for i, task_data in enumerate(DEFAULT_TASKS):
        Task.objects.create(user=user, order=i, **task_data)

    # Clean up OTP record
    pending.delete()

    # Return JWT tokens
    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'user': UserSerializer(user).data,
        'message': 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! 🎉',
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """POST /api/auth/register/ — legacy direct register (kept for backward compat)"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user   = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/auth/login/"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user   = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            'user': UserSerializer(user).data,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/"""
    return Response(UserSerializer(request.user).data)


# ─────────────────────────── PROFILE VIEWS ───────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """GET /api/profile/  |  PATCH /api/profile/"""
    profile, _ = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'user_name':     request.user.name or request.user.username,
            'focus_time':    Profile.get_default_focus_time(),
            'avoid_list':    Profile.get_default_avoid_list(),
            'resources':     Profile.get_default_resources(),
        }
    )

    if request.method == 'GET':
        return Response(ProfileSerializer(profile, context={'request': request}).data)

    # PATCH — partial update
    serializer = ProfileSerializer(
        profile, data=request.data, partial=True, context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────── PASSWORD RESET VIEWS ─────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """
    POST /api/auth/forgot-password/
    Body: { email_or_username }
    Generates OTP, saves to OTPVerification, sends reset email.
    """
    from .models import User
    email_or_username = request.data.get('email_or_username', '').strip().lower()

    if not email_or_username:
        return Response({'error': 'ইউজারনেম অথবা ইমেইল আবশ্যক।'}, status=400)

    # Find the user
    user = None
    if '@' in email_or_username:
        try:
            user = User.objects.get(email__iexact=email_or_username)
        except User.DoesNotExist:
            pass
    else:
        try:
            user = User.objects.get(username__iexact=email_or_username)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({'error': 'এই ইউজারনেম বা ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।'}, status=400)

    if not user.email:
        return Response({'error': 'এই অ্যাকাউন্টে কোনো ইমেইল যুক্ত নেই। অনুগ্রহ করে এডমিন এর সাথে যোগাযোগ করুন।'}, status=400)

    # Generate OTP
    otp = _generate_otp()

    # Save to OTPVerification (temp storage)
    # We store password as 'RESET' to identify it's a reset flow, and keep other details
    OTPVerification.objects.update_or_create(
        email=user.email,
        defaults={
            'username': user.username,
            'name':     user.name,
            'password': 'RESET',   # flag indicating password reset
            'otp_code': otp,
            'attempts': 0,
        }
    )

    # Send Password Reset Email
    subject = f"🔑 Life Engine — পাসওয়ার্ড রিসেট কোড: {otp}"
    greeting = f"আস্সালামু আলাইকুম {user.name}," if user.name else "আস্সালামু আলাইকুম,"
    message = f"""
{greeting}

আপনার Life Engine অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে নিচের OTP কোডটি ব্যবহার করুন:

  ━━━━━━━━━━━━━━━━━━━
      {otp}
  ━━━━━━━━━━━━━━━━━━━

⏱️  এই কোডটি {django_settings.OTP_EXPIRY_MINUTES} মিনিটের মধ্যে মেয়াদ শেষ হবে।

যদি আপনি এই পাসওয়ার্ড রিসেটের অনুরোধ না করে থাকেন, তবে দ্রুত আপনার পাসওয়ার্ড পরিবর্তন করুন অথবা আমাদের জানান।

আল্লাহ হাফেজ 🤲
Life Engine Team
    """
    try:
        send_mail(
            subject=subject,
            message=message.strip(),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({'error': f'ইমেইল পাঠাতে সমস্যা হয়েছে: {str(e)}'}, status=500)

    return Response({
        'message': f'পাসওয়ার্ড রিসেট কোডটি {user.email} এ পাঠানো হয়েছে।',
        'email': user.email,
    }, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    POST /api/auth/reset-password/
    Body: { email, otp_code, new_password }
    Verifies OTP and updates user's password.
    """
    from .models import User
    email        = request.data.get('email', '').strip().lower()
    otp_code     = request.data.get('otp_code', '').strip()
    new_password = request.data.get('new_password', '')

    if not email or not otp_code or not new_password:
        return Response({'error': 'ইমেইল, OTP কোড এবং নতুন পাসওয়ার্ড আবশ্যক।'}, status=400)
    if len(new_password) < 6:
        return Response({'error': 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'}, status=400)

    try:
        pending = OTPVerification.objects.get(email=email, password='RESET')
    except OTPVerification.DoesNotExist:
        return Response({'error': 'এই ইমেইলের জন্য কোনো রিসেট অনুরোধ পাওয়া যায়নি।'}, status=400)

    # Check attempt limit (max 5)
    if pending.attempts >= 5:
        pending.delete()
        return Response({'error': 'অনেক বার ভুল চেষ্টা হয়েছে। আবার পাসওয়ার্ড রিসেটের অনুরোধ করুন।'}, status=400)

    # Check expiry
    if pending.is_expired():
        pending.delete()
        return Response({'error': 'OTP কোডের মেয়াদ শেষ হয়ে গেছে। আবার অনুরোধ করুন।'}, status=400)

    # Check OTP match
    if pending.otp_code != otp_code:
        pending.attempts += 1
        pending.save()
        remaining = 5 - pending.attempts
        return Response({'error': f'ভুল OTP কোড। আরও {remaining} বার চেষ্টা করতে পারবেন।'}, status=400)

    # ✅ OTP is correct — find the user and update password
    try:
        user = User.objects.get(username=pending.username)
    except User.DoesNotExist:
        pending.delete()
        return Response({'error': 'ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।'}, status=400)

    # Set new hashed password
    user.set_password(new_password)
    user.save()

    # Clean up OTP record
    pending.delete()

    return Response({'message': 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'}, status=200)
