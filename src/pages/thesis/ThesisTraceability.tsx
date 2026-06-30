import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Stepper, type StepStatus } from '../../components/ui/Stepper';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { FileText, Download, Bell, HelpCircle, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { id: '1', label: 'Estudiante', status: 'listo' as StepStatus, sublabel: 'Listo' },
  { id: '2', label: 'Coord. de Grupo', status: 'aprobado' as StepStatus, sublabel: 'Aprobado' },
  { id: '3', label: 'Director Inv.', status: 'observado' as StepStatus, sublabel: 'Observado' },
  { id: '4', label: 'Coordinador', status: 'actual' as StepStatus, sublabel: 'Gestión Actual' },
];

export const ThesisTraceability: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 className="text-title-lg">Gestión y Revisión de Plan de Tesis</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={20} color="var(--on-surface-variant)" />
          <HelpCircle size={20} color="var(--on-surface-variant)" />
        </div>
      </div>

      <Link to="/projects/audit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver al Expediente
      </Link>

      {/* Main Title Area */}
      <div style={{ marginBottom: '32px' }}>
        <Badge variant="info" style={{ marginBottom: '12px' }}>PROYECTO ID: 2024-GIN-082</Badge>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-headline-lg" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Gestión de trazabilidad de proyectos de tesis</h1>
            <div style={{ display: 'flex', gap: '24px', color: 'var(--on-surface-variant)' }}>
              <span className="text-body-md"><strong style={{ color: 'var(--on-surface)' }}>Tesista:</strong> Alex Avila</span>
              <span className="text-body-md"><strong style={{ color: 'var(--on-surface)' }}>Grupo:</strong> GINSOFT</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Estado del Flujo</div>
            <div style={{ backgroundColor: 'var(--error-container)', color: 'var(--error)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <AlertCircle size={16} /> Observado por Dirección
            </div>
          </div>
        </div>
      </div>

      {/* Trazabilidad Stepper */}
      <Card style={{ marginBottom: '32px' }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h3 className="text-title-lg">Trazabilidad del Proceso</h3>
            <Badge variant="error">Observación Técnica</Badge>
          </div>
          <Stepper steps={steps} />
        </CardContent>
      </Card>

      {/* Two Columns Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20}/> Versión Actual</h3>
              <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Historial de Versiones</Button>
            </CardHeader>
            <CardContent>
              <div style={{ border: '1px dashed var(--outline)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ backgroundColor: '#fecaca', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <FileText size={32} color="#dc2626" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>plan_tesis_v1.pdf</div>
                    <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>Subido el 12 Oct 2024 • 2.4 MB</div>
                  </div>
                </div>
                <Button variant="secondary"><Download size={16}/></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-title-lg" style={{ marginBottom: '24px' }}>Clasificación de Investigación</h3>
              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Línea del Proyecto</div>
                <div style={{ fontWeight: 600 }}>Ingeniería de Software</div>
              </div>
              <div>
                <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Líneas autorizadas para GINSOFT</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge>Computación</Badge>
                  <Badge variant="info" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Ingeniería de Software</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <Card style={{ borderTop: '4px solid var(--primary)' }}>
          <CardHeader style={{ backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Flujo de Observación Institucional</h3>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 500 }}>Regla RN-07</span>
          </CardHeader>
          <CardContent style={{ paddingTop: '32px' }}>
            <Timeline>
              <TimelineItem id="1" title="Paso A: Evaluación de Dirección" time="Hace 2 horas" status="error">
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fda4af', padding: '16px', borderRadius: 'var(--radius-md)', color: '#9f1239' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '16px' }}>"Falta detallar la matriz de trazabilidad en el capítulo 3. Sin esta matriz, la justificación metodológica queda incompleta para los estándares del grupo GINSOFT."</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#be123c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>DI</div>
                    Director de Investigación
                  </div>
                </div>
              </TimelineItem>
              <TimelineItem id="2" title="Paso B: Mediación de Coordinación" status="active" isLast>
                <div style={{ marginBottom: '16px' }}>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: '8px' }}>Guía para el Estudiante</label>
                  <textarea 
                    style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontFamily: 'inherit', resize: 'vertical' }}
                    defaultValue="Alex, he revisado la observación del Director. Adjunta la plantilla oficial de la matriz en los anexos y vuelve a subir el PDF aquí."
                  />
                </div>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--primary-fixed-dim)' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Referencia Adjunta por Coordinador</div>
                    <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Plantilla_Matriz_Trazabilidad_UNAL.docx</div>
                    <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '12px', textDecoration: 'none' }}>Ver Plantilla</a>
                  </div>
                </div>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--outline-variant)' }}>
        <Button variant="danger" icon={<ArrowLeft size={18}/>} style={{ width: '300px' }}>Devolver a Estudiante para Subsanación</Button>
        <Button variant="primary" icon={<Send size={18}/>} style={{ width: '300px' }}>Re-enviar a Dirección de Investigación</Button>
      </div>
    </div>
  );
};
