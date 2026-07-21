import { describe, it, expect } from 'vitest';
import { normalizeCall } from './callService';

describe('callService.normalizeCall', () => {
  it('retorna objeto vacio cuando no hay datos', () => {
    expect(normalizeCall(null)).toEqual({});
    expect(normalizeCall(undefined)).toEqual({});
  });

  it('mapea snake_case del backend a camelCase', () => {
    const raw = {
      id_convocatoria: 7,
      titulo_convocatoria: 'Convocatoria X',
      descripcion: 'Desc',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-02-01',
      estado: 'CERRADA',
      poblacion_objetivo: 'DOCENTES',
      researchLineIds: [1, 2],
    };
    expect(normalizeCall(raw)).toEqual({
      id: 7,
      title: 'Convocatoria X',
      description: 'Desc',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      status: 'CERRADA',
      targetAudience: 'DOCENTES',
      documentId: undefined,
      researchLineIds: [1, 2],
    });
  });

  it('prefiere snake_case id_convocatoria cuando ambos formatos existen', () => {
    const raw = {
      id: 3,
      id_convocatoria: 99,
      title: 'TitleC',
      titulo_convocatoria: 'TitleS',
      status: 'ABIERTA',
    };
    const n = normalizeCall(raw);
    expect(n.id).toBe(99);
    expect(n.title).toBe('TitleS');
  });

  it('aplica valores por defecto para campos faltantes', () => {
    const n = normalizeCall({ id: 1 });
    expect(n.title).toBe('');
    expect(n.description).toBe('');
    expect(n.startDate).toBe('');
    expect(n.endDate).toBe('');
    expect(n.status).toBe('ABIERTA');
    expect(n.targetAudience).toBe('AMBOS');
    expect(n.researchLineIds).toEqual([]);
  });

  it('convierte id a numero', () => {
    expect(normalizeCall({ id_convocatoria: '12' }).id).toBe(12);
  });
});
