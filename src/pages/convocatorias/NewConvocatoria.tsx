import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  AlertCircle,
  Calendar,
  BookOpen,
  Megaphone,
  CheckSquare,
  Square,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import { callService } from '../../services/callService';
import { researchService } from '../../services/researchService';
import type { ResearchLine } from '../../services/researchService';

export const NewConvocatoria: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [loadingLines, setLoadingLines] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    researchService.getLines(true).then(data => {
      setLines(data || []);
    }).catch(() => {
      setErrorMsg('Error al cargar las líneas de investigación.');
    }).finally(() => setLoadingLines(false));
  }, []);

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  }

  function toggleLine(id: number) {
    setSelectedLineIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function validate(): boolean {
    if (!formData.title.trim()) { setErrorMsg('El título es obligatorio.'); return false; }
    if (!formData.description.trim()) { setErrorMsg('La descripción es obligatoria.'); return false; }
    if (!formData.startDate) { setErrorMsg('La fecha de inicio es obligatoria.'); return false; }
    if (!formData.endDate) { setErrorMsg('La fecha de fin es obligatoria.'); return false; }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMsg('La fecha de fin no puede ser anterior a la de inicio.'); return false;
    }
    if (selectedLineIds.length === 0) {
      setErrorMsg('Selecciona al menos una línea de investigación.'); return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await callService.create({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        researchLineIds: selectedLineIds,
      });
      navigate('/convocatorias');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la convocatoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="text-headline-lg" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone size={26} style={{ color: 'var(--primary)' }} />
            Nueva Convocatoria
          </h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>
            Registra un nuevo periodo de postulación científica institucional.
          </p>
        </div>
        <Link to="/convocatorias">
          <Button variant="secondary" icon={<X size={16} />}>Cancelar</Button>
        </Link>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '20px' }}>
          <Alert title="Revisa la información">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          </Alert>
        </div>
      )}

      {/* Datos generales */}
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Datos de la Convocatoria</h2>
        </CardHeader>
        <CardContent>
          <Input
            label="Título de la Convocatoria"
            placeholder="Ej. Convocatoria FIIS 2026-II"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <Textarea
            label="Descripción"
            placeholder="Describe los objetivos, requisitos y alcance de esta convocatoria..."
            rows={4}
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '6px', color: 'var(--on-surface-variant)' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--outline)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '6px', color: 'var(--on-surface-variant)' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => handleChange('endDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--outline)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Líneas de investigación */}
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            Líneas de Investigación Asociadas
          </h2>
          <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Selecciona las líneas dentro de las cuales se pueden postular proyectos.
          </p>
        </CardHeader>
        <CardContent>
          {loadingLines ? (
            <p style={{ color: 'var(--on-surface-variant)' }}>Cargando líneas...</p>
          ) : lines.length === 0 ? (
            <p style={{ color: 'var(--on-surface-variant)' }}>No hay líneas activas registradas.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {lines.map(line => {
                const selected = selectedLineIds.includes(line.id);
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => toggleLine(line.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      border: `2px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: selected ? 'var(--primary-container)' : 'var(--surface-container)',
                      color: selected ? 'var(--on-primary-container)' : 'var(--on-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      fontSize: '0.875rem',
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {selected
                      ? <CheckSquare size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      : <Square size={16} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
                    }
                    {line.lineName}
                  </button>
                );
              })}
            </div>
          )}
          {selectedLineIds.length > 0 && (
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>
              ✓ {selectedLineIds.length} línea(s) seleccionada(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <Link to="/convocatorias">
          <Button variant="secondary">Cancelar</Button>
        </Link>
        <Button
          variant="primary"
          icon={<Save size={16} />}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Crear Convocatoria'}
        </Button>
      </div>
    </div>
  );
};

export default NewConvocatoria;
