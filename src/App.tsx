import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';
import { MainLayout } from './layout/MainLayout.tsx';

// Views
import { ThesisTraceability } from './pages/thesis/ThesisTraceability.tsx';
import { ProjectMonitoring } from './pages/projects/ProjectMonitoring.tsx';
import { ProjectAudit } from './pages/projects/ProjectAudit.tsx';
import { ProjectsList } from './pages/projects/ProjectsList.tsx';
import { NewProposal } from './pages/projects/NewProposal.tsx';
import { AssignReviewers } from './pages/projects/AssignReviewers.tsx';
import { EvaluationForm } from './pages/projects/EvaluationForm.tsx';
import { Login } from './pages/auth/Login.tsx';

// New Screens
import { MyEvaluations } from './pages/evaluations/MyEvaluations.tsx';
import { ObservationsPanel } from './pages/observations/ObservationsPanel.tsx';
import { ReviewProgressReports } from './pages/progressreports/ReviewProgressReports.tsx';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <h1 className="text-headline-lg">Bienvenido al Dashboard</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Selecciona una opción del menú lateral para comenzar.</p>
        </div>
      </MainLayout></ProtectedRoute>} />
      
      <Route path="/thesis/plan/:id" element={<ProtectedRoute><MainLayout><ThesisTraceability /></MainLayout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><MainLayout><ProjectsList /></MainLayout></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><MainLayout><NewProposal /></MainLayout></ProtectedRoute>} />
      <Route path="/projects/assign" element={<ProtectedRoute><MainLayout><AssignReviewers /></MainLayout></ProtectedRoute>} />
      <Route path="/projects/evaluate" element={<ProtectedRoute><MainLayout><EvaluationForm /></MainLayout></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><MainLayout><ProjectMonitoring /></MainLayout></ProtectedRoute>} />
      <Route path="/projects/audit" element={<ProtectedRoute><MainLayout><ProjectAudit /></MainLayout></ProtectedRoute>} />
      <Route path="/evaluations/my-evaluations" element={<ProtectedRoute><MainLayout><MyEvaluations /></MainLayout></ProtectedRoute>} />
      <Route path="/observations/panel" element={<ProtectedRoute><MainLayout><ObservationsPanel /></MainLayout></ProtectedRoute>} />
      <Route path="/progressreports/review" element={<ProtectedRoute><MainLayout><ReviewProgressReports /></MainLayout></ProtectedRoute>} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
