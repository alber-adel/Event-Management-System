from django.urls import path
from . import views

app_name = "events"

urlpatterns = [
    path('', views.home_view, name='home'),
    # Serve frontend HTML files (e.g. /frontend/pages/login.html)
    path('frontend/<path:rel_path>', views.serve_frontend, name='frontend_files'),
    # Authentication URLs
    path("api/auth/signup/", views.signup_view, name="signup"),
    path("api/auth/login/", views.login_view, name="login"),
    path("api/auth/logout/", views.logout_view, name="logout"),
    path("api/auth/current-user/", views.current_user_view, name="current_user"),
    path("api/auth/csrf/", views.get_csrf_token, name="csrf_token"),
    # Event URLs
    path("api/events/", views.event_list_view, name="event_list"),
    path("api/events/<int:event_id>/", views.event_detail_view, name="event_detail"),
    path(
        "api/events/categories/", views.event_categories_view, name="event_categories"
    ),
    # Registration URLs
    path(
        "api/events/<int:event_id>/register/",
        views.register_event_view,
        name="register_event",
    ),
    path(
        "api/registrations/", views.user_registrations_view, name="user_registrations"
    ),
    path(
        "api/admin/registrations/",
        views.admin_registrations_view,
        name="admin_registrations",
    ),
    path(
        "api/admin/registrations/<int:registration_id>/",
        views.update_registration_status_view,
        name="update_registration_status",
    ),
]
