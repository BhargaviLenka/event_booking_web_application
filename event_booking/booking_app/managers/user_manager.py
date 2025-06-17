from django.db import transaction, DatabaseError, OperationalError
from django.utils.timezone import now
from datetime import datetime

from booking_app.models import EventAvailability, UserBooking


class UserBookingManager:
    """
    Manages logic related to user bookings.
    """

    @staticmethod
    @transaction.atomic
    def create_booking(user, data):
        """
        Handles the booking creation logic for a user.

        Args:
            user (User): Authenticated user making the booking.
            data (dict): Contains 'date', 'time_slot', and 'categoryId'.

        Returns:
            Tuple (dict, int): Response body and HTTP status.
        """
        try:
            date_str = data.get('date')
            slot_id = data.get('time_slot')
            category_id = data.get('categoryId')

            date = datetime.strptime(date_str, '%Y-%m-%d').date()

            if date < now().date():
                return {"error": "Cannot book past events."}, 400

            event = EventAvailability.objects.select_for_update(nowait=True).get(
                date=date,
                category_id=category_id,
                time_slot_id=slot_id,
                status='AVAILABLE'
            )

            exists = UserBooking.objects.select_for_update(nowait=True).filter(
                event_id=event.id,
                status='ACTIVE'
            ).exists()

            if exists:
                return {"error": "Someone already booked this event."}, 400

            UserBooking.objects.create(
                user=user,
                event_id=event.id,
                booked_at=now(),
                status='ACTIVE'
            )

            event.status = 'BOOKED'
            event.save()

            return {"message": "Booking is successful", "result": "Success"}, 201

        except EventAvailability.DoesNotExist:
            return {"result": "Failed", "error": "The selected event is not available."}, 200

        except (DatabaseError, OperationalError):
            return {
                "result": "Failed",
                "error": "Another booking is currently in progress. Please try again shortly."
            }, 200

        except Exception as err:
            return {
                "message": "Booking is unsuccessful",
                "result": "Failed",
                "error": str(err)
            }, 400

    @staticmethod
    def get_user_bookings(user):
        """
        Returns bookings for the given user.

        Args:
            user (User): Authenticated user.

        Returns:
            QuerySet: UserBooking queryset.
        """
        return UserBooking.objects.filter(user=user).select_related(
            'event__category', 'event__time_slot'
        ).order_by('-booked_at')

    @staticmethod
    @transaction.atomic
    def cancel_booking(user, booking_id):
        """
        Cancels a user’s booking if valid.

        Args:
            user (User): Authenticated user.
            booking_id (int): ID of the booking to cancel.

        Returns:
            Tuple (dict, int): Response body and HTTP status code.
        """
        if not booking_id:
            return {'error': 'booking_id is required.'}, 400

        try:
            booking = UserBooking.objects.select_related('event').get(id=booking_id, user=user)
            event_obj = booking.event
        except UserBooking.DoesNotExist:
            return {'error': 'Booking not found or does not belong to the user.'}, 404

        if booking.status == 'CANCELLED':
            return {'error': 'Booking is already cancelled.'}, 400

        booking.status = 'CANCELLED'
        booking.cancelled_at = now()
        booking.save()
        event_obj.status = 'AVAILABLE'
        event_obj.save()

        return {'message': 'Booking cancelled successfully.'}, 200
