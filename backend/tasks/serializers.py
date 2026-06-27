from rest_framework import serializers
from .models import Task, DailyCompletion
from django.utils import timezone


class TaskSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = ('id', 'text', 'cat', 'xp', 'order', 'completed', 'created_at')
        read_only_fields = ('id', 'created_at', 'completed')

    def get_completed(self, obj):
        """Check if this task is completed TODAY for the request user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        today = timezone.localdate()
        return DailyCompletion.objects.filter(
            user=request.user, task=obj, date=today
        ).exists()


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Task
        fields = ('text', 'cat', 'xp')

    def validate_xp(self, value):
        if value < 5 or value > 250:
            raise serializers.ValidationError("XP must be between 5 and 250.")
        return value
