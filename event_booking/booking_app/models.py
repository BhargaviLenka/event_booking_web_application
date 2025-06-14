from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'auth_user_custom'

class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'event_category'

class TimeSlot(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = 'time_slot'

class EventAvailability(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('BOOKED', 'Booked')
    ]

    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='AVAILABLE')
    date = models.DateField(null=True)
    class Meta:
        db_table = 'event_availability'

class UserBooking(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(EventAvailability, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_booking'