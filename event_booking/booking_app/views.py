from datetime import time
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .managers.booking_manager import EventBookingManager
from .managers.user_manager import UserBookingManager
from .models import EventCategory, TimeSlot, UserBooking, User, EventAvailability
from .paginator import paginator_func
from .permission_classes import IsAdminUser
from .serializers import EventCategorySerializer, TimeSlotSerializer, UserBookingSerializer, \
    UserMyBookingSerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


class EventCategoryView(APIView):
    """
    API view to handle Event Category operations.

    Supports:
    - GET: Retrieve all event categories.
    - POST: Create a new event category.
    """
    @staticmethod
    def get(request):
        """
        Retrieve all event categories.

        Returns:
            200 OK: List of all categories.
            500 Internal Server Error: If an exception occurs.
        """
        try:
            categories = EventCategory.objects.all()
            serializer = EventCategorySerializer(categories, many=True)
            return Response({'data': serializer.data, "result": "Success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal Server Error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def post(request):
        """
        Create a new event category.

        Request body should contain valid category data.

        Returns:
            201 Created: If category is successfully created.
            200 OK: If validation fails with errors.
            500 Internal Server Error: If an exception occurs.
        """
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
    """
    API view to manage and retrieve time slots.

    Automatically initializes default time slots if none exist.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        """
        Retrieve all time slots.

        If no time slots exist, initialize with predefined slots:
        - 9:00 AM to 12:00 PM
        - 12:00 PM to 3:00 PM
        - 3:00 PM to 6:00 PM

        Returns:
            200 OK: Success response with time slot data.
            500 Internal Server Error: If an exception occurs.
        """
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


class UserBookingHistoryView(APIView):
    """
    API view to retrieve the booking history of the logged-in user.

    Permissions:
        - User must be authenticated.
        - User must be an admin (custom permission IsAdminUser).
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    @staticmethod
    def get(request):
        """
        Retrieve booking history of the authenticated user.

        Returns:
            200 OK: List of bookings in reverse chronological order.
        """
        bookings = UserBooking.objects.filter(user=request.user).order_by('-booked_at')
        serializer = UserBookingSerializer(bookings, many=True)
        return Response({'bookings': serializer.data}, status=status.HTTP_200_OK)


class EventAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        """
        Fetch availability for provided dates.
        """
        try:
            result = EventBookingManager.fetch_availability(request)
            return Response(result['body'], status=result['status'])
        except Exception as err:
            return Response({
                'result': 'Failed',
                'message': 'Something went wrong',
                'error': str(err)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def post(request):
        """
        Create or update availability for a date and time slot.
        """
        try:
            result = EventBookingManager.create_or_update_availability(request)
            return Response(result['body'], status=result['status'])
        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal server error.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def delete(request):
        """
        Delete a time slot if it's not already booked.
        """
        try:
            result = EventBookingManager.delete_availability(request)
            return Response(result['body'], status=result['status'])
        except Exception as e:
            return Response({
                'result': 'Failed',
                'message': 'Internal server error.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserBookingAPIView(APIView):
    """
    API view to handle user bookings (GET and POST).
    """

    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def get(request):
        """List all bookings of the logged-in user."""
        filters = request.query_params
        bookings = UserBooking.objects.select_related('event').order_by(
            '-booked_at', '-cancelled_at'
        )
        data, total_no_of_objs = paginator_func(filters, bookings)
        serializer = UserBookingSerializer(data, many=True)
        return Response({
            "result": "Success",
            "data": serializer.data,
            "count": total_no_of_objs
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        """Create a booking using manager logic."""
        data, code = UserBookingManager.create_booking(request.user, request.data)
        return Response(data, status=code)


class MyBookingsView(APIView):
    """
    API view to handle retrieval and cancellation of user's bookings.

    - GET: Returns a list of the user's current and past bookings.
    - DELETE: Cancels a booking made by the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        """
        Get all bookings for the authenticated user.

        Returns:
            Response: JSON object containing a list of bookings and a success message.
        """
        bookings = UserBookingManager.get_user_bookings(request.user)
        serializer = UserMyBookingSerializer(bookings, many=True)
        return Response({
            "result": "Success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def delete(request, pk):
        """
        Cancel a booking made by the authenticated user.

        Args:
            pk (int): Primary key of the booking to be canceled.

        Returns:
            Response: JSON object with status message.
        """
        response_data, code = UserBookingManager.cancel_booking(request.user, pk)
        return Response(response_data, status=code)


class CheckSessionView(APIView):
    """
    API view to check the current session's authentication status.
    """

    @staticmethod
    def get(request):
        """
        Check if the user is authenticated.

        Returns:
            Response: A JSON response with authentication status and user details (if authenticated).
        """
        try:
            if request.user.is_authenticated:
                return Response({
                    'authenticated': True,
                    'username': request.user.username,
                    'is_admin': request.user.is_admin,
                    'name': request.user.first_name,
                }, status=status.HTTP_200_OK)
            else:
                return Response({'authenticated': False}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    """
    API view to authenticate and log in a user.
    """

    @staticmethod
    def post(request):
        """
        Authenticate the user and create a session.

        Request Body:
            - email (str): User's email address.
            - password (str): User's password.

        Returns:
            Response: Authentication result and admin status.
        """
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'authenticated': True,
                    'username': user.username,
                    'is_admin': user.is_admin,
                    'name': user.first_name,
                })
            else:
                return Response({
                    'authenticated': False,
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'error': 'Something went wrong.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class RegisterView(APIView):
    """
    API view to register a new user.
    """

    @staticmethod
    def post(request):
        """
        Register a new user with name, email, and password.

        Request Body:
            - name (str): User's full name.
            - email (str): User's email (also used as username).
            - password (str): User's password.

        Returns:
            Response: Registration success message or error.
        """
        try:
            name = request.data.get('name')
            email = request.data.get('email')
            password = request.data.get('password')
            if User.objects.filter(username=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
            user.save()
            return Response({'message': 'User registered successfully', 'result': 'Success'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e), 'result': 'Failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LogoutView(APIView):
    """
    API view to log out an authenticated user.
    """

    @staticmethod
    def post(request):
        """
        Log out the current user.

        Returns:
            Response: Success message on logout.
        """
        try:
            logout(request)
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



