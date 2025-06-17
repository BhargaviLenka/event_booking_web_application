from django.urls import path
from .views import (EventCategoryView, TimeSlotView, EventAvailabilityView, UserBookingAPIView,
                    CheckSessionView, LoginView, RegisterView, LogoutView, MyBookingsView, get_csrf)


urlpatterns = [
    path('csrf/', get_csrf),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('check-session/', CheckSessionView.as_view()),
    path('categories/', EventCategoryView.as_view()),
    path('categories/<int:pk>/', EventCategoryView.as_view()),
    path('timeslots/', TimeSlotView.as_view()),
    path('availability/', EventAvailabilityView.as_view()),
    path('user-bookings/', UserBookingAPIView.as_view()),
    path('my-bookings/', MyBookingsView.as_view()),
    path('my-bookings/<int:pk>/', MyBookingsView.as_view()),

]
