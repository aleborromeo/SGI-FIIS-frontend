import { Alert, AlertTitle, Stack } from '@mui/material';
import { Info } from 'lucide-react';

interface EligibilityWarningProps {
  hasActiveGroup: boolean;
  hasVigentCalls: boolean;
}

export function EligibilityWarning({ hasActiveGroup, hasVigentCalls }: EligibilityWarningProps) {
  if (hasActiveGroup && hasVigentCalls) return null;

  return (
    <Alert severity="warning" icon={<Info />} sx={{ borderRadius: 2, mb: 3 }}>
      <AlertTitle>No habilitado para postular</AlertTitle>
      <Stack component="ul" sx={{ pl: 2, m: 0 }}>
        {!hasActiveGroup && (
          <li>
            No pertenece actualmente a ningún grupo de investigación activo. Debe pertenecer a un grupo para registrar proyectos.
          </li>
        )}
        {!hasVigentCalls && (
          <li>
            No existen convocatorias abiertas y vigentes dentro del rango de fechas permitido.
          </li>
        )}
      </Stack>
    </Alert>
  );
}
