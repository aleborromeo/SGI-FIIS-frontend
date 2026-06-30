import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { MainLayout } from './layout/MainLayout.tsx';

// Views
import { ThesisTraceability } from './pages/thesis/ThesisTraceability.tsx';
import { ProjectMonitoring } from './pages/projects/ProjectMonitoring.tsx';
import { ProjectAudit } from './pages/projects/ProjectAudit.tsx';
import { ProjectsList } from './pages/projects/ProjectsList.tsx';
import { NewProposal } from './pages/projects/NewProposal.tsx';
import { AssignReviewers } from './pages/projects/AssignReviewers.tsx';
import { EvaluationForm } from './pages/projects/EvaluationForm.tsx';

// New Screens
import { MyEvaluations } from './pages/evaluations/MyEvaluations.tsx';
import { ObservationsPanel } from './pages/observations/ObservationsPanel.tsx';
import { ReviewProgressReports } from './pages/progressreports/ReviewProgressReports.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <h1 className="text-headline-lg">Bienvenido al Dashboard</h1>
                <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Selecciona una opción del menú lateral para comenzar.</p>
              </div>
            </MainLayout>
          } />
          
          <Route path="/thesis/traceability" element={
            <MainLayout>
              <ThesisTraceability />
            </MainLayout>
          } />

          <Route path="/projects" element={
            <MainLayout>
              <ProjectsList />
            </MainLayout>
          } />

          <Route path="/projects/new" element={
            <MainLayout>
              <NewProposal />
            </MainLayout>
          } />

          <Route path="/projects/assign" element={
            <MainLayout>
              <AssignReviewers />
            </MainLayout>
          } />

          <Route path="/projects/evaluate" element={
            <MainLayout>
              <EvaluationForm />
            </MainLayout>
          } />

          <Route path="/projects/monitoring" element={
            <MainLayout>
              <ProjectMonitoring />
            </MainLayout>
          } />

          <Route path="/projects/audit" element={
            <MainLayout>
              <ProjectAudit />
            </MainLayout>
          } />

          <Route path="/evaluations/my-evaluations" element={
            <MainLayout>
              <MyEvaluations />
            </MainLayout>
          } />

          <Route path="/observations/panel" element={
            <MainLayout>
              <ObservationsPanel />
            </MainLayout>
          } />

          <Route path="/progressreports/review" element={
            <MainLayout>
              <ReviewProgressReports />
            </MainLayout>
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
