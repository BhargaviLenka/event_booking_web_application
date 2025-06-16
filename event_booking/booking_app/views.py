from datetime import datetime, time
from django.contrib.auth import authenticate, login, logout

from django.utils import timezone
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import EventCategory, TimeSlot, UserBooking, EventAvailability, User
from .serializers import EventCategorySerializer, TimeSlotSerializer, UserBookingSerializer, \
    EventAvailabilitySerializer, UserMyBookingSerializer
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class EventCategoryView(APIView):

    @staticmethod
    def get(request):
        try:
            categories = EventCategory.objects.all()
            serializer = EventCategorySerializer(categories, many=True)
            return Response({'data': serializer.data,"result":"Success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal Server Error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def post(request):
        try:
            serializer = EventCategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'result': 'Success',
                    'message': 'Category created',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'result': 'Failed',
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal Server Error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def put(request, pk):
        try:
            try:
                category = EventCategory.objects.get(pk=pk)
            except EventCategory.DoesNotExist:
                return Response({
                    'result': 'Failed',
                    'message': 'Category not found'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = EventCategorySerializer(instance=category, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'result': 'Success',
                    'message': 'Category updated',
                    'data': serializer.data
                })
            return Response({
                'result': 'Failed',
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal Server Error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TimeSlotView(APIView):
    # permission_classes = [IsAdminUser]

    @staticmethod
    def get(request):
        try:
            if TimeSlot.objects.count() == 0:
                predefined_slots = [
                    {"start": time(9, 0), "end": time(12, 0)},
                    {"start": time(12, 0), "end": time(15, 0)},
                    {"start": time(15, 0), "end": time(18, 0)},
                ]

                for slot in predefined_slots:
                    TimeSlot.objects.create(
                        start_time=slot["start"],
                        end_time=slot["end"]
                    )
                print("Time slots inserted successfully.")
            slots = TimeSlot.objects.all()
            serializer = TimeSlotSerializer(slots, many=True)
            return Response({
                'status': 'Success',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'Failed',
                'message': 'Error fetching time slots',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def post(request):
        try:
            serializer = TimeSlotSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'Success',
                    'message': 'Time slot created',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'status': 'Failed',
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'Failed',
                'message': 'Error creating time slot',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def put(request, pk):
        try:
            slot = get_object_or_404(TimeSlot, pk=pk)
            serializer = TimeSlotSerializer(slot, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'Success',
                    'message': 'Time slot updated',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                'status': 'Failed',
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'Failed',
                'message': 'Error updating time slot',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserBookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all bookings by current user
        bookings = UserBooking.objects.filter(user=request.user).order_by('-booked_at')
        serializer = UserBookingSerializer(bookings, many=True)
        return Response({'bookings': serializer.data}, status=status.HTTP_200_OK)


class EventAvailabilityListView(APIView):
    def get(self, request):
        dates = request.GET.getlist('dates') or request.GET.get('dates', '').split(',')
        if not dates:
            return Response({'result': 'Failed', 'message': 'Date range required'}, status=400)

        slots = EventAvailability.objects.filter(date__in=dates).select_related('category', 'time_slot')

        data = [
            {
                'id': s.id,
                'date': s.date,
                'slot': s.time_slot.name,
                'slot_id': s.time_slot.id,
                'category': {'id': s.category.id, 'name': s.category.name} if s.category else None,
                'status': s.status
            } for s in slots
        ]
        return Response({'result': 'Success', 'data': data})




class EventAvailabilityView(APIView):

    @staticmethod
    def get(request):
        dates = request.GET.getlist('dates[]') or request.GET.get('dates', '').split(',')
        if not dates:
            return Response({'result': 'Failed', 'message': 'Date range required'}, status=400)

        availability = EventAvailability.objects.filter(date__in=dates).select_related('category', 'time_slot').prefetch_related('user_booking__user')
        serializer = EventAvailabilitySerializer(availability, many=True)

        return Response({'result': 'Success', 'data': serializer.data})

    @staticmethod
    def post(request):
        try:
            data = request.data
            date_str = data.get('date')
            time_slot_id = data.get('time_slot')
            category_id = data.get('category')

            if not (date_str and time_slot_id and category_id):
                return Response({
                    'result': 'Failed',
                    'message': 'Date, Time Slot, and Category are required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()

            if selected_date < now().date():
                return Response({
                    'result': 'Failed',
                    'message': 'Cannot update past dates.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if availability exists
            availability = EventAvailability.objects.filter(
                date=selected_date,
                time_slot_id=time_slot_id
            ).first()

            if availability:
                # Check for booking
                has_booking = UserBooking.objects.filter(event=availability, status='ACTIVE').exists()
                if has_booking:
                    return Response({
                        'result': 'Failed',
                        'message': 'Cannot update category — slot already booked.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                availability.category_id = category_id
                availability.save()
                serializer = EventAvailabilitySerializer(availability)
                return Response({
                    'result': 'Success',
                    'data': serializer.data,
                    'message': 'Category updated for existing slot.'
                }, status=status.HTTP_200_OK)
            else:
                # Create new availability
                data_ = EventAvailability.objects.create(
                    date=selected_date,
                    time_slot_id= int(time_slot_id),
                    category_id= int(category_id))
                new_data = EventAvailabilitySerializer(data_)
                return Response({
                    'result': 'Success',
                    'data': new_data.data,
                    'message': 'New availability created.'
                }, status=status.HTTP_201_CREATED)
                # return Response({
                #     'result': 'Failed',
                #     'message': 'Validation failed.',
                #     'errors': serializer.errors
                # }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal server error.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        date = request.data.get('date')
        time_slot_id = request.data.get('time_slot')

        if not date or not time_slot_id:
            return Response({'error': 'date and time_slot are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            availability = EventAvailability.objects.get(date=date, time_slot_id=time_slot_id)
        except EventAvailability.DoesNotExist:
            return Response({'error': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)

        if availability.status == 'BOOKED':
            return Response({'error': 'Cannot delete a booked slot.'}, status=status.HTTP_400_BAD_REQUEST)

        availability.delete()
        return Response({'message': 'Slot deleted successfully.'}, status=status.HTTP_200_OK)



class UserBookingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List all bookings of the logged-in user."""
        bookings = UserBooking.objects.filter(user=request.user).select_related('event')
        serializer = UserBookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new booking."""
        # id = User.objects.create(username="Bhargavi", email="bhargavilenka123@gmail.com", password="bhargavi").pk
        data = {
            "user": request.user,
            "event": request.data.get('category'),
            "status": "ACTIVE"
          }
        serializer = UserBookingSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.validated_data['event']
            if event.date < timezone.now().date():
                return Response({"error": "Cannot book past events."}, status=status.HTTP_400_BAD_REQUEST)

            # Prevent duplicate booking
            exists = UserBooking.objects.filter(user_id=data.get('user'), event=event, status='ACTIVE').exists()
            if exists:
                return Response({"error": "You already booked this event."}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(user_id=request.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Cancel an event slot."""
        booking_id = request.data.get("id")
        try:
            booking = UserBooking.objects.get(id=booking_id, user=request.user)
            if booking.status == 'CANCELLED':
                return Response({"detail": "Booking already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            booking.status = 'CANCELLED'
            booking.cancelled_at = timezone.now()
            booking.save()
            return Response({"detail": "Booking cancelled successfully."}, status=status.HTTP_200_OK)
        except UserBooking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


class MyBookingsView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = UserBooking.objects.filter(user_id=3).select_related(
            'event__category', 'event__time_slot'
        ).order_by('-booked_at')

        serializer = UserMyBookingSerializer(bookings, many=True)
        return Response({
            "result": "Success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        booking_id = request.data.get('booking_id')
        user = request.user

        if not booking_id:
            return Response({'error': 'booking_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = UserBooking.objects.get(id=booking_id, user=user)
        except UserBooking.DoesNotExist:
            return Response({'error': 'Booking not found or does not belong to the user.'},
                            status=status.HTTP_404_NOT_FOUND)

        if booking.status == 'CANCELLED':
            return Response({'error': 'Booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'CANCELLED'
        booking.cancelled_at = now()
        booking.save()

        return Response({'message': 'Booking cancelled successfully.'}, status=status.HTTP_200_OK)






class CheckSessionView(APIView):
    @staticmethod
    def get(request):
        try:
            if request.user.is_authenticated:
                return Response({
                    'authenticated': True,
                    'username': request.user.username,
                    'is_admin': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({'authenticated': False}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):

    @staticmethod
    def post(request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return Response({'message': 'Login successful', 'is_admin': user.is_admin, 'authenticated': True})
            else:
                return Response({'authenticated': False, 'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response({'error': 'Something went wrong.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(APIView):

    @staticmethod
    def post(request):
        try:
            name = request.data.get('name')
            email = request.data.get('email')
            password = request.data.get('password')

            if User.objects.filter(username=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
            user.save()

            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    @staticmethod
    def post(request):
        try:
            logout(request)
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
