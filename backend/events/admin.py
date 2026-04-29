from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Event, Registration


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for custom User model"""

    list_display = ("email", "first_name", "is_admin", "is_staff", "date_joined")
    list_filter = ("is_admin", "is_staff", "is_active")
    search_fields = ("email", "first_name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_admin",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "password1", "password2", "is_admin"),
            },
        ),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin for Event model"""

    list_display = (
        "id",
        "title",
        "category",
        "date",
        "time",
        "location_name",
        "number_of_seats",
        "booked_seats",
        "status",
        "created_at",
    )
    list_filter = ("status", "category", "date")
    search_fields = ("title", "description", "category", "location_name")
    ordering = ("-created_at",)
    date_hierarchy = "date"

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("title", "description", "category", "status")},
        ),
        ("Date & Time", {"fields": ("date", "time")}),
        ("Location", {"fields": ("location_name", "location_google_map_url")}),
        (
            "Capacity & Pricing",
            {"fields": ("number_of_seats", "booked_seats", "ticket_price")},
        ),
        ("Media", {"fields": ("image_url",)}),
    )

    readonly_fields = ("created_at", "updated_at")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    """Admin for Registration model"""

    list_display = ("id", "user", "event", "status", "registered_at")
    list_filter = ("status", "registered_at")
    search_fields = ("user__email", "user__first_name", "event__title")
    ordering = ("-registered_at",)
    date_hierarchy = "registered_at"

    fieldsets = (
        ("Registration Details", {"fields": ("user", "event", "status", "message")}),
        (
            "Timestamps",
            {"fields": ("registered_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ("registered_at", "updated_at")
