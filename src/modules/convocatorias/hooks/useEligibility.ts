import { useQuery } from '@tanstack/react-query';
import { convocatoriaService } from '../services/convocatoria.service';

export function useEligibility() {
  return useQuery({
    queryKey: ['convocatorias', 'eligibility'],
    queryFn: convocatoriaService.checkEligibility,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
