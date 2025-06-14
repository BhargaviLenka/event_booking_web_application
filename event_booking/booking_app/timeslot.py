# myapp/apps.py
from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'booking_app'

    def ready(self):
        print("MyAppConfig ready called")
        from .models import TimeSlot
        import datetime

        try:
            if TimeSlot.objects.count() == 0:
                predefined_slots = [
                    {"start": datetime.time(9, 0), "end": datetime.time(12, 0)},
                    {"start": datetime.time(12, 0), "end": datetime.time(3, 0)},
                    {"start": datetime.time(3, 0), "end": datetime.time(6, 0)},
                ]

                for slot in predefined_slots:
                    TimeSlot.objects.create(
                        start_time=slot["start"],
                        end_time=slot["end"]
                    )
                print("Time slots inserted successfully.")
        except (OperationalError, ProgrammingError):
            # Prevent failure during migrations before table creation
            pass
