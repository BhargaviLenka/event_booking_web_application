from datetime import datetime, time

from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import EventCategory, TimeSlot, UserBooking, EventAvailability
from .serializers import EventCategorySerializer, TimeSlotSerializer, UserBookingSerializer, EventAvailabilitySerializer
from django.shortcuts import get_object_or_404


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

# class EventAvailabilityCreateView(APIView):
#     def post(self, request):
#         try:
#             serializer = EventAvailabilitySerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({'result': 'Success', 'data': serializer.data})
#             return Response({'result': 'Failed', 'message': 'Validation error', 'errors': serializer.errors}, status=400)
#         except Exception as e:
#             return Response({'result': 'Failed', 'message': 'Server error', 'error': str(e)}, status=500)


class EventAvailabilityCreateView(APIView):

    @staticmethod
    def get(request):
        dates = request.GET.getlist('dates[]') or request.GET.get('dates', '').split(',')
        if not dates:
            return Response({'result': 'Failed', 'message': 'Date range required'}, status=400)

        availability = EventAvailability.objects.filter(date__in=dates).select_related('category', 'time_slot')
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
                new_data = EventAvailabilitySerializer(data=data_)
                return Response({
                    'result': 'Success',
                    'data': new_data,
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