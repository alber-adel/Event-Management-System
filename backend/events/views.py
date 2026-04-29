from django.shortcuts import render
from django.http import  HttpResponseForbidden, HttpResponseNotFound
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.core.paginator import Paginator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status


from .models import User, Event, Registration
from .forms import (
    UserSignUpForm,
    UserLoginForm,
    EventForm,
    RegistrationForm,
    RegistrationStatusForm,
)
from .serializers import UserSerializer, EventSerializer, RegistrationSerializer


# Authentication Views
@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    """User signup with Django form validation"""
    try:
        data = request.data
        form = UserSignUpForm(data)

        if form.is_valid():
            user = form.save()
            login(request, user)

            return Response(
                {
                    "success": True,
                    "message": "User created successfully",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            # Return form errors
            return Response(
                {"success": False, "errors": form.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """User login with Django form validation"""
    try:
        data = request.data
        form = UserLoginForm(data)

        if form.is_valid():
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]

            # Try to get user by email
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.email, password=password)
            except User.DoesNotExist:
                user = None

            if user is not None:
                login(request, user)
                return Response(
                    {
                        "success": True,
                        "message": "Login successful",
                        "user": UserSerializer(user).data,
                    }
                )
            else:
                return Response(
                    {"success": False, "message": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            return Response(
                {"success": False, "errors": form.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout"""
    logout(request)
    return Response({"success": True, "message": "Logged out successfully"})


@api_view(["GET"])
def current_user_view(request):
    """Get current logged-in user"""
    if request.user.is_authenticated:
        return Response({"success": True, "user": UserSerializer(request.user).data})
    else:
        return Response(
            {"success": False, "message": "Not authenticated"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


# Event Views (Ajax support)
@api_view(["GET", "POST"])
def event_list_view(request):
    """
    GET: List all events with optional filters (Ajax)
    POST: Create new event (Admin only)
    """
    if request.method == "GET":
        # Get query parameters for search/filter
        search_query = request.GET.get("search", "")
        category = request.GET.get("category", "")
        date = request.GET.get("date", "")
        page_num = request.GET.get("page", 1)

        events = Event.objects.filter(status="upcoming")

        # Apply filters
        if search_query:
            events = events.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(category__icontains=search_query)
                | Q(location_name__icontains=search_query)
                | Q(id__icontains=search_query)
            )

        if category:
            events = events.filter(category__iexact=category)

        if date:
            events = events.filter(date=date)

        events = events.order_by("-created_at")

        # Pagination
        paginator = Paginator(events, 10)
        page_obj = paginator.get_page(page_num)

        return Response(
            {
                "success": True,
                "events": EventSerializer(page_obj, many=True).data,
                "total": paginator.count,
                "page": page_num,
                "total_pages": paginator.num_pages,
            }
        )

    elif request.method == "POST":
        # Check if user is admin
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response(
                {"success": False, "message": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        form = EventForm(request.data)
        if form.is_valid():
            event = form.save()
            return Response(
                {
                    "success": True,
                    "message": "Event created successfully",
                    "event": EventSerializer(event).data,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"success": False, "errors": form.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET", "PUT", "DELETE"])
def event_detail_view(request, event_id):
    """
    GET: Get event details
    PUT: Update event (Admin only)
    DELETE: Delete event (Admin only)
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {"success": False, "message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        # Check if current user is registered
        is_registered = False
        user_registration = None

        if request.user.is_authenticated:
            try:
                registration = Registration.objects.get(user=request.user, event=event)
                is_registered = True
                user_registration = RegistrationSerializer(registration).data
            except Registration.DoesNotExist:
                pass

        return Response(
            {
                "success": True,
                "event": EventSerializer(event).data,
                "is_registered": is_registered,
                "registration": user_registration,
            }
        )

    elif request.method == "PUT":
        # Check if user is admin
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response(
                {"success": False, "message": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        form = EventForm(request.data, instance=event)
        if form.is_valid():
            event = form.save()
            return Response(
                {
                    "success": True,
                    "message": "Event updated successfully",
                    "event": EventSerializer(event).data,
                }
            )
        else:
            return Response(
                {"success": False, "errors": form.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    elif request.method == "DELETE":
        # Check if user is admin
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response(
                {"success": False, "message": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        event.delete()
        return Response({"success": True, "message": "Event deleted successfully"})


@api_view(["GET"])
def event_categories_view(request):
    """Get all unique event categories (Ajax)"""
    categories = (
        Event.objects.values_list("category", flat=True).distinct().order_by("category")
    )
    return Response({"success": True, "categories": list(categories)})


# Registration Views (Ajax support)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_event_view(request, event_id):
    """Register for an event (Ajax)"""
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {"success": False, "message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Create registration form data
    form_data = {"user": request.user.id, "event": event_id}

    form = RegistrationForm(form_data)
    if form.is_valid():
        registration = form.save()

        # Update booked seats
        event.booked_seats += 1
        event.save()

        return Response(
            {
                "success": True,
                "message": "Registration successful",
                "registration": RegistrationSerializer(registration).data,
            },
            status=status.HTTP_201_CREATED,
        )
    else:
        return Response(
            {"success": False, "errors": form.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_registrations_view(request):
    """Get current user's registrations (Ajax)"""
    registrations = Registration.objects.filter(user=request.user).order_by(
        "-registered_at"
    )

    return Response(
        {
            "success": True,
            "registrations": RegistrationSerializer(registrations, many=True).data,
        }
    )


@api_view(["GET"])
def admin_registrations_view(request):
    """Get all registrations for admin (Ajax)"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return Response(
            {"success": False, "message": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    event_id = request.GET.get("event_id", None)

    if event_id:
        registrations = Registration.objects.filter(event_id=event_id).order_by(
            "-registered_at"
        )
    else:
        registrations = Registration.objects.all().order_by("-registered_at")

    return Response(
        {
            "success": True,
            "registrations": RegistrationSerializer(registrations, many=True).data,
        }
    )


@api_view(["PUT"])
def update_registration_status_view(request, registration_id):
    """Update registration status (Admin only) (Ajax)"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return Response(
            {"success": False, "message": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        registration = Registration.objects.get(id=registration_id)
    except Registration.DoesNotExist:
        return Response(
            {"success": False, "message": "Registration not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    form = RegistrationStatusForm(request.data, instance=registration)
    if form.is_valid():
        registration = form.save()
        return Response(
            {
                "success": True,
                "message": "Registration status updated",
                "registration": RegistrationSerializer(registration).data,
            }
        )
    else:
        return Response(
            {"success": False, "errors": form.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
def serve_frontend(request, rel_path=""):

    # Basic safety checks
    if ".." in rel_path or rel_path.startswith("/"):
        return HttpResponseForbidden("Forbidden")

    # Try rendering requested template directly
    try:
        return render(request, rel_path)
    except Exception:
        # As a fallback try the lower-cased path (handles some inconsistent capitalizations)
        try:
            return render(request, rel_path.lower())
        except Exception:
            return HttpResponseNotFound("Template not found")


def home_view(request):
    return render(request, 'index.html')

# CSRF Token View
@ensure_csrf_cookie
@api_view(["GET"])
def get_csrf_token(request):
    """Get CSRF token for Ajax requests"""
    return Response({"success": True})
