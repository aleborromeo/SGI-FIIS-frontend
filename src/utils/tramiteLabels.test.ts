import { describe, it, expect } from 'vitest';
import {
  getEstadoTramiteLabel,
  getEstadoTramiteVariant,
  getTipoTramiteLabel,
  getTipoObservacionLabel,
  getEstadoObservacionLabel,
  getEstadoObservacionVariant,
  getRolLabel,
} from './tramiteLabels';
import type { TFunction } from 'i18next';
import type { EstadoTramite, EstadoObservacion } from '../types/tramites';

// Simple mock t function that returns the key
const mockT: TFunction = (key: string) => key as unknown as any;

describe('tramiteLabels', () => {
  describe('getEstadoTramiteLabel', () => {
    it('returns translation key for REGISTRADO', () => {
      const label = getEstadoTramiteLabel('REGISTRADO', mockT);
      expect(label).toBe('tramites:estadosTramite.REGISTRADO');
    });

    it('returns translation key for PENDIENTE_COORDINADOR', () => {
      const label = getEstadoTramiteLabel('PENDIENTE_COORDINADOR', mockT);
      expect(label).toBe('tramites:estadosTramite.PENDIENTE_COORDINADOR');
    });

    it('returns translation key for OBSERVADO', () => {
      const label = getEstadoTramiteLabel('OBSERVADO', mockT);
      expect(label).toBe('tramites:estadosTramite.OBSERVADO');
    });

    it('returns translation key for APROBADO_CON_RESOLUCION', () => {
      const label = getEstadoTramiteLabel('APROBADO_CON_RESOLUCION', mockT);
      expect(label).toBe('tramites:estadosTramite.APROBADO_CON_RESOLUCION');
    });

    it('returns translation key for FINALIZADO', () => {
      const label = getEstadoTramiteLabel('FINALIZADO', mockT);
      expect(label).toBe('tramites:estadosTramite.FINALIZADO');
    });

    it('returns translation key for RECHAZADO', () => {
      const label = getEstadoTramiteLabel('RECHAZADO', mockT);
      expect(label).toBe('tramites:estadosTramite.RECHAZADO');
    });
  });

  describe('getEstadoTramiteVariant', () => {
    it('returns neutral for REGISTRADO', () => {
      expect(getEstadoTramiteVariant('REGISTRADO')).toBe('neutral');
    });

    it('returns warning for PENDIENTE_COORDINADOR', () => {
      expect(getEstadoTramiteVariant('PENDIENTE_COORDINADOR')).toBe('warning');
    });

    it('returns warning for PENDIENTE_DIRECCION', () => {
      expect(getEstadoTramiteVariant('PENDIENTE_DIRECCION')).toBe('warning');
    });

    it('returns warning for PENDIENTE_DECANATO', () => {
      expect(getEstadoTramiteVariant('PENDIENTE_DECANATO')).toBe('warning');
    });

    it('returns error for OBSERVADO', () => {
      expect(getEstadoTramiteVariant('OBSERVADO')).toBe('error');
    });

    it('returns info for SUBSANADO', () => {
      expect(getEstadoTramiteVariant('SUBSANADO')).toBe('info');
    });

    it('returns success for APROBADO_CON_RESOLUCION', () => {
      expect(getEstadoTramiteVariant('APROBADO_CON_RESOLUCION')).toBe('success');
    });

    it('returns success for FINALIZADO', () => {
      expect(getEstadoTramiteVariant('FINALIZADO')).toBe('success');
    });

    it('returns error for RECHAZADO', () => {
      expect(getEstadoTramiteVariant('RECHAZADO')).toBe('error');
    });

    it('returns neutral for unknown estado', () => {
      expect(getEstadoTramiteVariant('UNKNOWN' as EstadoTramite)).toBe('neutral');
    });
  });

  describe('getTipoTramiteLabel', () => {
    it('returns translation for tipo tramite', () => {
      const label = getTipoTramiteLabel('PROYECTO', mockT);
      expect(label).toBe('tramites:tiposTramite.PROYECTO');
    });
  });

  describe('getTipoObservacionLabel', () => {
    it('returns translation for tipo observacion', () => {
      const label = getTipoObservacionLabel('FORMAL', mockT);
      expect(label).toBe('tramites:tiposObservacion.FORMAL');
    });

    it('returns translation for CONTENIDO', () => {
      const label = getTipoObservacionLabel('CONTENIDO', mockT);
      expect(label).toBe('tramites:tiposObservacion.CONTENIDO');
    });
  });

  describe('getEstadoObservacionLabel', () => {
    it('returns translation for PENDIENTE', () => {
      const label = getEstadoObservacionLabel('PENDIENTE', mockT);
      expect(label).toBe('tramites:estadosObservacion.PENDIENTE');
    });

    it('returns translation for SUBSANADA', () => {
      const label = getEstadoObservacionLabel('SUBSANADA', mockT);
      expect(label).toBe('tramites:estadosObservacion.SUBSANADA');
    });

    it('returns translation for VIGENTE', () => {
      const label = getEstadoObservacionLabel('VIGENTE', mockT);
      expect(label).toBe('tramites:estadosObservacion.VIGENTE');
    });
  });

  describe('getEstadoObservacionVariant', () => {
    it('returns warning for PENDIENTE', () => {
      expect(getEstadoObservacionVariant('PENDIENTE')).toBe('warning');
    });

    it('returns success for SUBSANADA', () => {
      expect(getEstadoObservacionVariant('SUBSANADA')).toBe('success');
    });

    it('returns error for VIGENTE', () => {
      expect(getEstadoObservacionVariant('VIGENTE')).toBe('error');
    });

    it('returns neutral for unknown estado', () => {
      expect(getEstadoObservacionVariant('UNKNOWN' as EstadoObservacion)).toBe('neutral');
    });
  });

  describe('getRolLabel', () => {
    it('returns role label with translation', () => {
      const label = getRolLabel('ADMIN', mockT);
      expect(label).toBe('admin:users.roles.ADMIN');
    });

    it('returns — for null rol', () => {
      expect(getRolLabel(null, mockT)).toBe('—');
    });

    it('returns — for empty string rol', () => {
      expect(getRolLabel('', mockT)).toBe('—');
    });
  });
});
