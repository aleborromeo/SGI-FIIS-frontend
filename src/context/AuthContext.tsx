import { createContext, useState, useEffect, type ReactNode } from 'react';

// TODO: Mover esta interfaz a src/types/index.ts en el futuro
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  roles: string[];
  currentRole: string | null;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  switchRole: (role: string) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRoles(parsedUser.roles || []);
        setCurrentRole(parsedUser.roles?.[0] || null);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData?: any) => {
    localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setRoles(userData.roles || []);
      setCurrentRole(userData.roles?.[0] || null);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
  };

  const switchRole = (role: string) => {
    if (roles.includes(role)) {
      setCurrentRole(role);
    }
  };

  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, roles, currentRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
