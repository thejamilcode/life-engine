from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Send a test email using the configured SMTP settings."

    def add_arguments(self, parser):
        parser.add_argument("recipient", help="Email address that should receive the test email.")

    def handle(self, *args, **options):
        recipient = options["recipient"]

        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            raise CommandError("EMAIL_HOST_USER and EMAIL_HOST_PASSWORD must be set.")

        sent = send_mail(
            subject="Life Engine email test",
            message="If you received this, Gmail SMTP is configured correctly.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

        if sent != 1:
            raise CommandError("Django did not report a successful email send.")

        self.stdout.write(self.style.SUCCESS(f"Test email sent to {recipient}"))
