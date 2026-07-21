import { describe, it, expect } from 'vitest';
import {
  toFrontendStatus,
  toBackendStatus,
  mapResponseToReport,
  mapResponseToDetail,
} from './progressReportService';
import type { ProgressReportDetail } from './progressReportService';

describe('progressReportService mappers', () => {
  describe('toFrontendStatus', () => {
    it('mapea estados del backend a frontend', () => {
      expect(toFrontendStatus('PENDING')).toBe('PENDIENTE');
      expect(toFrontendStatus('UNDER_REVIEW')).toBe('EN_REVISION');
      expect(toFrontendStatus('OBSERVED')).toBe('OBSERVADO');
      expect(toFrontendStatus('APPROVED')).toBe('APROBADO');
      expect(toFrontendStatus('REJECTED')).toBe('RECHAZADO');
    });
    it('retorna PENDIENTE para estados desconocidos', () => {
      expect(toFrontendStatus('X')).toBe('PENDIENTE');
    });
  });

  describe('toBackendStatus', () => {
    it('mapea estados del frontend a backend', () => {
      expect(toBackendStatus('PENDIENTE')).toBe('PENDING');
      expect(toBackendStatus('EN_REVISION')).toBe('UNDER_REVIEW');
      expect(toBackendStatus('OBSERVADO')).toBe('OBSERVED');
      expect(toBackendStatus('APROBADO')).toBe('APPROVED');
      expect(toBackendStatus('RECHAZADO')).toBe('REJECTED');
    });
    it('retorna el mismo valor para estados no mapeados', () => {
      expect(toBackendStatus('OTRO')).toBe('OTRO');
    });
  });

  describe('mapResponseToReport', () => {
    it('mapea una respuesta basica', () => {
      const r = mapResponseToReport({
        id: 10,
        projectId: 4,
        responsibleName: 'Docente',
        registrationDate: '2026-01-01',
        progressPercentage: 50,
        reportStatus: 'APPROVED',
        achievements: 'Bien',
        difficulties: 'Poco',
        period: '2026-I',
      });
      expect(r.id).toBe(10);
      expect(r.reportNumber).toBe(10);
      expect(r.projectId).toBe(4);
      expect(r.projectTitle).toBe('Proyecto #4');
      expect(r.responsibleName).toBe('Docente');
      expect(r.reportDate).toBe('2026-01-01');
      expect(r.physicalProgress).toBe(50);
      expect(r.financialProgress).toBe(50);
      expect(r.status).toBe('APROBADO');
      expect(r.observations).toBe('Logros: Bien. Dificultades: Poco');
      expect(r.period).toBe('2026-I');
    });

    it('usa valores por defecto para campos faltantes', () => {
      const r = mapResponseToReport({ id: 1, projectId: 1 });
      expect(r.physicalProgress).toBe(0);
      expect(r.financialProgress).toBe(0);
      expect(r.status).toBe('PENDIENTE');
      expect(r.responsibleName).toBe('Docente Investigador');
      expect(r.observations).toBeUndefined();
    });

    it('combina projectTitle cuando existe', () => {
      const r = mapResponseToReport({ id: 1, projectId: 1, projectTitle: 'Proy X' });
      expect(r.projectTitle).toBe('Proy X');
    });
  });

  describe('mapResponseToDetail', () => {
    it('construye actividades, evidencias, comentarios e historial', () => {
      const raw = {
        id: 2,
        projectId: 9,
        registrationDate: '2026-02-01',
        lastUpdatedDate: '2026-02-10',
        progressPercentage: 80,
        reportStatus: 'OBSERVED',
        period: '2026-I',
        attachedDocumentId: 55,
        observations: 'Revisar',
        executedActivities: [{ id: 1, description: 'A', startDate: 's', endDate: 'e', completed: true }],
        evidences: [{ id: 1, title: 'E', type: 'img' }],
        changeHistory: [{ id: 1, field: 'status', oldValue: 'P', newValue: 'O', changedBy: 'U', changedAt: 'd' }],
      };
      const d: ProgressReportDetail = mapResponseToDetail(raw);
      expect(d.executedActivities).toHaveLength(1);
      expect(d.evidences).toHaveLength(1);
      expect(d.attachments).toHaveLength(1);
      expect(d.attachments[0]).toEqual({
        id: 55,
        fileName: 'informe_avance_2.pdf',
        fileType: 'pdf',
        url: '/api/documents/download/55',
        uploadedAt: '2026-02-01',
      });
      expect(d.comments).toHaveLength(1);
      expect(d.comments[0].content).toBe('Últimas observaciones: Revisar');
      expect(d.changeHistory).toHaveLength(1);
    });

    it('genera actividad por defecto cuando no hay executedActivities', () => {
      const d = mapResponseToDetail({ id: 3, projectId: 1, period: '2026-I' });
      expect(d.executedActivities).toHaveLength(1);
      expect(d.executedActivities[0].completed).toBe(true);
    });

    it('no genera comentarios ni adjuntos cuando faltan', () => {
      const d = mapResponseToDetail({ id: 4, projectId: 1 });
      expect(d.comments).toHaveLength(0);
      expect(d.attachments).toHaveLength(0);
    });
  });
});
