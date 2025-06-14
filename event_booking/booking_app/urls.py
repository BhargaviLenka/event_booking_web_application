from django.urls import path
from .views import EventCategoryView, TimeSlotView, EventAvailabilityCreateView, CheckSessionView, LoginView, \
    RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('check-session/', CheckSessionView.as_view()),
    path('categories/', EventCategoryView.as_view()),
    path('categories/<int:pk>/', EventCategoryView.as_view()),
    path('timeslots/', TimeSlotView.as_view()),
    path('timeslots/<int:pk>/', TimeSlotView.as_view()),
    path('availability/', EventAvailabilityCreateView.as_view()),


]
