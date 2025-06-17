from datetime import datetime
from django.utils.timezone import now
from django.db.models import Exists, OuterRef
from rest_framework import status

from booking_app.models import EventAvailability, UserBooking
from booking_app.serializers import EventAvailabilitySerializer


class EventBookingManager:
    """
    Handles all event availability-related operations like fetching, creating, updating,
    and deleting slots, with business rules such as preventing edits to past or booked slots.
    """

    @staticmethod
    def fetch_availability(request):

        """
                Retrieves event availability for the given date(s), including whether the current
                user has booked each slot.

                Args:
                    request (HttpRequest): The HTTP GET request containing 'dates' query params.

                Returns:
                    dict: Response body and HTTP status code.
                """

        dates = request.GET.getlist('dates[]') or request.GET.get('dates', '').split(',')
        user = request.user
        if not dates or dates == ['']:
            return {
                'body': {'result': 'Failed', 'message': 'Date range required'},
                'status': status.HTTP_400_BAD_REQUEST
            }

        availability = EventAvailability.objects.filter(date__in=dates).select_related(
            'category', 'time_slot'
        ).prefetch_related(
            'user_booking__user'
        ).annotate(
            is_self_booked=Exists(
                UserBooking.objects.filter(
                    user=user,
                    event=OuterRef('pk'),
                    status='ACTIVE'
                )
            )
        )
        serializer = EventAvailabilitySerializer(availability, many=True)
        return {
            'body': {'result': 'Success', 'data': serializer.data},
            'status': status.HTTP_200_OK
        }

    @staticmethod
    def create_or_update_availability(request):
        """
                Creates a new event availability slot or updates the category of an existing one,
                ensuring the date is not in the past and the slot is not already booked.

                Args:
                    request (HttpRequest): The HTTP POST request containing 'date', 'time_slot', and 'category'.

                Returns:
                    dict: Response body and HTTP status code.
                """

        data = request.data
        date_str = data.get('date')
        time_slot_id = data.get('time_slot')
        category_id = data.get('category')

        if not (date_str and time_slot_id and category_id):
            return {
                'body': {
                    'result': 'Failed',
                    'message': 'Date, Time Slot, and Category are required.'
                },
                'status': status.HTTP_400_BAD_REQUEST
            }

        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        if selected_date < now().date():
            return {
                'body': {
                    'result': 'Failed',
                    'message': 'Cannot update past dates.'
                },
                'status': status.HTTP_400_BAD_REQUEST
            }

        availability = EventAvailability.objects.filter(
            date=selected_date,
            time_slot_id=time_slot_id
        ).first()

        if availability:
            has_booking = UserBooking.objects.filter(event=availability, status='ACTIVE').exists()
            if has_booking:
                return {
                    'body': {
                        'result': 'Failed',
                        'message': 'Cannot update category — slot already booked.'
                    },
                    'status': status.HTTP_400_BAD_REQUEST
                }
            availability.category_id = category_id
            availability.save()
            return {
                'body': {
                    'result': 'Success',
                    'message': 'Category updated for existing slot.'
                },
                'status': status.HTTP_200_OK
            }
        else:
            EventAvailability.objects.create(
                date=selected_date,
                time_slot_id=int(time_slot_id),
                category_id=int(category_id)
            )
            return {
                'body': {
                    'result': 'Success',
                    'message': 'New availability created.'
                },
                'status': status.HTTP_201_CREATED
            }

    @staticmethod
    def delete_availability(request):
        """
                Deletes an availability slot if it exists and is not already booked.

                Args:
                    request (HttpRequest): The HTTP DELETE request containing 'date' and 'time_slot'.

                Returns:
                    dict: Response body and HTTP status code.
                """

        date = request.data.get('date')
        time_slot_id = request.data.get('time_slot')

        if not date or not time_slot_id:
            return {
                'body': {'error': 'date and time_slot are required.'},
                'status': status.HTTP_400_BAD_REQUEST
            }

        try:
            availability = EventAvailability.objects.get(date=date, time_slot_id=time_slot_id)
        except EventAvailability.DoesNotExist:
            return {
                'body': {'error': 'Slot not found.'},
                'status': status.HTTP_404_NOT_FOUND
            }

        if availability.status == 'BOOKED':
            return {
                'body': {'error': 'Cannot delete a booked slot.'},
                'status': status.HTTP_400_BAD_REQUEST
            }

        availability.delete()
        return {
            'body': {'message': 'Slot deleted successfully.'},
            'status': status.HTTP_200_OK
        }
