from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('username', 'email', 'name', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'name')
    fieldsets     = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('name',)}),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'user_name', 'formula_phase', 'updated_at')
    search_fields = ('user__username', 'user_name')
    readonly_fields = ('updated_at', 'created_at')
