import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('convocatorias');
  const { currentRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: convocatorias, isLoading: loadingCalls, error: errorCalls } = useConvocatorias();
  const { data: eligibility, isLoading: loadingEligibility } = useEligibility();

  const handlePostular = (convocatoria: Convocatoria) => {
    navigate(`/projects/new?callId=${convocatoria.id}`);
  };

  if (currentRole !== 'DOCENTE_INVESTIGADOR' && currentRole !== 'ESTUDIANTE') return null;

  const eligible = currentRole === 'ESTUDIANTE'
    ? (eligibility?.hasActiveGroup ?? false)
    : (eligibility?.valid ?? false);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Megaphone style={{ color: 'var(--primary)' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('dashboard.title')}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('dashboard.subtitle')}
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
          <AlertTitle>{t('dashboard.errorTitle')}</AlertTitle>
          {t('dashboard.errorMessage')}
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
