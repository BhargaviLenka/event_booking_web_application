from django.shortcuts import render
from rest_framework.views import APIView

from booking_app.models import EventCategory


# Create your views here.


class GetEventCategories(APIView):

    def get(self, request):
        # request_data = request.query_params
        # event_list = request_data.get('eventTypes', [])
        data = list(EventCategory.objects.all().values_list('name', flat=True))
        return {'data':data}
