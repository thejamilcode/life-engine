from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name     = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'name', 'password')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("এই username টি ইতিমধ্যে ব্যবহৃত হয়েছে।")
        return value

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            name=name,
        )
        # Auto-create Profile with defaults
        Profile.objects.create(
            user=user,
            user_name=name or validated_data['username'],
            focus_time=Profile.get_default_focus_time(),
            avoid_list=Profile.get_default_avoid_list(),
            resources=Profile.get_default_resources(),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("ভুল username বা password।")
        if not user.is_active:
            raise serializers.ValidationError("এই অ্যাকাউন্টটি নিষ্ক্রিয়।")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'name')


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Profile
        fields = (
            'id', 'user_name', 'formula_title', 'formula_phase',
            'focus_time', 'avoid_list', 'resources', 'updated_at',
        )

    def to_representation(self, instance):
        """Frontend camelCase => Backend snake_case bridge"""
        rep = super().to_representation(instance)
        return {
            'id':           rep['id'],
            'userName':     rep['user_name'],
            'formulaTitle': rep['formula_title'],
            'formulaPhase': rep['formula_phase'],
            'focusTime':    rep['focus_time'],
            'avoidList':    rep['avoid_list'],
            'resources':    rep['resources'],
            'updatedAt':    rep['updated_at'],
        }

    def update(self, instance, validated_data):
        # Map camelCase from request back to snake_case fields
        request_data = self.context['request'].data
        instance.user_name     = request_data.get('userName',     instance.user_name)
        instance.formula_title = request_data.get('formulaTitle', instance.formula_title)
        instance.formula_phase = request_data.get('formulaPhase', instance.formula_phase)
        instance.focus_time    = request_data.get('focusTime',    instance.focus_time)
        instance.avoid_list    = request_data.get('avoidList',    instance.avoid_list)
        instance.resources     = request_data.get('resources',    instance.resources)
        instance.save()
        return instance
