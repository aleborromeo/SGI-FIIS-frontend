import { Box, Typography } from '@mui/material';
import { Calendar } from 'lucide-react';

export function ConvocatoriasEmpty() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'grey.50',
      }}
    >
      <Calendar size={48} style={{ color: '#bdbdbd', marginBottom: 8 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom>
        No existen convocatorias activas
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={360} mx="auto">
        Actualmente no existen convocatorias de investigación abiertas en la FIIS. Intente más tarde.
      </Typography>
    </Box>
  );
}
