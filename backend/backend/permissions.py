from rest_framework import permissions

class IsAdLogger(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='AdLogger').exists()

class IsOnAirLogger(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='OnAirLogger').exists()

class IsSallerLogger(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='SallerLogger').exists()

class IsViewer(permissions.BasePermission):
    def has_permission(self, request, view):
        # El Viewer suele ser solo lectura, pero aquí definimos si pertenece al grupo
        return request.user.groups.filter(name='Viewer').exists()