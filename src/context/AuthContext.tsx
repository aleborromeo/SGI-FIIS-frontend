import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginResponse } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  roles: string[];
  currentRole: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  switchRole: (role: string) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Intentar restaurar la sesión del usuario al cargar la aplicación
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('sgi_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Validar token y traer perfil actual del backend
        const profile = await authService.getProfile();
        const role = profile.rolPrincipal.codigoRol;
        
        const userData = {
          id: profile.id,
          email: profile.correoInstitucional,
          firstNames: profile.nombres,
          lastNames: profile.apellidos,
          roleCode: role,
        };

        setUser(userData);
        setRoles([role]);
        setCurrentRole(role);
        setIsAuthenticated(true);
        localStorage.setItem('sgi_user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error al restaurar sesión:', err);
        // Si el token es inválido o el servidor está caído, limpiar datos locales obsoletos
        localStorage.removeItem('sgi_token');
        localStorage.removeItem('sgi_user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      // Guardar token JWT en localStorage
      localStorage.setItem('sgi_token', response.token);
      
      const userData = {
        email: response.email,
        firstNames: response.firstNames,
        lastNames: response.lastNames,
        roleCode: response.roleCode,
      };
      
      // Guardar información del usuario
      localStorage.setItem('sgi_user', JSON.stringify(userData));
      
      setUser(userData);
      setRoles([response.roleCode]);
      setCurrentRole(response.roleCode);
      setIsAuthenticated(true);
      
      return response;
    } catch (err: any) {
      const msg = err.message || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sgi_token');
    localStorage.removeItem('sgi_user');
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
    setError(null);
  };

  const switchRole = (role: string) => {
    if (roles.includes(role)) {
      setCurrentRole(role);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      roles,
      currentRole,
      loading,
      error,
      login,
      logout,
      switchRole,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
