from django.db import models

# Create your models here.

class Score(models.Model):     # It is models.Model
    username = models.CharField(max_length=100, default="Guest")
    wpm = models.IntegerField()
    accuracy = models.IntegerField()
    date_saved = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.wpm} WPM"