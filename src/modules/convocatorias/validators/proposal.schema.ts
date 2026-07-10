export const PROPOSAL_FIELD_LABELS: Record<string, string> = {
  convocatoriaId: 'Convocatoria',
  researchGroupId: 'Grupo de Investigación',
  researchLineId: 'Línea de Investigación',
  title: 'Título del Proyecto',
  abstract: 'Resumen',
  generalObjective: 'Objetivo General',
  budget: 'Presupuesto',
  startDate: 'Fecha de Inicio',
  endDate: 'Fecha de Fin',
  executionPlace: 'Lugar de Ejecución',
};

export function validateProposalForm(data: Record<string, string>): string | null {
  if (!data.convocatoriaId) return 'Selecciona una convocatoria.';
  if (!data.researchGroupId) return 'Selecciona un grupo de investigación.';
  if (!data.researchLineId) return 'Selecciona una línea de investigación.';
  if (data.title.trim().length < 5) return 'El título debe tener al menos 5 caracteres.';
  if (data.abstract.trim().length < 10) return 'El resumen debe tener al menos 10 caracteres.';
  if (data.generalObjective.trim().length < 10) return 'El objetivo general debe tener al menos 10 caracteres.';
  if (!data.startDate || !data.endDate) return 'Registra la fecha de inicio y fin.';
  if (new Date(data.endDate) < new Date(data.startDate)) return 'La fecha de fin no puede ser anterior a la de inicio.';
  if (!data.budget || isNaN(Number(data.budget)) || Number(data.budget) <= 0) return 'El presupuesto debe ser un número mayor a 0.';
  if (!data.executionPlace.trim()) return 'Ingresa el lugar de ejecución.';
  return null;
}
