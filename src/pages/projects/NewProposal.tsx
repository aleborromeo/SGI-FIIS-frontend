import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Save,
  X,
  Upload,
  FileText,
  Trash2,
  Info,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import type { ResearchLine, ResearchGroup } from '../../services/researchService';
import type { CallResponse } from '../../services/callService';

const GINSOFT_CODE = 'GINSOFT';
const GINSOFT_ALLOWED_LINES = ['computación', 'ingeniería de software'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function isGinsoftLine(lineName: string): boolean {
  return GINSOFT_ALLOWED_LINES.some(kw => lineName.toLowerCase().includes(kw));
}

function validateFileExtension(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext));
}

export const NewProposal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    researchLineId: '',
    researchGroupId: '',
    title: '',
    abstract: '',
    generalObjective: '',
    budget: '',
    startDate: '',
    endDate: '',
    executionPlace: '',
    callId: '',
  });

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [openCalls, setOpenCalls] = useState<CallResponse[]>([]);
  const [userGroupCode, setUserGroupCode] = useState<string | null>(null);
  const [isGinsoft, setIsGinsoft] = useState(false);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [prereqValid, setPrereqValid] = useState(true);
  const [prereqDetails, setPrereqDetails] = useState({ hasActiveGroup: true, hasVigentCalls: true, isDocente: true });
  const [loadingPrereq, setLoadingPrereq] = useState(true);

  // Load all catalogs + detect user's group
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingPrereq(true);
      try {
        const prereq = await callService.checkPrerequisitos();
        setPrereqDetails(prereq);
        setPrereqValid(prereq.valid);

        if (!prereq.valid) {
          setLoadingCatalogs(false);
          setLoadingPrereq(false);
          return;
        }

        const [linesData, groupsData, callsData] = await Promise.all([
          researchService.getLines(true),
          researchService.getGroups(),
          callService.getVigent(),
        ]);

        const allLines = linesData || [];
        const allGroups = groupsData || [];
        const allCalls = Array.isArray(callsData) ? callsData : [];

        setLines(allLines);
        setGroups(allGroups);
        setOpenCalls(allCalls);
        setFilteredLines(allLines);

        const queryParams = new URLSearchParams(window.location.search);
        const urlCallId = queryParams.get('callId');
        if (urlCallId && allCalls.some(c => String(c.id) === urlCallId)) {
          setFormData(prev => ({ ...prev, callId: urlCallId }));
        } else if (allCalls.length > 0) {
          setFormData(prev => ({ ...prev, callId: String(allCalls[0].id) }));
        }
      } catch (err) {
        console.error('Error cargando catálogos de propuesta', err);
        setErrorMsg('Error al verificar prerrequisitos o cargar los catálogos.');
      } finally {
        setLoadingCatalogs(false);
        setLoadingPrereq(false);
      }
    };
    fetchAll();
  }, []);

  // Apply GINSOFT line filter whenever group changes
  useEffect(() => {
    if (!formData.researchGroupId) {
      setFilteredLines(lines);
      setIsGinsoft(false);
      setUserGroupCode(null);
      return;
    }
    const selectedGroup = groups.find(g => String(g.id) === formData.researchGroupId);
    if (selectedGroup && selectedGroup.groupCode === GINSOFT_CODE) {
      setIsGinsoft(true);
      setUserGroupCode(GINSOFT_CODE);
      const restricted = lines.filter(l => isGinsoftLine(l.lineName));
      setFilteredLines(restricted);
      // If currently selected line is not in restricted, reset it
      if (formData.researchLineId) {
        const currentLine = lines.find(l => String(l.id) === formData.researchLineId);
        if (currentLine && !isGinsoftLine(currentLine.lineName)) {
          setFormData(prev => ({ ...prev, researchLineId: '' }));
        }
      }
    } else {
      setIsGinsoft(false);
      setUserGroupCode(selectedGroup?.groupCode ?? null);
      setFilteredLines(lines);
    }
  }, [formData.researchGroupId, groups, lines]);

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  }

  // ── Drag-and-Drop handlers ────────────────────────────────────────────────
  const processFile = (file: File) => {
    setFileError('');
    if (!validateFileExtension(file)) {
      setFileError(`Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  if (loadingPrereq) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        Verificando prerrequisitos del docente...
      </div>
    );
  }

  if (!prereqValid) {
    return (
      <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card style={{ marginTop: '40px', border: '1px solid var(--outline-variant)' }}>
          <CardHeader style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '20px', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
            <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <AlertCircle size={24} />
              No habilitado para registrar proyectos
            </h2>
          </CardHeader>
          <CardContent style={{ padding: '24px' }}>
            <p className="text-body-md" style={{ marginBottom: '20px' }}>
              El sistema ha verificado los prerrequisitos obligatorios para la postulación de proyectos de investigación y se encontraron los siguientes impedimentos:
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', marginBottom: '24px', listStyleType: 'disc' }}>
              {!prereqDetails.isDocente && (
                <li style={{ color: 'var(--error)' }}>
                  Solo los <strong>Docentes Investigadores</strong> pueden registrar proyectos de investigación en esta plataforma.
                </li>
              )}
              {!prereqDetails.hasActiveGroup && (
                <li style={{ color: 'var(--error)' }}>
                  Usted no pertenece a un <strong>grupo de investigación activo</strong>. Comuníquese con la Dirección de Investigación para regularizar su membresía.
                </li>
              )}
              {!prereqDetails.hasVigentCalls && (
                <li style={{ color: 'var(--error)' }}>
                  Actualmente <strong>no existen convocatorias abiertas</strong> y vigentes dentro del rango de fechas permitido.
                </li>
              )}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/dashboard">
                <Button variant="primary">Volver al Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function validate(): boolean {
    if (!formData.researchGroupId) { setErrorMsg('Selecciona un grupo de investigación.'); return false; }
    if (!formData.callId) { setErrorMsg('Selecciona una convocatoria obligatoria.'); return false; }
    if (!formData.researchLineId) { setErrorMsg('Selecciona una línea de investigación.'); return false; }
    if (formData.title.trim().length < 5) { setErrorMsg('El título debe tener al menos 5 caracteres.'); return false; }
    if (formData.abstract.trim().length < 10) { setErrorMsg('El resumen debe tener al menos 10 caracteres.'); return false; }
    if (formData.generalObjective.trim().length < 10) { setErrorMsg('El objetivo general debe tener al menos 10 caracteres.'); return false; }
    if (!formData.startDate || !formData.endDate) { setErrorMsg('Registra la fecha de inicio y fin.'); return false; }
    if (new Date(formData.endDate) < new Date(formData.startDate)) { setErrorMsg('La fecha de fin no puede ser anterior a la de inicio.'); return false; }
    if (!formData.budget || isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      setErrorMsg('El presupuesto debe ser un número mayor a 0.'); return false;
    }
    if (!formData.executionPlace.trim()) { setErrorMsg('Ingresa el lugar de ejecución.'); return false; }
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await projectService.create({
        title: formData.title,
        summary: formData.abstract,
        generalObjective: formData.generalObjective,
        researchLineId: Number(formData.researchLineId),
        budget: Number(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate,
        executionPlace: formData.executionPlace,
        researchGroupId: Number(formData.researchGroupId),
        callId: Number(formData.callId),
      });
      navigate('/projects');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('miembro') || msg.toLowerCase().includes('member')) {
        setErrorMsg('No eres miembro activo del grupo seleccionado. Verifica tu membresía.');
      } else {
        setErrorMsg(msg || 'Error al registrar la propuesta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="text-headline-lg">Nueva Propuesta de Proyecto</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '6px', maxWidth: '640px' }}>
            Registra la información de tu propuesta de investigación para iniciar el flujo de revisión institucional.
          </p>
        </div>
        <Link to="/projects">
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

      {openCalls.length === 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Alert title="Convocatorias no disponibles">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>Actualmente no existen convocatorias abiertas para registrar proyectos de investigación.</span>
            </div>
          </Alert>
        </div>
      )}

      {isGinsoft && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--secondary-container)', color: 'var(--on-secondary-container)',
          marginBottom: '20px', fontSize: '0.875rem',
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Grupo GINSOFT detectado:</strong> Las líneas de investigación disponibles están restringidas
            a <strong>Computación</strong> e <strong>Ingeniería de Software</strong>.
          </span>
        </div>
      )}

      {loadingCatalogs ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--on-surface-variant)' }}>
          Cargando catálogos...
        </div>
      ) : (
        <>
          {/* Datos generales */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Datos Generales</h2>
            </CardHeader>
            <CardContent>
              {/* Grupo (first, triggers GINSOFT filter) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Select
                  label="Grupo de Investigación"
                  value={formData.researchGroupId}
                  onChange={e => handleChange('researchGroupId', e.target.value)}
                  options={[
                    { value: '', label: 'Selecciona un grupo...' },
                    ...groups.map(g => ({ value: String(g.id), label: g.groupName })),
                  ]}
                />
                <Select
                  label={isGinsoft ? 'Línea de Investigación (restringida por GINSOFT)' : 'Línea de Investigación'}
                  value={formData.researchLineId}
                  onChange={e => handleChange('researchLineId', e.target.value)}
                  options={[
                    { value: '', label: 'Selecciona una línea...' },
                    ...filteredLines.map(l => ({ value: String(l.id), label: l.lineName })),
                  ]}
                />
              </div>

              {/* Convocatoria (obligatoria) */}
              <Select
                label="Seleccionar Convocatoria"
                value={formData.callId}
                onChange={e => handleChange('callId', e.target.value)}
                options={[
                  { value: '', label: openCalls.length === 0 ? 'No hay convocatorias vigentes' : 'Selecciona una convocatoria...' },
                  ...openCalls.map(c => ({
                    value: String(c.id),
                    label: `${c.title} (hasta ${c.endDate})`,
                  })),
                ]}
                disabled={openCalls.length === 0}
                style={{ marginBottom: '16px' }}
              />

              <Input
                label="Título del Proyecto"
                placeholder="Ingresa el título completo del proyecto..."
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                style={{ marginBottom: '16px' }}
              />

              <Textarea
                label="Resumen"
                placeholder="Breve descripción del proyecto de investigación..."
                rows={3}
                value={formData.abstract}
                onChange={e => handleChange('abstract', e.target.value)}
                style={{ marginBottom: '16px' }}
              />

              <Textarea
                label="Objetivo General"
                placeholder="Objetivo principal del proyecto..."
                rows={3}
                value={formData.generalObjective}
                onChange={e => handleChange('generalObjective', e.target.value)}
                style={{ marginBottom: '16px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Input
                  label="Lugar de Ejecución"
                  placeholder="Ej. Laboratorio FIIS - Piso 3"
                  value={formData.executionPlace}
                  onChange={e => handleChange('executionPlace', e.target.value)}
                />
                <Input
                  label="Presupuesto (S/)"
                  type="number"
                  placeholder="0.00"
                  value={formData.budget}
                  onChange={e => handleChange('budget', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Fecha de Inicio"
                  type="date"
                  value={formData.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                />
                <Input
                  label="Fecha de Fin"
                  type="date"
                  value={formData.endDate}
                  onChange={e => handleChange('endDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documento — Drag-and-Drop */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Documento Principal</h2>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                Adjunta el archivo de tu propuesta. Formatos permitidos: PDF, DOC, DOCX.
              </p>
            </CardHeader>
            <CardContent>
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragOver ? 'var(--primary)' : fileError ? 'var(--error)' : 'var(--outline-variant)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: isDragOver ? 'var(--primary-container)' : 'var(--surface-container-lowest)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
              >
                <Upload
                  size={36}
                  style={{
                    margin: '0 auto 16px',
                    color: isDragOver ? 'var(--primary)' : 'var(--on-surface-variant)',
                    transition: 'color 0.2s',
                  }}
                />
                <h3 className="text-title-md" style={{ marginBottom: '6px' }}>
                  {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo o haz clic para seleccionar'}
                </h3>
                <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  PDF, DOC o DOCX — sin límite de tamaño
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>

              {/* File error */}
              {fileError && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontSize: '0.85rem' }}>
                  <AlertCircle size={14} />
                  {fileError}
                </div>
              )}

              {/* Selected file preview */}
              {selectedFile && !fileError && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-container)',
                  color: 'var(--on-primary-container)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedFile.name}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Link to="/projects">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSubmit}
              disabled={loading || openCalls.length === 0}
            >
              {loading ? 'Guardando...' : 'Registrar Propuesta'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewProposal;
