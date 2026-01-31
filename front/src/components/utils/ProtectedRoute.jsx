import { Navigate } from 'react-router-dom';
import { useAuth } from '../authComponents/UseAuth';

const ProtectedRoute = ({ children, allowedGroups }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si pasamos una lista de grupos permitidos
  if (allowedGroups) {
    // .some devuelve true si AL MENOS UN grupo del usuario está en la lista de permitidos
    const hasPermission = user?.groups?.some(group => allowedGroups.includes(group));

    if (!hasPermission) {
      // Si NO tiene ninguno de los permisos, rebote a reportería
      return <Navigate to="/reporteria" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;