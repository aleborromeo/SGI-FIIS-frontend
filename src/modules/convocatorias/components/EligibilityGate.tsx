import { useContext, type ReactNode } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import { useEligibility } from '../hooks/useEligibility';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { AuthContext } from '../../../context/AuthContext';

interface EligibilityGateProps {
  children: ReactNode;
}

export function EligibilityGate({ children }: EligibilityGateProps) {
  const { currentRole } = useContext(AuthContext);
  const { data: eligibility, isLoading: loadingElig } = useEligibility();
  const { data: convocatorias, isLoading: loadingCalls } = useConvocatorias();

  const loading = loadingElig || loadingCalls;

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Verificando requisitos...
        </Typography>
      </Box>
    );
  }

  const hasActiveGroup = eligibility?.hasActiveGroup ?? false;
  const hasVigentCalls = (convocatorias?.length ?? 0) > 0;
  const isDocente = eligibility?.docente ?? false;
  const isEligibleRole = isDocente || currentRole === 'ESTUDIANTE';

  if (!hasActiveGroup || !hasVigentCalls || !isEligibleRole) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 4,
          border: '2px solid',
          borderColor: 'warning.light',
          borderRadius: 3,
          bgcolor: 'warning.50',
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <ShieldAlert size={56} style={{ color: '#d97706', marginBottom: '16px' }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.dark' }} gutterBottom>
          No habilitado para postular
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          No cumple con los requisitos necesarios para registrar un proyecto de investigación.
        </Typography>
        <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mt: 2, pl: 2 }}>
          {!isEligibleRole && (
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Solo los docentes investigadores o estudiantes/tesistas pueden registrar proyectos.
            </Typography>
          )}
          {!hasActiveGroup && (
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              No pertenece a un grupo de investigación activo.
            </Typography>
          )}
          {!hasVigentCalls && (
            <Typography component="li" variant="body2" color="text.secondary">
              No existen convocatorias abiertas actualmente.
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
