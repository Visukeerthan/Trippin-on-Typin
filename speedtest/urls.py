from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('save-score/', views.save_score, name='save_score'),
]