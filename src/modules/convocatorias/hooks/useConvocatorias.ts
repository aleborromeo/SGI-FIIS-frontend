import { useQuery } from '@tanstack/react-query';
import { convocatoriaService } from '../services/convocatoria.service';

export function useConvocatorias() {
  return useQuery({
    queryKey: ['convocatorias', 'activas'],
    queryFn: convocatoriaService.getActivas,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
