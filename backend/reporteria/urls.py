from . import views 
from django.urls import path 
from rest_framework.authtoken.views import obtain_auth_token 
from .views import getSystems, crearReporte, getReports, logout, getReport, getReportDetail, exportReportPDF, getUserContext, updateReport


urlpatterns = [ path('api-token-auth/', obtain_auth_token, name='api_token_auth'), 
                path('logout/', logout, name='logout'),
                path('getUserContext/', getUserContext, name='user-context'),
                path('getSystems/', getSystems, name='getSystems' ), 
                path('createReport/', crearReporte, name='CreateReport'), 
                path('getReports/', getReports, name="getReports"),
                path('getReport/<int:report_id>/', getReport, name='getReportDetail'), 
                path('getReportDetail/<int:report_id>/', getReportDetail, name='getReportDetail'), 
                path('exportReport/', exportReportPDF, name='export-report'),
                path('updateReport/<int:report_id>/', updateReport, name='update-report')]
