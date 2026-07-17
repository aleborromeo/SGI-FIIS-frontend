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
        borderColor: 'rgba(0, 32, 69, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 30px rgba(0, 32, 69, 0.12)',
          borderColor: 'primary.main',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Premium accent top bar */}
      <Box 
        sx={{ 
          height: '6px', 
          background: 'linear-gradient(90deg, #1a365d 0%, #455f88 100%)', 
          width: '100%' 
        }} 
      />

      <CardContent sx={{ flex: 1, pb: 1, pt: 2.5, px: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{
              bgcolor: 'rgba(26, 54, 93, 0.06)',
              color: '#1a365d',
              fontWeight: 700,
              fontSize: '0.75rem',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              letterSpacing: 0.5,
            }}
          >
            CONV-{convocatoria.id}
          </Box>
          <Chip 
            label="ABIERTA" 
            size="small" 
            sx={{ 
              fontWeight: 700, 
              fontSize: '0.65rem', 
              bgcolor: '#e6f4ea', 
              color: '#137333',
              border: '1px solid #ceead6',
              borderRadius: '9999px',
            }} 
          />
        </Stack>

        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            lineHeight: 1.3, 
            color: '#002045',
            mb: 1.5,
            fontSize: '1.15rem'
          }}
        >
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
            mb: 3,
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {convocatoria.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            mt: 'auto',
            pt: 2,
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Calendar size={14} style={{ color: '#455f88' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Inicio:
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 600 }} color="text.primary">
              {convocatoria.startDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Calendar size={14} style={{ color: '#ba1a1a' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Cierre:
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 600 }} color="#ba1a1a">
              {convocatoria.endDate}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
        {eligible ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<ExternalLink size={16} />}
            onClick={() => onPostular(convocatoria)}
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              fontWeight: 600,
              py: 1,
              background: 'linear-gradient(135deg, #1a365d 0%, #002045 100%)',
              boxShadow: '0 4px 12px rgba(26, 54, 93, 0.2)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #2d4d7c 0%, #1a365d 100%)',
                boxShadow: '0 6px 16px rgba(26, 54, 93, 0.3)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Postular Proyecto
          </Button>
        ) : (
          <Tooltip title="No pertenece a un grupo de investigación activo">
            <span style={{ width: '100%' }}>
              <Button 
                fullWidth 
                variant="outlined" 
                disabled 
                sx={{ 
                  borderRadius: '10px', 
                  textTransform: 'none', 
                  fontWeight: 600,
                  py: 1,
                }}
              >
                Postular Proyecto
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
