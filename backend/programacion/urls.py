from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('createBlockCat/', createBlockCat, name='createBlockCat'),
    path('createBlock/', createBlock, name='createBlock'),
    path('getProgCatalog/', getProgCatalog, name='getProgCatalog'),
    path('getTemplates/', getTemplates, name='getTemplates'),
    path('getCalendars/', getCalendars, name='getCalendars'),
    path('getEventsByCalendar/', getEventsByCalendar, name='getEventsByCalendar'),
    path('createEvent/', createEvent, name='createEvent'),
    path('bulkSave/', bulkSave, name='bulkSave'),
    path('updateEvent/<int:pk>/', updateEvent, name='updateEvent'),
    path('bulkUpdate/', bulkUpdate, name='bulkUpdate'),
    path('createTemplate/', createTemplate, name='createTemplate'),
    path('exportGridPDF/', exportGridPDF, name='exportGridPDF'),
    path('bulkDelete/', bulkDelete, name='bulkDelete'),
]