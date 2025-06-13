from django.urls import path
from .views import EventCategoryView, TimeSlotView

urlpatterns = [
    path('categories/', EventCategoryView.as_view()),
    path('categories/<int:pk>/', EventCategoryView.as_view()),
    path('timeslots/', TimeSlotView.as_view()),
    path('timeslots/<int:pk>/', TimeSlotView.as_view()),

]
