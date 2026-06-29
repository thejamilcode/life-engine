from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Check the active Django database connection."

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        settings = connection.settings_dict
        engine = settings.get("ENGINE", "")
        host = settings.get("HOST") or settings.get("NAME")

        self.stdout.write(self.style.SUCCESS("Database connection OK"))
        self.stdout.write(f"Engine: {engine}")
        self.stdout.write(f"Vendor: {connection.vendor}")
        self.stdout.write(f"Database/host: {host}")
