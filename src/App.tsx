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
import { NewProgressReport } from './pages/progressreports/NewProgressReport.tsx';
import { AmendProgressReport } from './pages/progressreports/AmendProgressReport.tsx';
import { NewThesisReport } from './pages/thesis/NewThesisReport.tsx';
import { DirectorEvaluations } from './pages/evaluations/DirectorEvaluations.tsx';
import { ConvocatoriasList } from './pages/convocatorias/ConvocatoriasList.tsx';
import { NewConvocatoria } from './pages/convocatorias/NewConvocatoria.tsx';
import { EditConvocatoria } from './pages/convocatorias/EditConvocatoria.tsx';

import { ConvocatoriasDashboard } from './modules/convocatorias/pages/ConvocatoriasDashboard.tsx';
import { NewProposalForm } from './modules/convocatorias/pages/NewProposalForm.tsx';
import { TramitesList } from './pages/tramites/TramitesList.tsx';
import { DecanoReview } from './pages/resolutions/DecanoReview.tsx';
import { NewResolutionForm } from './pages/resolutions/NewResolutionForm.tsx';

// Views del módulo Bandeja Lógica de Trámites y Subsanaciones
import { TramitesInbox } from './pages/tramites/TramitesInbox.tsx';
import { TramiteDetail } from './pages/tramites/TramiteDetail.tsx';
import { SubsanacionPanel } from './pages/observations/SubsanacionPanel.tsx';

// Views del módulo Gestión Documental y Resoluciones
import { DocumentsPage } from './pages/documents/DocumentsPage.tsx';
import { ResolutionsPage } from './pages/resolutions/ResolutionsPage.tsx';

// Admin Views
import { CreateUser } from './pages/users/CreateUser';
import { UserManagement } from './pages/admin/UserManagement.tsx';
import { ResearchLines } from './pages/admin/ResearchLines.tsx';
import { NewResearchLine } from './pages/admin/NewResearchLine.tsx';
import { ResearchLineDetail } from './pages/admin/ResearchLineDetail.tsx';
import { ResearchGroups } from './pages/admin/ResearchGroups.tsx';
import { NewResearchGroup } from './pages/admin/NewResearchGroup.tsx';
import { EditResearchGroup } from './pages/admin/EditResearchGroup.tsx';
import { ResearchGroupDetail } from './pages/admin/ResearchGroupDetail.tsx';

// Auditoría
import { AuditTrail } from './pages/audit/AuditTrail.tsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.tsx';

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
                  <Route path="/metrics" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'DIRECTOR_INVESTIGACION']}>
                      <MetricsReportsPage />
                    </RoleProtectedRoute>
                  } />

                  {/* Tesis */}
                  <Route path="/thesis/plans" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO']}>
                      <ThesisPlansList />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/thesis/plan/:id" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO']}>
                      <ThesisTraceability />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/thesis/new" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <NewThesisPlan />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/thesis/report/new/:planId" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <NewThesisReport />
                    </RoleProtectedRoute>
                  } />

                  {/* Proyectos */}
                  <Route path="/projects" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'EVALUADOR']}>
                      <ProjectsList />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/projects/new" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR', 'ESTUDIANTE']}>
                      <NewProposalForm />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/projects/assign" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION']}>
                      <AssignReviewers />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/projects/evaluate" element={
                    <RoleProtectedRoute allowedRoles={['EVALUADOR']}>
                      <EvaluationForm />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/projects/:id" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'EVALUADOR']}>
                      <ProjectMonitoring />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/projects/audit" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'DIRECTOR_INVESTIGACION', 'DECANO']}>
                      <ProjectAudit />
                    </RoleProtectedRoute>
                  } />

                  {/* Convocatorias */}
                  <Route path="/convocatorias" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION']}>
                      <ConvocatoriasList />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/convocatorias/activas" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'DOCENTE_INVESTIGADOR']}>
                      <ConvocatoriasDashboard />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/convocatorias/new" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION']}>
                      <NewConvocatoria />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/convocatorias/:id/edit" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION']}>
                      <EditConvocatoria />
                    </RoleProtectedRoute>
                  } />

                  {/* Evaluaciones y observaciones */}
                  <Route path="/evaluations/my-evaluations" element={
                    <RoleProtectedRoute allowedRoles={['EVALUADOR']}>
                      <MyEvaluations />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/evaluations/director" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION']}>
                      <DirectorEvaluations />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/observations/panel" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'DOCENTE_INVESTIGADOR']}>
                      <ObservationsPanel />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/progressreports/review" element={
                    <RoleProtectedRoute allowedRoles={['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION']}>
                      <ReviewProgressReports />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/progressreports/history" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR']}>
                      <ProgressReportHistory />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/progressreports/new" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR']}>
                      <NewProgressReport />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/progressreports/amend/:id" element={
                    <RoleProtectedRoute allowedRoles={['DOCENTE_INVESTIGADOR']}>
                      <AmendProgressReport />
                    </RoleProtectedRoute>
                  } />

                  {/* Trámites y Resoluciones Decanato */}
                  <Route path="/tramites" element={
                    <RoleProtectedRoute allowedRoles={['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'DOCENTE_INVESTIGADOR', 'ESTUDIANTE']}>
                      <TramitesInbox />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/tramites/:id" element={
                    <RoleProtectedRoute allowedRoles={['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'DOCENTE_INVESTIGADOR', 'ESTUDIANTE']}>
                      <TramiteDetail />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/tramites/legacy" element={
                    <RoleProtectedRoute allowedRoles={['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO']}>
                      <TramitesList />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/observations/subsanacion" element={
                    <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'DOCENTE_INVESTIGADOR']}>
                      <SubsanacionPanel />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/decano/review" element={
                    <RoleProtectedRoute allowedRoles={['DECANO']}>
                      <DecanoReview />
                    </RoleProtectedRoute>
                  } />

                  {/* Gestión Documental y Resoluciones */}
                  <Route path="/resolutions" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'DIRECTOR_INVESTIGACION', 'DECANO']}>
                      <ResolutionsPage />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/resolutions/new-legacy" element={
                    <RoleProtectedRoute allowedRoles={['DIRECTOR_INVESTIGACION', 'ADMIN']}>
                      <NewResolutionForm />
                    </RoleProtectedRoute>
                  } />

                  {/* Administración */}
                  <Route path="/users/create" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <CreateUser />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/documents" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'DIRECTOR_INVESTIGACION', 'COORDINADOR_GRUPO', 'DECANO', 'DOCENTE_INVESTIGADOR', 'ESTUDIANTE', 'EVALUADOR']}>
                      <DocumentsPage />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/admin/documents" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <DocumentRepository />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/audit" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'DIRECTOR_INVESTIGACION', 'COORDINADOR_GRUPO', 'DECANO']}>
                      <AuditTrail />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/lines" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <ResearchLines />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/lines/new" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <NewResearchLine />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/lines/:id" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <ResearchLineDetail />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/groups" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <ResearchGroups />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/groups/new" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <NewResearchGroup />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/groups/:id" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <ResearchGroupDetail />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/groups/:id/edit" element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <EditResearchGroup />
                    </RoleProtectedRoute>
                  } />

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
