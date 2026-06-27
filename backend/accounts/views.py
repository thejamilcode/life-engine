from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ProfileSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


# ─────────────────────────── AUTH VIEWS ───────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """POST /api/auth/register/"""
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
