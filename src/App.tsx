import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ConfirmProvider } from './context/ConfirmContext.tsx';
import { WelcomePage } from './pages/WelcomePage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { DashboardContainer } from './pages/dashboards/DashboardContainer.tsx';
import { RoleDashboards } from './pages/dashboards/RoleDashboards.tsx';
import { Spinner } from './components/common/Spinner.tsx';

// Views from feature/postulaciones
import { ThesisTraceability } from './pages/thesis/ThesisTraceability.tsx';
import { ProjectMonitoring } from './pages/projects/ProjectMonitoring.tsx';
import { ProjectAudit } from './pages/projects/ProjectAudit.tsx';
import { ProjectsList } from './pages/projects/ProjectsList.tsx';
import { NewProposal } from './pages/projects/NewProposal.tsx';
import { AssignReviewers } from './pages/projects/AssignReviewers.tsx';
import { EvaluationForm } from './pages/projects/EvaluationForm.tsx';
import { MyEvaluations } from './pages/evaluations/MyEvaluations.tsx';
import { ObservationsPanel } from './pages/observations/ObservationsPanel.tsx';
import { ReviewProgressReports } from './pages/progressreports/ReviewProgressReports.tsx';

// Admin Views
import { ResearchLines } from './pages/admin/ResearchLines.tsx';
import { NewResearchLine } from './pages/admin/NewResearchLine.tsx';
import { ResearchLineDetail } from './pages/admin/ResearchLineDetail.tsx';
import { ResearchGroups } from './pages/admin/ResearchGroups.tsx';
import { NewResearchGroup } from './pages/admin/NewResearchGroup.tsx';
import { ResearchGroupDetail } from './pages/admin/ResearchGroupDetail.tsx';

// Componente para proteger las rutas privadas del sistema
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: ProtectedRouteProps) => {
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
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


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

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
          {/* Ruta raíz (Página de Bienvenida) */}
          <Route path="/" element={<PublicRoute><WelcomePage /></PublicRoute>} />

          {/* Ruta de Login (Pública) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Ruta de Registro (Pública) */}
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Rutas Protegidas (Con Layout de Dashboard persistente) */}
          <Route element={<ProtectedRoute><DashboardContainer /></ProtectedRoute>}>
            <Route path="/dashboard" element={<RoleDashboards />} />
            
            {/* Vistas específicas de postulaciones y seguimiento */}
            <Route path="/thesis/plan/:id" element={<ThesisTraceability />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<NewProposal />} />
            <Route path="/projects/assign" element={<AssignReviewers />} />
            <Route path="/projects/evaluate" element={<EvaluationForm />} />
            <Route path="/projects/:id" element={<ProjectMonitoring />} />
            <Route path="/projects/audit" element={<ProjectAudit />} />
            <Route path="/evaluations/my-evaluations" element={<MyEvaluations />} />
            <Route path="/observations/panel" element={<ObservationsPanel />} />
            <Route path="/progressreports/review" element={<ReviewProgressReports />} />
            
            {/* Vistas de Administración */}
            <Route path="/lines" element={<ResearchLines />} />
            <Route path="/lines/new" element={<NewResearchLine />} />
            <Route path="/lines/:id" element={<ResearchLineDetail />} />
            <Route path="/groups" element={<ResearchGroups />} />
            <Route path="/groups/new" element={<NewResearchGroup />} />
            <Route path="/groups/:id" element={<ResearchGroupDetail />} />
            
            {/* Rutas no implementadas dentro del Dashboard redirigen silenciosamente sin parpadear */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Redirección por defecto para cualquier ruta inválida */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
