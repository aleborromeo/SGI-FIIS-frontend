import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  PenTool,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';

interface PendingProject {
  id: number;
  type: string;
  projectName: string;
  author: string;
  preRequisiteStatus: string;
  status: string;
}

const initialProjects: PendingProject[] = [
  {
    id: 1,
    type: 'Proyecto de investigación',
    projectName: 'Sistema de detección automática de enfermedades en hojas de banana usando CNN',
    author: 'Dr. Alejandro Borromeo (Docente)',
    preRequisiteStatus: 'Aprobado por Director de Investigación',
    status: 'PENDIENTE_DECANO',
  },
  {
    id: 2,
    type: 'Plan de tesis doctoral',
    projectName: 'Arquitectura microservicios optimizada para procesamiento analítico FIIS',
    author: 'Ing. Laura Gómez (Tesista)',
    preRequisiteStatus: 'Aprobado por Director de Investigación',
    status: 'PENDIENTE_DECANO',
  }
];

export const DecanoReview: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState<PendingProject[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);

  // Form states
  const [outcome, setOutcome] = useState('APROBAR');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (project: PendingProject) => {
    setSelectedProject(project);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setSubmitting(true);
    // Mock simulation
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Trámite procesado exitosamente: ${outcome === 'APROBAR' ? 'Aprobado' : 'Observado'}`);
      
      // Remove from list
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));

      if (outcome === 'APROBAR') {
        // Redirigir para registrar resolución
        navigate(`/resolutions/new?projectId=${selectedProject.id}&title=${encodeURIComponent(selectedProject.projectName)}`);
      } else {
        setSelectedProject(null);
      }
    }, 800);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} style={{ color: 'white' }} />
          </span>
          Consola de Decanato
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginLeft: '54px' }}>
          Revisión final de expedientes de investigación y firmas autorizadas de resoluciones.
        </p>
      </div>

      <div className={selectedProject ? 'section-grid-side-panel' : ''} style={{ display: 'grid', gridTemplateColumns: selectedProject ? undefined : '1fr', gap: '28px' }}>
        
        {/* Left Side: Table of pending projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                Expedientes Pendientes de Firma Decanal
              </h3>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <TableHeader>Trámite / ID</TableHeader>
                    <TableHeader>Proyecto / Título</TableHeader>
                    <TableHeader>Solicitante</TableHeader>
                    <TableHeader>Filtros Previos</TableHeader>
                    <TableHeader>Estado</TableHeader>
                    <TableHeader style={{ textAlign: 'right' }}>Acción</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell style={{ textAlign: 'center', padding: '40px' }} colSpan={6}>
                        No hay expedientes pendientes de aprobación final.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map(p => (
                      <TableRow key={p.id} className={selectedProject?.id === p.id ? 'bg-surface-container-low' : ''}>
                        <TableCell>
                          <strong>{p.type}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--outline)' }}>EXP-{p.id}092</div>
                        </TableCell>
                        <TableCell style={{ maxWidth: '280px', fontSize: '13px' }}>{p.projectName}</TableCell>
                        <TableCell style={{ fontSize: '13px' }}>{p.author}</TableCell>
                        <TableCell>
                          <Badge variant="success">{p.preRequisiteStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">PENDIENTE_DECANO</Badge>
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <Button 
                            variant={selectedProject?.id === p.id ? 'primary' : 'secondary'}
                            onClick={() => handleSelect(p)}
                            icon={<PenTool size={14} />}
                          >
                            Firmar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Form to Approve / Observe */}
        {selectedProject && (
          <Card style={{ border: '2px solid var(--primary)', position: 'sticky', top: '80px' }}>
            <CardHeader style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                Firma Decanal: EXP-{selectedProject.id}092
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>
                {selectedProject.projectName}
              </p>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Resultado de la Decisión *
                    </label>
                    <Select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      options={[
                        { value: 'APROBAR', label: 'Aprobar y generar resolución' },
                        { value: 'OBSERVAR', label: 'Observar (Devolver a Dirección)' },
                        { value: 'RECHAZAR', label: 'Rechazar propuesta' }
                      ]}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Fecha del Dictamen
                    </label>
                    <Input
                      type="date"
                      value={decisionDate}
                      onChange={(e) => setDecisionDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Sustento o Observación
                    </label>
                    <Textarea
                      placeholder="Escriba los considerandos de la resolución o el motivo de la observación..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setSelectedProject(null)}
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant={outcome === 'APROBAR' ? 'primary' : 'danger'}
                      disabled={submitting}
                      style={{ flex: 2 }}
                    >
                      {submitting ? 'Procesando...' : outcome === 'APROBAR' ? 'Aprobar y Continuar' : 'Enviar Observación'}
                    </Button>
                  </div>

                </div>
              </form>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default DecanoReview;
