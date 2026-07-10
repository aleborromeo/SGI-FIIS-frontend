import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Box,
  Tooltip,
} from '@mui/material';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Convocatoria } from '../types/convocatoria.types';

interface ConvocatoriaCardProps {
  convocatoria: Convocatoria;
  eligible: boolean;
  onPostular: (convocatoria: Convocatoria) => void;
}

export function ConvocatoriaCard({ convocatoria, eligible, onPostular }: ConvocatoriaCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderColor: 'primary.main',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="caption" fontWeight={700} color="primary" letterSpacing={0.5}>
            CONV-{convocatoria.id}
          </Typography>
          <Chip label="ABIERTA" color="success" size="small" variant="filled" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3 }}>
          {convocatoria.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {convocatoria.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Calendar size={14} style={{ color: 'var(--text-secondary, #666)' }} />
            <Typography variant="caption" color="text.secondary">
              Inicio: <strong style={{ color: 'var(--on-surface)' }}>{convocatoria.startDate}</strong>
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Cierre: <strong style={{ color: 'var(--on-surface)' }}>{convocatoria.endDate}</strong>
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        {eligible ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<ExternalLink size={18} />}
            onClick={() => onPostular(convocatoria)}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Postular Proyecto
          </Button>
        ) : (
          <Tooltip title="No pertenece a un grupo de investigación activo">
            <span style={{ width: '100%' }}>
              <Button fullWidth variant="outlined" disabled sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>
                Postular Proyecto
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
