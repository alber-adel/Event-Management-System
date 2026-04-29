from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, EmailValidator


class User(AbstractUser):
    """Custom User model with admin flag"""

    email = models.EmailField(unique=True, validators=[EmailValidator()])
    is_admin = models.BooleanField(default=False)

    username = models.CharField(max_length=150, unique=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split("@")[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class Event(models.Model):
    """Event model for managing events"""

    STATUS_CHOICES = [
        ("upcoming", "Upcoming"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    category = models.CharField(max_length=100)
    location_name = models.CharField(max_length=255)
    location_google_map_url = models.URLField(blank=True, null=True)
    number_of_seats = models.IntegerField(validators=[MinValueValidator(1)])
    booked_seats = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    ticket_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    image_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="upcoming")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def available_seats(self):
        return self.number_of_seats - self.booked_seats

    @property
    def is_full(self):
        return self.booked_seats >= self.number_of_seats


class Registration(models.Model):
    """Registration model for event registrations"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="registrations"
    )
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="registrations"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    message = models.TextField(blank=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "event")
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.user.email} - {self.event.title} ({self.status})"
