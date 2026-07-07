import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import DashboardPage from './pages/dashboards/DashboardPage.tsx';
import PendingProceduresPage from './pages/dashboards/PendingProceduresPage.tsx';
import AnalyticsDashboardPage from './pages/dashboards/AnalyticsDashboardPage.tsx';
import ReportsDashboardPage from './pages/dashboards/ReportsDashboardPage.tsx';
import PublicationsDashboardPage from './pages/dashboards/PublicationsDashboardPage.tsx';
import FinancingDashboardPage from './pages/dashboards/FinancingDashboardPage.tsx';
import RankingDashboardPage from './pages/dashboards/RankingDashboardPage.tsx';
import ResearchersDashboardPage from './pages/dashboards/ResearchersDashboardPage.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboards" replace />} />
          <Route path="/dashboards" element={<DashboardPage />} />
          <Route path="/dashboards/tramites" element={<PendingProceduresPage />} />
          <Route path="/dashboards/analisis" element={<AnalyticsDashboardPage />} />
          <Route path="/dashboards/reportes" element={<ReportsDashboardPage />} />
          <Route path="/dashboards/publicaciones" element={<PublicationsDashboardPage />} />
          <Route path="/dashboards/financiamiento" element={<FinancingDashboardPage />} />
          <Route path="/dashboards/ranking" element={<RankingDashboardPage />} />
          <Route path="/dashboards/investigadores" element={<ResearchersDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;