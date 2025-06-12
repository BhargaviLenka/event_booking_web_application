from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import EventCategory, TimeSlot, UserBooking
from .serializers import EventCategorySerializer, TimeSlotSerializer, UserBookingSerializer
from django.shortcuts import get_object_or_404


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class EventCategoryCreateUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Create a new event category
        serializer = EventCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Event category created', 'data': serializer.data},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        # Edit an existing event category
        if not pk:
            return Response({'error': 'Category ID (pk) required for update.'}, status=status.HTTP_400_BAD_REQUEST)

        category = get_object_or_404(EventCategory, pk=pk)
        serializer = EventCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Event category updated', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TimeSlotCreateUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Time slot created', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if not pk:
            return Response({'error': 'Time slot ID (pk) required for update.'}, status=status.HTTP_400_BAD_REQUEST)

        slot = get_object_or_404(TimeSlot, pk=pk)
        serializer = TimeSlotSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Time slot updated', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserBookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all bookings by current user
        bookings = UserBooking.objects.filter(user=request.user).order_by('-booked_at')
        serializer = UserBookingSerializer(bookings, many=True)
        return Response({'bookings': serializer.data}, status=status.HTTP_200_OK)