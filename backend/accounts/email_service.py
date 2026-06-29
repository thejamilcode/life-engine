"""
Email delivery for OTP and other transactional mail.

Railway/Render free tiers block outbound SMTP (ports 587/465). Use an HTTPS
email API in production (Brevo or Resend). SMTP remains supported for local dev.
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from email.utils import formataddr

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class EmailNotConfiguredError(RuntimeError):
    pass


def get_email_backend_name() -> str | None:
    if getattr(settings, 'BREVO_API_KEY', ''):
        return 'brevo'
    if getattr(settings, 'RESEND_API_KEY', ''):
        return 'resend'
    if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
        return 'smtp'
    return None


def is_email_configured() -> bool:
    return get_email_backend_name() is not None


def _sender_address() -> str:
    if settings.EMAIL_HOST_USER:
        return formataddr((settings.EMAIL_SENDER_NAME, settings.EMAIL_HOST_USER))
    return settings.DEFAULT_FROM_EMAIL


def _sender_email() -> str:
    if settings.EMAIL_HOST_USER:
        return settings.EMAIL_HOST_USER
    return settings.DEFAULT_FROM_EMAIL


def _post_json(url: str, headers: dict, payload: dict) -> dict:
    body = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        url,
        data=body,
        headers={**headers, 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=settings.EMAIL_TIMEOUT) as response:
            raw = response.read().decode('utf-8')
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'Email API error ({exc.code}): {detail}') from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f'Email API connection failed: {exc.reason}') from exc


def _send_via_brevo(recipient: str, subject: str, message: str) -> None:
    payload = {
        'sender': {
            'name': settings.EMAIL_SENDER_NAME,
            'email': _sender_email(),
        },
        'to': [{'email': recipient}],
        'subject': subject,
        'textContent': message,
    }
    _post_json(
        'https://api.brevo.com/v3/smtp/email',
        headers={
            'accept': 'application/json',
            'api-key': settings.BREVO_API_KEY,
        },
        payload=payload,
    )


def _send_via_resend(recipient: str, subject: str, message: str) -> None:
    payload = {
        'from': _sender_address(),
        'to': [recipient],
        'subject': subject,
        'text': message,
    }
    _post_json(
        'https://api.resend.com/emails',
        headers={'Authorization': f'Bearer {settings.RESEND_API_KEY}'},
        payload=payload,
    )


def _send_via_smtp(recipient: str, subject: str, message: str) -> None:
    sent = send_mail(
        subject=subject,
        message=message,
        from_email=_sender_address(),
        recipient_list=[recipient],
        fail_silently=False,
    )
    if sent != 1:
        raise RuntimeError('SMTP did not report a successful email send.')


def send_email(recipient: str, subject: str, message: str) -> str:
    """Send a plain-text email. Returns the backend name used."""
    backend = get_email_backend_name()
    if not backend:
        raise EmailNotConfiguredError(
            'No email backend configured. Set BREVO_API_KEY or RESEND_API_KEY '
            '(recommended on Railway/Render) or EMAIL_HOST_USER + EMAIL_HOST_PASSWORD for local SMTP.'
        )

    logger.info('Sending email via %s to %s', backend, recipient)

    if backend == 'brevo':
        _send_via_brevo(recipient, subject, message)
    elif backend == 'resend':
        _send_via_resend(recipient, subject, message)
    else:
        _send_via_smtp(recipient, subject, message)

    return backend


def build_otp_email(otp: str, name: str = '') -> tuple[str, str]:
    greeting = f'আস্সালামু আলাইকুম {name},' if name else 'আস্সালামু আলাইকুম,'
    subject = f'Life Engine — আপনার OTP কোড: {otp}'
    message = f"""
{greeting}

আপনার Life Engine অ্যাকাউন্ট যাচাই করতে নিচের OTP কোডটি ব্যবহার করুন:

  ━━━━━━━━━━━━━━━━━━━
      {otp}
  ━━━━━━━━━━━━━━━━━━━

⏱️  এই কোডটি {settings.OTP_EXPIRY_MINUTES} মিনিটের মধ্যে মেয়াদ শেষ হবে।

যদি আপনি এই রেজিস্ট্রেশন না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।

আল্লাহ হাফেজ
Life Engine Team
    """.strip()
    return subject, message
