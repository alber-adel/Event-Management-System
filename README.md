# EventsHub

A comprehensive event management platform built with Django REST Framework for the backend and static HTML/CSS/JavaScript for the frontend.

## Features

- User registration and authentication
- Event creation and management (admin only)
- Event registration with validation
- Admin dashboard for managing registrations
- Responsive frontend with AJAX calls

## Tech Stack

- **Backend**: Django 5.2, Django REST Framework, SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Other**: CORS enabled for API communication

## Setup Instructions

### Prerequisites
- Python 3.8+
- Git

### Backend Setup
1. Navigate to backend directory
2. Install dependencies
3. Run migrations
Server will run at http://127.0.0.1:8000/

### Frontend Setup
1. Navigate to frontend directory
2. Serve the static files (using Python's built-in server)
3. Open http://localhost:3000 in your browser.

## API Endpoints

- Authentication: `/api/auth/`
- Events: `/api/events/`
- Registrations: `/api/registrations/`

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## License

This project is open-source. Feel free to use and modify.

## Contact

If you have questions, open an issue on GitHub.

