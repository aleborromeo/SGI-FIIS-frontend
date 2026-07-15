import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  AlertCircle,
  GraduationCap,
  User,
  BookOpen,
  Users,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import { api } from '../../services/api';
import { researchService } from '../../services/researchService';
import { AuthContext } from '../../context/AuthContext';
import type { ResearchLine, ResearchGroup } from '../../services/researchService';

interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  correoInstitucional: string;
}

interface CreateThesisPlanPayload {
  tituloTesis: string;
  resumen: string;
  idLinea: number;
  idGrupo: number;
  idAsesor?: number;
}

export const NewThesisPlan: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = React.useContext(AuthContext);

  const [formData, setFormData] = useState({
    tituloTesis: '',
    resumen: '',
    idLinea: '',
    idGrupo: '',
    idAsesor: '',
  });

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [linesData, groupsData] = await Promise.all([
          researchService.getLines(true),
          researchService.getGroups(),
        ]);
        setLines(linesData || []);
        setGroups(groupsData || []);
      } catch (err) {
        console.error('Error cargando catálogos de tesis', err);
      }

      if (currentRole !== 'ESTUDIANTE') {
        try {
          const usersData = await api.get<any[]>('/users?role=DOCENTE_INVESTIGADOR');
          const arr = Array.isArray(usersData) ? usersData : (usersData as any)?.content ?? [];
          setDocentes(arr);
        } catch {
          setDocentes([]);
        }
      }

      setLoadingCatalogs(false);
    };
    fetchAll();
  }, []);

  function handleChange(field: string, value: string) {
    if (errorMsg) setErrorMsg('');

    if (field === 'idGrupo') {
      setFormData(prev => ({ ...prev, idGrupo: value, idLinea: '' }));
      if (value) {
        researchService.getGroupLines(Number(value)).then(fetched => {
          setLines(fetched || []);
        }).catch(() => {
          setLines([]);
        });
      } else {
        researchService.getLines(true).then(fetched => {
          setLines(fetched || []);
        }).catch(() => {
          setLines([]);
        });
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    if (formData.tituloTesis.trim().length < 5) {
      setErrorMsg('El título debe tener al menos 5 caracteres.'); return false;
    }
    if (formData.resumen.trim().length < 10) {
      setErrorMsg('El resumen debe tener al menos 10 caracteres.'); return false;
    }
    if (!formData.idLinea) {
      setErrorMsg('Selecciona una línea de investigación.'); return false;
    }
    if (!formData.idGrupo) {
      setErrorMsg('Selecciona un grupo de investigación.'); return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: CreateThesisPlanPayload = {
        tituloTesis: formData.tituloTesis,
        resumen: formData.resumen,
        idLinea: Number(formData.idLinea),
        idGrupo: Number(formData.idGrupo),
      };
      if (formData.idAsesor) payload.idAsesor = Number(formData.idAsesor);

      await api.post('/thesis/plans', payload);
      navigate('/thesis/plans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el plan de tesis.');
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
            <GraduationCap size={28} style={{ color: 'var(--primary)' }} />
            Registrar Plan de Tesis
          </h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>
            Completa la información para iniciar el proceso de revisión académica de tu propuesta de tesis.
          </p>
        </div>
        <Link to="/thesis/plans">
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

      {loadingCatalogs ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
          Cargando formulario...
        </div>
      ) : (
        <>
          {/* Datos del plan */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                Información de la Tesis
              </h2>
            </CardHeader>
            <CardContent>
              <Input
                label="Título de la Tesis"
                placeholder="Ingresa el título completo de tu propuesta de tesis..."
                value={formData.tituloTesis}
                onChange={e => handleChange('tituloTesis', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <Textarea
                label="Resumen Académico"
                placeholder="Describe brevemente el problema de investigación, metodología y contribución esperada..."
                rows={5}
                value={formData.resumen}
                onChange={e => handleChange('resumen', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <div className="form-row" style={{ gap: '16px' }}>
                <Select
                  label="Línea de Investigación"
                  value={formData.idLinea}
                  onChange={e => handleChange('idLinea', e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione una línea...' },
                    ...lines.map(l => ({ value: String(l.id), label: l.lineName })),
                  ]}
                />
                <Select
                  label="Grupo de Investigación"
                  value={formData.idGrupo}
                  onChange={e => handleChange('idGrupo', e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione un grupo...' },
                    ...groups.map(g => ({ value: String(g.id), label: g.groupName })),
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Asesor */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                Docente Asesor
              </h2>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                Opcional — puedes asignar un asesor ahora o posteriormente.
              </p>
            </CardHeader>
            <CardContent>
              {docentes.length === 0 ? (
                <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  No se pudieron cargar los docentes investigadores.
                </p>
              ) : (
                <Select
                  label="Seleccionar Asesor"
                  value={formData.idAsesor}
                  onChange={e => handleChange('idAsesor', e.target.value)}
                  options={[
                    { value: '', label: 'Sin asesor asignado (por ahora)' },
                    ...docentes.map(d => ({
                      value: String(d.id),
                      label: `${d.nombres} ${d.apellidos}`,
                    })),
                  ]}
                />
              )}
              {formData.idAsesor && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-container)',
                  color: 'var(--on-primary-container)',
                }}>
                  <User size={16} />
                  <span className="text-label-md">
                    Asesor seleccionado:{' '}
                    <strong>
                      {docentes.find(d => String(d.id) === formData.idAsesor)
                        ? `${docentes.find(d => String(d.id) === formData.idAsesor)!.nombres} ${docentes.find(d => String(d.id) === formData.idAsesor)!.apellidos}`
                        : '—'}
                    </strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Link to="/thesis/plans">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Plan de Tesis'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewThesisPlan;
