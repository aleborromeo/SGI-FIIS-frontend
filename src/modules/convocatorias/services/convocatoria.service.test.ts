import { describe, it, expect } from 'vitest';
import { normalizeConvocatoria } from './convocatoria.service';

describe('convocatoria.service.normalizeConvocatoria', () => {
  it('retorna objeto vacio sin datos', () => {
    expect(normalizeConvocatoria(null)).toEqual({});
    expect(normalizeConvocatoria(undefined)).toEqual({});
  });

  it('mapea snake_case del backend', () => {
    const raw = {
      id_convocatoria: 5,
      titulo_convocatoria: 'Conv A',
      descripcion: 'D',
      fecha_inicio: '2026-03-01',
      fecha_fin: '2026-04-01',
      estado: 'FINALIZADA',
      poblacion_objetivo: 'ESTUDIANTES',
      researchLineIds: [3],
    };
    expect(normalizeConvocatoria(raw)).toEqual({
      id: 5,
      title: 'Conv A',
      description: 'D',
      startDate: '2026-03-01',
      endDate: '2026-04-01',
      status: 'FINALIZADA',
      targetAudience: 'ESTUDIANTES',
      researchLineIds: [3],
      documentId: undefined,
    });
  });

  it('aplica valores por defecto', () => {
    const n = normalizeConvocatoria({ id: 2 });
    expect(n.title).toBe('');
    expect(n.status).toBe('ABIERTA');
    expect(n.targetAudience).toBe('AMBOS');
    expect(n.researchLineIds).toEqual([]);
  });
});
