import { useContext, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ConfirmProvider } from './context/ConfirmContext.tsx';

import { WelcomePage } from './pages/WelcomePage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';
import { SobreSgiPage } from './pages/SobreSgiPage.tsx';
import { ContactoPage } from './pages/ContactoPage.tsx';
import { NovedadesPage } from './pages/NovedadesPage.tsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.tsx';
import { DashboardContainer } from './pages/dashboards/DashboardContainer.tsx';
import { RoleDashboards } from './pages/dashboards/RoleDashboards.tsx';
import { Spinner } from './components/common/Spinner.tsx';
import MetricsReportsPage from './pages/dashboards/MetricsReportsPage.tsx';

import { ThesisTraceability } from './pages/thesis/ThesisTraceability.tsx';
import { ThesisPlansList } from './pages/thesis/ThesisPlansList.tsx';
import { NewThesisPlan } from './pages/thesis/NewThesisPlan.tsx';
import { ProjectMonitoring } from './pages/projects/ProjectMonitoring.tsx';
import { ProjectAudit } from './pages/projects/ProjectAudit.tsx';
import { ProjectsList } from './pages/projects/ProjectsList.tsx';
import { AssignReviewers } from './pages/projects/AssignReviewers.tsx';
import { EvaluationForm } from './pages/projects/EvaluationForm.tsx';
import { MyEvaluations } from './pages/evaluations/MyEvaluations.tsx';
import { ObservationsPanel } from './pages/observations/ObservationsPanel.tsx';
import { ReviewProgressReports } from './pages/progressreports/ReviewProgressReports.tsx';
import { ProgressReportHistory } from './pages/progressreports/ProgressReportHistory.tsx';
import { ConvocatoriasList } from './pages/convocatorias/ConvocatoriasList.tsx';
import { NewConvocatoria } from './pages/convocatorias/NewConvocatoria.tsx';

import { ConvocatoriasDashboard } from './modules/convocatorias/pages/ConvocatoriasDashboard.tsx';
import { NewProposalForm } from './modules/convocatorias/pages/NewProposalForm.tsx';
import { TramitesList } from './pages/tramites/TramitesList.tsx';
import { DecanoReview } from './pages/resolutions/DecanoReview.tsx';
import { NewResolutionForm } from './pages/resolutions/NewResolutionForm.tsx';

// Views del módulo Bandeja Lógica de Trámites y Subsanaciones
import { TramitesInbox } from './pages/tramites/TramitesInbox.tsx';
import { TramiteDetail } from './pages/tramites/TramiteDetail.tsx';
import { SubsanacionPanel } from './pages/observations/SubsanacionPanel.tsx';

// Admin Views
import { CreateUser } from './pages/users/CreateUser';
import { ActivateUsers } from './pages/admin/ActivateUsers.tsx';
import { ResearchLines } from './pages/admin/ResearchLines.tsx';
import { NewResearchLine } from './pages/admin/NewResearchLine.tsx';
import { ResearchLineDetail } from './pages/admin/ResearchLineDetail.tsx';
import { ResearchGroups } from './pages/admin/ResearchGroups.tsx';
import { NewResearchGroup } from './pages/admin/NewResearchGroup.tsx';
import { ResearchGroupDetail } from './pages/admin/ResearchGroupDetail.tsx';

const queryClient = new QueryClient();

// Componente para proteger las rutas privadas del sistema
interface ProtectedRouteProps {
  children: ReactNode;
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
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1rem',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Spinner size="large" />
        <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
          Restaurando sesión segura...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<PublicRoute><WelcomePage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/sobre-sgi" element={<SobreSgiPage />} />
                <Route path="/contacto" element={<ContactoPage />} />
                <Route path="/novedades" element={<NovedadesPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePasswordPage />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas Protegidas (Con Layout de Dashboard persistente) */}
                <Route element={<ProtectedRoute><DashboardContainer /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<RoleDashboards />} />
                  <Route path="/metrics" element={<MetricsReportsPage />} />

                  {/* Tesis */}
                  <Route path="/thesis/plans" element={<ThesisPlansList />} />
                  <Route path="/thesis/plan/:id" element={<ThesisTraceability />} />
                  <Route path="/thesis/new" element={<NewThesisPlan />} />

                  {/* Proyectos */}
                  <Route path="/projects" element={<ProjectsList />} />
                  <Route path="/projects/new" element={<NewProposalForm />} />
                  <Route path="/projects/assign" element={<AssignReviewers />} />
                  <Route path="/projects/evaluate" element={<EvaluationForm />} />
                  <Route path="/projects/:id" element={<ProjectMonitoring />} />
                  <Route path="/projects/audit" element={<ProjectAudit />} />

                  {/* Convocatorias */}
                  <Route path="/convocatorias" element={<ConvocatoriasList />} />
                  <Route path="/convocatorias/activas" element={<ConvocatoriasDashboard />} />
                  <Route path="/convocatorias/new" element={<NewConvocatoria />} />

                  {/* Evaluaciones y observaciones */}
                  <Route path="/evaluations/my-evaluations" element={<MyEvaluations />} />
                  <Route path="/observations/panel" element={<ObservationsPanel />} />
                  <Route path="/progressreports/review" element={<ReviewProgressReports />} />
                  <Route path="/progressreports/history" element={<ProgressReportHistory />} />

                  {/* Trámites y Resoluciones Decanato */}
                  <Route path="/tramites" element={<TramitesInbox />} />
                  <Route path="/tramites/:id" element={<TramiteDetail />} />
                  <Route path="/tramites/legacy" element={<TramitesList />} />
                  <Route path="/observations/subsanacion" element={<SubsanacionPanel />} />
                  <Route path="/decano/review" element={<DecanoReview />} />
                  <Route path="/resolutions/new" element={<NewResolutionForm />} />

                  {/* Administración */}
                  <Route path="/users/create" element={<CreateUser />} />
                  <Route path="/admin/activate" element={<ActivateUsers />} />
                  <Route path="/lines" element={<ResearchLines />} />
                  <Route path="/lines/new" element={<NewResearchLine />} />
                  <Route path="/lines/:id" element={<ResearchLineDetail />} />
                  <Route path="/groups" element={<ResearchGroups />} />
                  <Route path="/groups/new" element={<NewResearchGroup />} />
                  <Route path="/groups/:id" element={<ResearchGroupDetail />} />

                  {/* Rutas no implementadas dentro del Dashboard redirigen silenciosamente sin parpadear */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
