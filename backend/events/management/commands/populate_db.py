from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event
from datetime import date, time, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = "Populate database with sample data for testing"

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating sample users...")

        # Create admin user
        if not User.objects.filter(email="admin@eventshub.com").exists():
            admin = User.objects.create_user(
                email="admin@eventshub.com",
                password="Admin@123",
                first_name="Admin",
                is_admin=True,
                is_staff=True,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created admin user: admin@eventshub.com (password: Admin@123)"
                )
            )

        # Create regular users
        users_data = [
            {
                "email": "user1@example.com",
                "password": "User@123",
                "first_name": "John",
            },
            {
                "email": "user2@example.com",
                "password": "User@123",
                "first_name": "Jane",
            },
        ]

        for user_data in users_data:
            if not User.objects.filter(email=user_data["email"]).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created user: {user_data["email"]} (password: User@123)'
                    )
                )

        self.stdout.write("\nCreating sample events...")

        # Sample events data based on frontend
        events_data = [
            {
                "title": "Future of AI Conference",
                "description": "A deep dive into the latest advancements in artificial intelligence and machine learning.",
                "date": date.today() + timedelta(days=10),
                "time": time(9, 0),
                "category": "Technology",
                "location_name": "Tech Hub Convention Center",
                "location_google_map_url": "https://maps.google.com/?q=Tech+Hub+Convention+Center",
                "number_of_seats": 500,
                "ticket_price": 150,
                "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "Jazz in the Park",
                "description": "An evening of smooth jazz performances by local artists under the stars.",
                "date": date.today() + timedelta(days=13),
                "time": time(18, 0),
                "category": "Music",
                "location_name": "Central City Park",
                "location_google_map_url": "https://maps.google.com/?q=Central+City+Park",
                "number_of_seats": 200,
                "ticket_price": 0,
                "image_url": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "Startup Networking Mixer",
                "description": "Connect with investors and fellow entrepreneurs to grow your business network.",
                "date": date.today() + timedelta(days=15),
                "time": time(10, 0),
                "category": "Business",
                "location_name": "The Hive Coworking",
                "location_google_map_url": "https://maps.google.com/?q=The+Hive+Coworking",
                "number_of_seats": 100,
                "ticket_price": 25,
                "image_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "Modern Art Exhibition Opening",
                "description": "Exclusive first look at the new modern art collection featuring international artists.",
                "date": date.today() + timedelta(days=30),
                "time": time(14, 0),
                "category": "Art",
                "location_name": "Metropolitan Gallery",
                "location_google_map_url": "https://maps.google.com/?q=Metropolitan+Gallery",
                "number_of_seats": 300,
                "ticket_price": 0,
                "image_url": "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "City Marathon 2026",
                "description": "Annual city marathon. Join thousands of runners raising money for charity.",
                "date": date.today() + timedelta(days=35),
                "time": time(8, 0),
                "category": "Sports",
                "location_name": "Downtown Plaza Start Line",
                "location_google_map_url": "https://maps.google.com/?q=Downtown+Plaza",
                "number_of_seats": 5000,
                "ticket_price": 50,
                "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "Web Development Bootcamp",
                "description": "Intensive 2-day workshop on modern web development with React and Node.js",
                "date": date.today() + timedelta(days=20),
                "time": time(9, 30),
                "category": "Technology",
                "location_name": "Code Academy Downtown",
                "location_google_map_url": "https://maps.google.com/?q=Code+Academy+Downtown",
                "number_of_seats": 50,
                "ticket_price": 299,
                "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
                "status": "upcoming",
            },
            {
                "title": "Food & Wine Festival",
                "description": "Experience culinary delights from top chefs paired with exquisite wines.",
                "date": date.today() + timedelta(days=25),
                "time": time(17, 0),
                "category": "Food",
                "location_name": "Riverside Convention Center",
                "location_google_map_url": "https://maps.google.com/?q=Riverside+Convention+Center",
                "number_of_seats": 400,
                "ticket_price": 75,
                "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
                "status": "upcoming",
            },
        ]

        for event_data in events_data:
            if not Event.objects.filter(title=event_data["title"]).exists():
                Event.objects.create(**event_data)
                self.stdout.write(
                    self.style.SUCCESS(f'Created event: {event_data["title"]}')
                )

        self.stdout.write(self.style.SUCCESS("\n Database populated successfully!"))
        self.stdout.write("\nYou can now:")
        self.stdout.write("- Login as admin: admin@eventshub.com / Admin@123")
        self.stdout.write("- Login as user: user1@example.com / User@123")
        self.stdout.write("- Or create a new account")
