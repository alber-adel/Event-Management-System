from rest_framework import serializers
from .models import User, Event, Registration


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "is_admin", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model"""

    available_seats = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "time",
            "category",
            "location_name",
            "location_google_map_url",
            "number_of_seats",
            "booked_seats",
            "available_seats",
            "is_full",
            "ticket_price",
            "image_url",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "booked_seats", "created_at", "updated_at"]


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for Registration model"""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.first_name", read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_date = serializers.DateField(source="event.date", read_only=True)
    event_time = serializers.TimeField(source="event.time", read_only=True)
    event_location = serializers.CharField(source="event.location_name", read_only=True)
    image_url = serializers.CharField(source="event.image_url", read_only=True)

    class Meta:
        model = Registration
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "event",
            "event_title",
            "event_date",
            "event_time",
            "event_location",
            "image_url",
            "status",
            "message",
            "registered_at",
            "updated_at",
        ]
        read_only_fields = ["id", "registered_at", "updated_at"]
