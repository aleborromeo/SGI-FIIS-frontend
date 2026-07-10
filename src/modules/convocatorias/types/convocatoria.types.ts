export interface Convocatoria {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ABIERTA' | 'CERRADA' | 'FINALIZADA' | 'BORRADOR';
  researchLineIds: number[];
  documentId?: number;
}

export interface EligibilityResponse {
  hasActiveGroup: boolean;
  hasVigentCalls: boolean;
  docente: boolean;
  valid: boolean;
}

export interface ProposalFormData {
  convocatoriaId: string;
  researchGroupId: string;
  researchLineId: string;
  title: string;
  abstract: string;
  generalObjective: string;
  budget: string;
  startDate: string;
  endDate: string;
  executionPlace: string;
}
