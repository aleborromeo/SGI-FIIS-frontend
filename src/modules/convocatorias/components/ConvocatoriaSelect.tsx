import { Controller, type Control, type FieldError } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import type { Convocatoria } from '../types/convocatoria.types';

interface ConvocatoriaSelectProps {
  control: Control<any>;
  convocatorias: Convocatoria[];
  error?: FieldError;
  disabled?: boolean;
}

export function ConvocatoriaSelect({ control, convocatorias, error, disabled }: ConvocatoriaSelectProps) {
  return (
    <Controller
      name="convocatoriaId"
      control={control}
      rules={{ required: 'Selecciona una convocatoria' }}
      render={({ field }) => (
        <FormControl fullWidth error={!!error} disabled={disabled}>
          <InputLabel id="convocatoria-label">Convocatoria *</InputLabel>
          <Select
            labelId="convocatoria-label"
            label="Convocatoria *"
            {...field}
          >
            <MenuItem value="">
              <em>Selecciona una convocatoria...</em>
            </MenuItem>
            {convocatorias.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.title} — hasta {c.endDate}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
