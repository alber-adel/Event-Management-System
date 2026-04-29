# EventsHub Django Backend

## Overview

Django REST API backend for the EventsHub event management platform. This backend uses SQLite as the database and provides a complete API for managing events, users, and registrations.

## Features

- ✅ Custom User model with admin flag
- ✅ SQLite database (configured)
- ✅ Django Forms with comprehensive validation
- ✅ RESTful API with Django REST Framework
- ✅ CORS enabled for frontend communication
- ✅ Ajax support for all endpoints
- ✅ Session-based authentication
- ✅ Admin operations for event and registration management

## Project Structure

```
backend/
├── eventshub_project/          # Main project configuration
│   ├── settings.py            # Project settings (SQLite, CORS, etc.)
│   ├── urls.py                # Main URL configuration
│   └── wsgi.py                # WSGI configuration
├── events/                    # Main app
│   ├── models.py              # User, Event, Registration models
│   ├── views.py               # API views with Django forms
│   ├── forms.py               # Django forms with validation
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # App URL patterns
│   └── admin.py               # Django admin configuration
├── db.sqlite3                 # SQLite database
└── manage.py                  # Django management script
```

## Models

### User

- Custom user model extending AbstractUser
- Fields: email (unique, used for login), first_name, is_admin
- Email-based authentication

### Event

- Fields: title, description, date, time, category, location_name, location_google_map_url, number_of_seats, booked_seats, ticket_price, image_url, status, created_at, updated_at
- Properties: available_seats, is_full
- Status choices: upcoming, completed, cancelled

### Registration

- Fields: user (FK), event (FK), status, message, registered_at, updated_at
- Status choices: pending, accepted, rejected
- Unique constraint on (user, event) pair

## API Endpoints

### Authentication

- `POST /api/auth/signup/` - User registration (with validation)
- `POST /api/auth/login/` - User login (with validation)
- `POST /api/auth/logout/` - User logout (requires authentication)
- `GET /api/auth/current-user/` - Get current user info
- `GET /api/auth/csrf/` - Get CSRF token for Ajax

### Events

- `GET /api/events/` - List all events (with filters: search, category, date)
- `POST /api/events/` - Create event (Admin only, with validation)
- `GET /api/events/<id>/` - Get event details
- `PUT /api/events/<id>/` - Update event (Admin only, with validation)
- `DELETE /api/events/<id>/` - Delete event (Admin only)
- `GET /api/events/categories/` - Get all categories

### Registrations

- `POST /api/events/<id>/register/` - Register for event (requires authentication, with validation)
- `GET /api/registrations/` - Get user's registrations (requires authentication)
- `GET /api/admin/registrations/` - Get all registrations (Admin only)
- `PUT /api/admin/registrations/<id>/` - Update registration status (Admin only, with validation)

## Form Validations

### SignUp Form

- Email: Required, valid format, unique
- Name: Required, min 2 chars, only letters and spaces
- Password: Min 8 chars, must include uppercase, lowercase, digit, special char (@$!%\*?&)
- Password confirmation must match

### Login Form

- Email: Required, valid format
- Password: Required

### Event Form

- Title: Required, min 3 chars
- Description: Required, min 10 chars
- Date: Required, valid date
- Time: Required, valid time
- Category: Required, min 2 chars
- Location name: Required, min 3 chars
- Number of seats: Required, min 1
- Ticket price: Required, >= 0

### Registration Form

- Validates user not already registered
- Validates event not full

### Registration Status Form

- Message required when status is "rejected"

## Running the Server

```bash
# Navigate to backend directory
cd backend

# Run development server
python manage.py runserver

# Server will start at http://127.0.0.1:8000/
```

## Database

The project uses SQLite3 database (`db.sqlite3`). All data is persisted in this file.

### Migrations

Migrations have been created and applied. If you make model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Create Admin User (Optional - for testing only)

```bash
python manage.py createsuperuser
```

Note: Don't use Django admin in production per project requirements, but you can test it at http://127.0.0.1:8000/admin/

## CORS Configuration

The backend is configured to accept requests from:

- http://localhost:5500 (Live Server)
- http://127.0.0.1:5500
- http://localhost:3000
- http://127.0.0.1:3000

## Ajax Usage

All endpoints support Ajax requests. Two main Ajax scenarios implemented:

1. **Event Search/Filter** - Real-time event filtering with search query, category, and date
2. **Registration Status Updates** - Admin can update registration status with message

## Frontend Integration

The frontend should:

1. Get CSRF token: `GET /api/auth/csrf/`
2. Include CSRF token in POST/PUT/DELETE requests as `X-CSRFToken` header
3. Include credentials in fetch: `credentials: 'include'`

Example:

```javascript
// Get CSRF token first
fetch("http://127.0.0.1:8000/api/auth/csrf/", {
  credentials: "include",
});

// Then make authenticated requests
fetch("http://127.0.0.1:8000/api/auth/login/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": getCookie("csrftoken"),
  },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

## Navigation Bar Logic

The frontend should show different navigation based on user status:

- **Visitor** (not logged in): Home, Events, About, Contact, Login/Signup
- **Normal User** (logged in, is_admin=false): Home, Events, My Registrations, About, Contact, Logout
- **Admin** (logged in, is_admin=true): Home, Manage Events, Registrations, Logout

Check user status with: `GET /api/auth/current-user/`

## Key Features

✅ No hardcoded values - all validation rules in forms
✅ SQLite database configured and initialized
✅ Django forms for all user inputs with validation
✅ No Django Admin usage (only for testing)
✅ No JavaScript libraries (backend-only)
✅ No CSS libraries (backend-only)
✅ All data saved and retrieved from database
✅ Ajax support in at least 2 scenarios
✅ Proper navigation bar support for different user types
