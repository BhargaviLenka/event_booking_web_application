from django.urls import path
from .views import EventCategoryCreateUpdateView, TimeSlotCreateUpdateView

urlpatterns = [
    path('categories/', EventCategoryCreateUpdateView.as_view()),
    path('categories/<int:pk>/', EventCategoryCreateUpdateView.as_view()),
    path('timeslots/', TimeSlotCreateUpdateView.as_view()),
    path('timeslots/<int:pk>/', TimeSlotCreateUpdateView.as_view())
]
