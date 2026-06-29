from django.core.management.base import BaseCommand, CommandError

from accounts.email_service import is_email_configured, send_email


class Command(BaseCommand):
    help = "Send a test email using the configured email backend."

    def add_arguments(self, parser):
        parser.add_argument("recipient", help="Email address that should receive the test email.")

    def handle(self, *args, **options):
        recipient = options["recipient"]

        if not is_email_configured():
            raise CommandError(
                "No email backend configured. Set BREVO_API_KEY or RESEND_API_KEY "
                "(production) or EMAIL_HOST_USER + EMAIL_HOST_PASSWORD (local SMTP)."
            )

        backend = send_email(
            recipient=recipient,
            subject="Life Engine email test",
            message="If you received this, email delivery is configured correctly.",
        )

        self.stdout.write(self.style.SUCCESS(f"Test email sent to {recipient} via {backend}"))
