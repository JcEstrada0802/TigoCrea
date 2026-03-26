from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('createBlockCat/', createBlockCat, name='createBlockCat'),                     #CREATE
    path('createBlock/', createBlock, name='createBlock'),
    path('createEvent/', createEvent, name='createEvent'),
    path('createTemplate/', createTemplate, name='createTemplate'),
    path('getProgCatalog/', getProgCatalog, name='getProgCatalog'),                     #GET
    path('getTemplates/', getTemplates, name='getTemplates'),
    path('getCalendars/', getCalendars, name='getCalendars'),
    path('getEventsByCalendar/', getEventsByCalendar, name='getEventsByCalendar'),
    path('updateEvent/<int:pk>/', updateEvent, name='updateEvent'),                     #UPDATE
    path('updateBlock/<int:pk>/', updateBlock, name='updateBlock'),
    path('updateBlockCat/<int:pk>/', updateBlockCat, name='updateBlockCat'),
    path('bulkSave/', bulkSave, name='bulkSave'),
    path('bulkUpdate/', bulkUpdate, name='bulkUpdate'),
    path('bulkDelete/', bulkDelete, name='bulkDelete'),                                 #DELETE
    path('deleteBlockCat/<int:pk>/', deleteBlockCat, name='deleteBlockCat'),
    path('deleteBlock/<int:pk>/', deleteBlock, name='deleteBlock'),
    path('deleteEvent/<int:pk>/', deleteEvent, name='deleteEvent'),
    path('exportGridPDF/', exportGridPDF, name='exportGridPDF'),                        #EXPORT
    path('savePlaylist/', savePlaylist, name='savePlaylist'),
    path('getPlaylist/<int:pk>/', getPlaylist, name='getPlaylist'),
    path('exportPLaylist/', exportPlaylist, name='exportPlaylist'),
    path('getPlaylistCLF/', getPlaylistCLF, name='getPlaylistCLF'),
]