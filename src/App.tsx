import { useContext, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';

import { WelcomePage } from './pages/WelcomePage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { DashboardContainer } from './pages/dashboards/DashboardContainer.tsx';
import { RoleDashboards } from './pages/dashboards/RoleDashboards.tsx';
import { Spinner } from './components/common/Spinner.tsx';

import DashboardPage from './pages/dashboards/DashboardPage.tsx';
import PendingProceduresPage from './pages/dashboards/PendingProceduresPage.tsx';
import AnalyticsDashboardPage from './pages/dashboards/AnalyticsDashboardPage.tsx';
import ReportsDashboardPage from './pages/dashboards/ReportsDashboardPage.tsx';
import PublicationsDashboardPage from './pages/dashboards/PublicationsDashboardPage.tsx';
import FinancingDashboardPage from './pages/dashboards/FinancingDashboardPage.tsx';
import RankingDashboardPage from './pages/dashboards/RankingDashboardPage.tsx';
import ResearchersDashboardPage from './pages/dashboards/ResearchersDashboardPage.tsx';

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

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard general según rol */}
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

          {/* Módulo Panel Isomorfo y Dashboards */}
          <Route
            path="/dashboards"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/tramites"
            element={
              <ProtectedRoute>
                <PendingProceduresPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/analisis"
            element={
              <ProtectedRoute>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/reportes"
            element={
              <ProtectedRoute>
                <ReportsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/publicaciones"
            element={
              <ProtectedRoute>
                <PublicationsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/financiamiento"
            element={
              <ProtectedRoute>
                <FinancingDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/ranking"
            element={
              <ProtectedRoute>
                <RankingDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards/investigadores"
            element={
              <ProtectedRoute>
                <ResearchersDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Vistas específicas de postulaciones y seguimiento */}
          <Route
            path="/thesis/plan/:id"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ThesisTraceability />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ProjectsList />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <NewProposal />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/assign"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <AssignReviewers />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/evaluate"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <EvaluationForm />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ProjectMonitoring />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/audit"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ProjectAudit />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluations/my-evaluations"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <MyEvaluations />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/observations/panel"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ObservationsPanel />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progressreports/review"
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <ReviewProgressReports />
                </DashboardContainer>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;