import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { DashboardContainer } from './pages/dashboards/DashboardContainer.tsx';
import { RoleDashboards } from './pages/dashboards/RoleDashboards.tsx';
import { Spinner } from './components/common/Spinner.tsx';
import { useContext } from 'react';

// Componente para proteger las rutas privadas del sistema
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <Spinner size="large" />
        <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
          Restaurando sesión segura...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para redirigir la ruta raíz según el estado de autenticación
const RootRouteRedirect = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa' 
      }}>
        <Spinner size="large" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta raíz redirige dinámicamente */}
          <Route path="/" element={<RootRouteRedirect />} />

          {/* Ruta de Login (Pública) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas de Administración e Investigación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <RoleDashboards />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />

          {/* Redirección por defecto para cualquier ruta inválida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
