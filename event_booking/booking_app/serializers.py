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
    user = serializers.SerializerMethodField()

    class Meta:
        model = EventAvailability
        fields = ['category', 'time_slot', 'status', 'date', 'user']

    def get_user(self, obj):
        booking = obj.user_booking.filter(status='ACTIVE').first()
        if booking:
            return {
                "id": booking.user.id,
                "name": booking.user.get_full_name() or booking.user.username,
                "email": booking.user.email
            }
        return None


class UserBookingSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(queryset=EventAvailability.objects.all(), required=True)

    class Meta:
        model = UserBooking
        fields = ['id', 'user', 'event', 'status', 'booked_at', 'cancelled_at']
        read_only_fields = ['id', 'booked_at', 'cancelled_at']

