from django.db import models

# Create your models here.


class EventCategory(models.Model):
    name = models.CharField(max_length=256)

    class Meta:
        db_table = "event_category"
