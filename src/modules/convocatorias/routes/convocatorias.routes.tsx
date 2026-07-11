import { Route } from 'react-router-dom';
import { ConvocatoriasDashboard } from '../pages/ConvocatoriasDashboard';
import { NewProposalForm } from '../pages/NewProposalForm';

export const convocatoriasRoutes = (
  <>
    <Route path="/convocatorias/activas" element={<ConvocatoriasDashboard />} />
    <Route path="/projects/new" element={<NewProposalForm />} />
  </>
);
