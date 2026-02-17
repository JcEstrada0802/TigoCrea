import { Navigate } from 'react-router-dom';
import { useAuth } from '../authComponents/UseAuth';
import { useState } from 'react';

const ProtectedRoute = ({ children, allowedGroups }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 1. Mientras carga la sesión
  if (isLoading) return <div>Cargando...</div>;

  // 2. Si no está logueado, a la fuerza al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 3. Si es Superusuario, tiene pase VIP a donde sea
  if (user?.is_superuser) return children;

  // 4. Si la ruta tiene restricciones de grupo (como Catálogo o Programación)
  if (allowedGroups) {
    const hasPermission = user?.groups?.some(group => allowedGroups.includes(group));

    if (!hasPermission) {
      const homePages = {
        "AdLogger": "/catalogo",
        "OnAirLogger": "/programacion",
        "SallerLogger": "/catalogo",
        "Viewer": "/reporteria"
      };

      const userGroupWithHome = user?.groups?.find(group => homePages[group]);
      const redirectPath = userGroupWithHome ? homePages[userGroupWithHome] : "/reporteria";
      
      return <Navigate to={redirectPath} replace />;
    }
  }

  // 5. SI NO HAY allowedGroups (caso de /perfil), simplemente deja pasar
  // Porque ya sabemos que está autenticado por el paso #2
  return children;
};

export default ProtectedRoute;