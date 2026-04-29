from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from .models import User, Event, Registration
import re


class UserSignUpForm(UserCreationForm):
    """Sign up form with validation"""

    email = forms.EmailField(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Invalid email format.",
        },
    )
    first_name = forms.CharField(
        max_length=150,
        required=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Za-z\s]+$",
                message="Name must contain only letters and spaces.",
            )
        ],
        error_messages={
            "required": "Name is required.",
            "min_length": "Name must be at least 2 characters.",
        },
        min_length=2,
    )
    is_admin = forms.BooleanField(required=False)

    class Meta:
        model = User
        fields = ("email", "first_name", "password1", "password2", "is_admin")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        return email.lower()

    def clean_password1(self):
        password = self.cleaned_data.get("password1")

        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters.")

        # Check for complexity: upper, lower, digit, special character
        if not re.search(r"[a-z]", password):
            raise ValidationError("Password must include a lowercase letter.")
        if not re.search(r"[A-Z]", password):
            raise ValidationError("Password must include an uppercase letter.")
        if not re.search(r"\d", password):
            raise ValidationError("Password must include a number.")
        if not re.search(r"[@$!%*?&]", password):
            raise ValidationError(
                "Password must include a special character (@$!%*?&)."
            )

        return password

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.is_admin = self.cleaned_data.get("is_admin", False)
        if commit:
            user.save()
        return user


class UserLoginForm(forms.Form):
    """Login form with validation"""

    email = forms.EmailField(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Invalid email format.",
        },
    )
    password = forms.CharField(
        widget=forms.PasswordInput,
        required=True,
        error_messages={
            "required": "Password is required.",
        },
    )


class EventForm(forms.ModelForm):
    """Event form with validation"""

    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "date",
            "time",
            "category",
            "location_name",
            "location_google_map_url",
            "number_of_seats",
            "ticket_price",
            "image_url",
            "status",
        ]

    def clean_title(self):
        title = self.cleaned_data.get("title")
        if not title or len(title.strip()) < 3:
            raise ValidationError("Title must be at least 3 characters.")
        return title

    def clean_description(self):
        description = self.cleaned_data.get("description")
        if not description or len(description.strip()) < 10:
            raise ValidationError("Description must be at least 10 characters.")
        return description

    def clean_category(self):
        category = self.cleaned_data.get("category")
        if not category or len(category.strip()) < 2:
            raise ValidationError("Category must be at least 2 characters.")
        return category

    def clean_location_name(self):
        location_name = self.cleaned_data.get("location_name")
        if not location_name or len(location_name.strip()) < 3:
            raise ValidationError("Location name must be at least 3 characters.")
        return location_name

    def clean_number_of_seats(self):
        number_of_seats = self.cleaned_data.get("number_of_seats")
        if number_of_seats is None or number_of_seats < 1:
            raise ValidationError("Number of seats must be at least 1.")
        return number_of_seats

    def clean_ticket_price(self):
        ticket_price = self.cleaned_data.get("ticket_price")
        if ticket_price is None or ticket_price < 0:
            raise ValidationError("Ticket price cannot be negative.")
        return ticket_price

    def clean_image_url(self):
        image_url = self.cleaned_data.get("image_url")
        # Set default image URL if empty
        if not image_url or not image_url.strip():
            return "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
        return image_url


class RegistrationForm(forms.ModelForm):
    """Registration form"""

    class Meta:
        model = Registration
        fields = ["user", "event"]

    def clean(self):
        cleaned_data = super().clean()
        user = cleaned_data.get("user")
        event = cleaned_data.get("event")

        if user and event:
            # Check if already registered
            if Registration.objects.filter(user=user, event=event).exists():
                raise ValidationError("You have already registered for this event.")

            # Check if event is full
            if event.is_full:
                raise ValidationError("This event is already full.")

        return cleaned_data


class RegistrationStatusForm(forms.ModelForm):
    """Form for admin to update registration status"""

    class Meta:
        model = Registration
        fields = ["status", "message"]

    def clean_message(self):
        status = self.cleaned_data.get("status")
        message = self.cleaned_data.get("message")

        if status == "rejected" and not message:
            raise ValidationError(
                "Please provide a message when rejecting a registration."
            )

        return message
