import { describe, it, expect } from 'vitest';
import type { TFunction } from 'i18next';
import {
  getEstadoTramiteLabel,
  getEstadoTramiteVariant,
  getTipoTramiteLabel,
  getTipoObservacionLabel,
  getEstadoObservacionLabel,
  getEstadoObservacionVariant,
  getRolLabel,
} from './tramiteLabels';
import type {
  EstadoTramite,
  EstadoObservacion,
  TipoObservacion,
  TipoTramite,
} from '../types/tramites';

// Mock de TFunction que simula i18next: retorna la clave cuando no hay traduccion.
const t: TFunction = ((key: string) => key) as TFunction;
const tVacio: TFunction = (() => '') as TFunction;

describe('tramiteLabels', () => {
  describe('getEstadoTramiteLabel', () => {
    const estados: EstadoTramite[] = [
      'REGISTRADO',
      'PENDIENTE_COORDINADOR',
      'PENDIENTE_DIRECCION',
      'PENDIENTE_DECANATO',
      'OBSERVADO',
      'SUBSANADO',
      'APROBADO_CON_RESOLUCION',
      'FINALIZADO',
      'RECHAZADO',
    ];
    it('mapea cada estado al label de i18n', () => {
      estados.forEach((e) => {
        expect(getEstadoTramiteLabel(e, t)).toBe(`tramites:estadosTramite.${e}`);
      });
    });
  });

  describe('getEstadoTramiteVariant', () => {
    it('retorna la variante correcta por estado', () => {
      expect(getEstadoTramiteVariant('REGISTRADO')).toBe('neutral');
      expect(getEstadoTramiteVariant('PENDIENTE_COORDINADOR')).toBe('warning');
      expect(getEstadoTramiteVariant('PENDIENTE_DIRECCION')).toBe('warning');
      expect(getEstadoTramiteVariant('PENDIENTE_DECANATO')).toBe('warning');
      expect(getEstadoTramiteVariant('OBSERVADO')).toBe('error');
      expect(getEstadoTramiteVariant('SUBSANADO')).toBe('info');
      expect(getEstadoTramiteVariant('APROBADO_CON_RESOLUCION')).toBe('success');
      expect(getEstadoTramiteVariant('FINALIZADO')).toBe('success');
      expect(getEstadoTramiteVariant('RECHAZADO')).toBe('error');
    });
    it('retorna neutral para estados desconocidos', () => {
      // @ts-expect-error probando valor invalido
      expect(getEstadoTramiteVariant('INEXISTENTE')).toBe('neutral');
    });
  });

  describe('getTipoTramiteLabel', () => {
    const tipos: TipoTramite[] = ['PROYECTO', 'PLAN_TESIS', 'INFORME_AVANCE'];
    it('mapea cada tipo al label de i18n', () => {
      tipos.forEach((tpo) => {
        expect(getTipoTramiteLabel(tpo, t)).toBe(`tramites:tiposTramite.${tpo}`);
      });
    });
  });

  describe('getTipoObservacionLabel', () => {
    const tipos: TipoObservacion[] = ['TECNICA', 'DOCUMENTAL', 'PRESUPUESTAL', 'FORMATO'];
    it('mapea cada tipo de observacion al label de i18n', () => {
      tipos.forEach((tpo) => {
        expect(getTipoObservacionLabel(tpo, t)).toBe(`tramites:tiposObservacion.${tpo}`);
      });
    });
  });

  describe('getEstadoObservacionLabel', () => {
    const estados: EstadoObservacion[] = ['PENDIENTE', 'SUBSANADA', 'VIGENTE'];
    it('mapea cada estado de observacion al label de i18n', () => {
      estados.forEach((e) => {
        expect(getEstadoObservacionLabel(e, t)).toBe(`tramites:estadosObservacion.${e}`);
      });
    });
  });

  describe('getEstadoObservacionVariant', () => {
    it('retorna la variante correcta por estado de observacion', () => {
      expect(getEstadoObservacionVariant('PENDIENTE')).toBe('warning');
      expect(getEstadoObservacionVariant('SUBSANADA')).toBe('success');
      expect(getEstadoObservacionVariant('VIGENTE')).toBe('error');
    });
    it('retorna neutral para estados desconocidos', () => {
      // @ts-expect-error probando valor invalido
      expect(getEstadoObservacionVariant('INEXISTENTE')).toBe('neutral');
    });
  });

  describe('getRolLabel', () => {
    it('retorna el label del rol desde i18n', () => {
      expect(getRolLabel('ADMIN', t)).toBe('admin:users.roles.ADMIN');
    });
    it('retorna — cuando el rol es null', () => {
      expect(getRolLabel(null, t)).toBe('—');
    });
    it('retorna — cuando la traduccion resuelve a vacio', () => {
      expect(getRolLabel('ADMIN', tVacio)).toBe('—');
    });
  });
});
