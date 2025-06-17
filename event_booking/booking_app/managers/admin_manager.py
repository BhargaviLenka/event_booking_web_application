class EventBookingManager:

    @staticmethod
    def get_event_availability_data(request):
        dates = request.GET.getlist('dates[]') or request.GET.get('dates', '').split(',')
        user = request.user
        if not dates:
            return Response({'result': 'Failed', 'message': 'Date range required'}, status=400)
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