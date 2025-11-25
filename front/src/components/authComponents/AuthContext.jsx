import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  user: null, // Información del usuario (ej: {id, username})
  token: null,
  login: () => {}, // Función para iniciar sesión
  logout: () => {}, // Función para cerrar sesión
  isAuthenticated: false, // Estado de autenticación
  isLoading: true, // Para la carga inicial
});

const API_URL = import.meta.env.VITE_API_URL; // Tu URL base de Django

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };
  
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.post(`${API_URL}/reporteria/getUserContext/`,{}, { 
            headers: {
              'Authorization': `Token ${token}`
            }
          });
          setUser(response.data);
        } catch (error) {
          console.error("Token inválido o expirado:", error);
          logout(); 
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};