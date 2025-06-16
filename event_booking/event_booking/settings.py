import os
from pathlib import Path

from django.conf.global_settings import SESSION_COOKIE_SAMESITE

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key'  # Replace with your own

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'booking_app',
]
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # <-- very important: cors middleware before CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'event_booking.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'event_booking.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Authentication model (if you have custom user)
AUTH_USER_MODEL = 'booking_app.User'

# CORS CONFIGURATION
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# CSRF CONFIGURATION
CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
]
SESSION_COOKIE_SECURE = False  # or comment it out entirely for localhost
CSRF_COOKIE_SECURE = False

# Cookie configs - SAFE for local development
SESSION_COOKIE_SAMESITE='Lax'

# Static files
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
}


