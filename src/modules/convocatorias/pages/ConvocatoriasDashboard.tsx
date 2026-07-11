import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Megaphone } from 'lucide-react';

import { AuthContext } from '../../../context/AuthContext';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useEligibility } from '../hooks/useEligibility';
import { ConvocatoriaCard } from '../components/ConvocatoriaCard';
import { ConvocatoriasSkeleton } from '../components/ConvocatoriasSkeleton';
import { ConvocatoriasEmpty } from '../components/ConvocatoriasEmpty';
import { EligibilityWarning } from '../components/EligibilityWarning';
import type { Convocatoria } from '../types/convocatoria.types';

export function ConvocatoriasDashboard() {
  const { currentRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: convocatorias, isLoading: loadingCalls, error: errorCalls } = useConvocatorias();
  const { data: eligibility, isLoading: loadingEligibility } = useEligibility();

  const handlePostular = (convocatoria: Convocatoria) => {
    navigate(`/projects/new?callId=${convocatoria.id}`);
  };

  if (currentRole !== 'DOCENTE_INVESTIGADOR') return null;

  const eligible = eligibility?.valid ?? false;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Megaphone sx={{ color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={700}>
          Convocatorias Vigentes
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Convocatorias de investigación abiertas para postulación de proyectos.
      </Typography>

      {!loadingEligibility && (
        <EligibilityWarning
          hasActiveGroup={eligibility?.hasActiveGroup ?? true}
          hasVigentCalls={eligibility?.hasVigentCalls ?? true}
        />
      )}

      {loadingCalls ? (
        <ConvocatoriasSkeleton />
      ) : errorCalls ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <AlertTitle>Error al cargar convocatorias</AlertTitle>
          No se pudieron cargar las convocatorias vigentes. Intente de nuevo más tarde.
        </Alert>
      ) : !convocatorias || convocatorias.length === 0 ? (
        <ConvocatoriasEmpty />
      ) : (
        <Grid container spacing={3}>
          {convocatorias.map((convocatoria) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={convocatoria.id}>
              <ConvocatoriaCard
                convocatoria={convocatoria}
                eligible={eligible}
                onPostular={handlePostular}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
