from rest_framework import serializers
from .models import EventCategory, TimeSlot, EventAvailability, UserBooking


class EventCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = EventCategory
        fields = ['id', 'name']
        read_only_fields = ['id']



class TimeSlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time']


class EventAvailabilitySerializer(serializers.ModelSerializer):
    category = EventCategorySerializer()
    time_slot = TimeSlotSerializer()

    class Meta:
        model = EventAvailability
        fields = ['category', 'time_slot', 'status']


class UserBookingSerializer(serializers.ModelSerializer):
    event = EventAvailabilitySerializer()

    class Meta:
        model = UserBooking
        fields = ['id', 'event', 'status', 'booked_at', 'cancelled_at']