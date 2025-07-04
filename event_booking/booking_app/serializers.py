from rest_framework import serializers
from .models import EventCategory, TimeSlot, EventAvailability, UserBooking, User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']


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
    is_self_booked = serializers.BooleanField()

    class Meta:
        model = EventAvailability
        fields = ['category', 'time_slot', 'status', 'date', 'user', 'is_self_booked']

    def get_user(self, obj):
        booking = obj.user_booking.filter(status='ACTIVE').first()
        if booking:
            return {
                "id": booking.user.id,
                "name": booking.user.get_full_name() or booking.user.username,
                "email": booking.user.email
            }
        return None


class EventAvailabilityDataSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer()
    time_slot = TimeSlotSerializer()

    class Meta:
        model = EventAvailability
        fields = ['category', 'time_slot', 'status', 'date']


class UserBookingSerializer(serializers.ModelSerializer):
    event = EventAvailabilityDataSerializer()
    user = UserSerializer()

    class Meta:
        model = UserBooking
        fields = ['id', 'user', 'event', 'status', 'booked_at', 'cancelled_at']
        read_only_fields = ['id', 'booked_at', 'cancelled_at']


class UserMyBookingSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='event.category.name')
    start_time = serializers.TimeField(source='event.time_slot.start_time')
    end_time = serializers.TimeField(source='event.time_slot.end_time')
    date = serializers.DateField(source='event.date')
    status = serializers.CharField()

    class Meta:
        model = UserBooking
        fields = ['id', 'category', 'start_time', 'end_time', 'date', 'status', 'booked_at', 'cancelled_at']