import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { Alert } from '../../components/ui/Alert';
import { FileText, Upload, Download, Search, Bell, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { thesisService } from '../../services/thesisService';
import type { Project } from '../../services/projectService';

export const ProjectMonitoring: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        projectService.getById(id),
        // Normally we'd use thesisService.getReportByPlanId(id), assuming id is also plan id or related
        thesisService.getReportByPlanId(id).catch(() => []) // Fallback to empty array if endpoint errors
      ])
        .then(([projData, _reportData]) => {
          setProject(projData);
        })
        .catch(err => console.error('Error fetching data', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdateStatus = () => {
    if (id) {
      projectService.updateStatus(id, 'En Revisión')
        .then(() => alert('Estado actualizado'))
        .catch(() => alert('Error al actualizar'));
    }
  };

  const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      // Create a report object. Usually you'd upload the file to FileController first and get an ID.
      // Assuming thesisService.createReport accepts a basic payload for now.
      await thesisService.createReport({
        id: `REP-${Math.floor(Math.random()*1000)}`,
        status: 'ENVIADO'
        // Ideally we'd send the file path or ID here
      });
      alert('Informe trimestral subido exitosamente.');
      // Refresh logic would go here
    } catch (err) {
      console.error(err);
      alert('Error al subir informe.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Cargando...</div>;
  }

  if (!project) {
    return <div style={{ padding: '32px' }}>Proyecto no encontrado.</div>;
  }

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Buscar proyectos..." 
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={20} color="var(--on-surface-variant)" />
        </div>
      </div>

      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver a Proyectos
      </Link>

      {/* Title & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Seguimiento de Proyecto</h1>
          <div className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            <strong>Código: {project.id}</strong> | Proyecto: {project.title} | Estado: <Badge variant="neutral">{project.status}</Badge>
          </div>
          <Button variant="secondary" style={{ marginTop: '16px' }} onClick={handleUpdateStatus}>Cambiar Estado (Test)</Button>
        </div>
        <div style={{ width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-label-md">Progreso General</span>
            <span className="text-label-md">25%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--primary)' }} />
          </div>
        </div>
      </div>

      <Alert title="Regla Institucional FIF Activa:" style={{ marginBottom: '32px' }}>
        La omisión o retraso de un informe trimestral suspende automáticamente el desembolso del apoyo financiero hasta su regularización.
      </Alert>

      {/* Main Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Left Column - Timeline */}
        <div>
          <h3 className="text-title-lg" style={{ marginBottom: '24px' }}>Línea de Tiempo Trimestral</h3>
          <Timeline>
            {/* Q1 */}
            <TimelineItem id="q1" title="" status="success">
              <Card style={{ borderLeft: '4px solid #22c55e' }}>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 className="text-title-lg">Trimestre 1 (Q1)</h4>
                    <Badge variant="success" style={{ backgroundColor: '#dcfce7' }}>APROBADO Y CONFORME</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16}/> avance_t1.pdf</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Aprobado el 30/09/2026</span>
                  </div>
                </CardContent>
              </Card>
            </TimelineItem>

            {/* Q2 */}
            <TimelineItem id="q2" title="" status="error">
              <Card style={{ borderLeft: '4px solid #f59e0b' }}>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 className="text-title-lg">Trimestre 2 (Q2)</h4>
                    <Badge variant="warning">PENDIENTE DE CARGA</Badge>
                  </div>
                  <div style={{ border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--surface-container-lowest)' }}>
                    <Upload size={32} color="var(--on-surface-variant)" style={{ marginBottom: '16px' }} />
                    <p style={{ marginBottom: '16px' }}>Haga clic o arrastre aquí su informe</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleUploadReport}
                      accept=".pdf,.doc,.docx"
                    />
                    <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Subiendo...' : 'Subir Informe Trimestral'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TimelineItem>

            {/* Q3 */}
            <TimelineItem id="q3" title="" status="pending">
              <Card style={{ opacity: 0.7 }}>
                <CardContent style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 className="text-title-lg">Trimestre 3 (Q3)</h4>
                  <Badge variant="neutral">PROGRAMADO (VENCE 31/03/2027)</Badge>
                </CardContent>
              </Card>
            </TimelineItem>

            {/* Cierre */}
            <TimelineItem id="cierre" title="" status="pending" isLast>
              <Card style={{ opacity: 0.7 }}>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 className="text-title-lg">Cierre y Entrega Final</h4>
                    <Badge style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>ARTÍCULO REQUERIDO</Badge>
                  </div>
                  <div style={{ backgroundColor: '#faf5ff', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: '#6b21a8' }}>
                    <strong>Regla FIF:</strong> Se solicita de forma obligatoria evidencia de preparación, envío o aceptación de un artículo científico derivado antes del cierre del proyecto.
                  </div>
                </CardContent>
              </Card>
            </TimelineItem>
          </Timeline>
        </div>

        {/* Right Column - Administrativos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <h3 className="text-title-lg">Detalles Administrativos</h3>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div className="text-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Resolución</div>
                  <div className="text-body-md">R.D. N.º 045-2026-FIIS</div>
                  <div style={{ borderBottom: '1px solid var(--outline-variant)', marginTop: '20px' }} />
                </div>
                <div>
                  <div className="text-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Duración</div>
                  <div className="text-body-md">12 meses</div>
                  <div style={{ borderBottom: '1px solid var(--outline-variant)', marginTop: '20px' }} />
                </div>
                <div>
                  <div className="text-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Estado del apoyo FIF</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 600 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                    ACTIVO
                  </div>
                </div>
                <Button variant="secondary" icon={<Download size={16} />} style={{ width: '100%', marginTop: '8px' }}>
                  Descargar Cronograma
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Box */}
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <HelpCircle size={24} />
              <h3 className="text-title-lg">¿Necesitas ayuda?</h3>
            </div>
            <p className="text-body-md" style={{ marginBottom: '24px', opacity: 0.9 }}>
              Si tienes problemas con la carga de informes o la normativa FIF, contacta a la oficina de investigación.
            </p>
            <a href="#" style={{ color: 'white', textDecoration: 'underline', fontWeight: 600 }}>
              Consultar Manual del Investigador
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
