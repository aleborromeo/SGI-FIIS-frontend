import { createContext, useState, type ReactNode } from 'react';

// TODO: Mover esta interfaz a src/types/index.ts en el futuro
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  roles: string[];
  currentRole: string | null;
  login: (token: string) => void;
  logout: () => void;
  switchRole: (role: string) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const login = (token: string) => {
    // TODO: Implementar decodificación del JWT y seteo de usuario
    console.log("Login con token:", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, roles, currentRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
