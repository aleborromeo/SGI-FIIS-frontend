import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Bell, Folder, FileText, Printer, Plus, ShieldCheck, ClipboardList, Users, Activity, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectAudit: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Buscar acciones, usuarios o fechas..." 
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={20} color="var(--on-surface-variant)" />
        </div>
      </div>

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Link to="/projects" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>← Volver al Listado</Link>
            <span style={{ color: 'var(--on-surface-variant)' }}>|</span>
            <span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>PROPUESTAS</span>
            <span style={{ color: 'var(--on-surface-variant)' }}>›</span>
            <Badge variant="info">#EXP-2026-442</Badge>
          </div>
          <h1 className="text-headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>Expediente Digital Único y Auditoría de Trámite</h1>
          <div className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Gabinete de Innovación de Software y Tecnologías Emergentes (GINSOFT)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<Printer size={18} />}>Imprimir Log</Button>
          <Button variant="primary" icon={<Plus size={18} />}>Subir Anexo</Button>
        </div>
      </div>

      {/* Project Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', overflowX: 'auto' }}>
        <Link to="/projects/audit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 600 }}>
          <Folder size={18} /> Expediente
        </Link>
        <Link to="/projects/monitoring" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <BarChart size={18} /> Seguimiento Trimestral
        </Link>
        <Link to="/thesis/traceability" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <Activity size={18} /> Trazabilidad
        </Link>
        <Link to="/projects/assign" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <Users size={18} /> Asignar Jurados
        </Link>
        <Link to="/projects/evaluate" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <ClipboardList size={18} /> Evaluar (Rúbrica)
        </Link>
      </div>

      {/* Main Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        
        {/* Left Column - Document Repository */}
        <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Folder size={20} /> Repositorio de Documentos</h3>
            <Badge style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>VERSIÓN FINAL 1.0</Badge>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--on-surface-variant)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Documento</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--on-surface-variant)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Subido Por</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--on-surface-variant)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <FileText size={24} color="#dc2626" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Proyecto_Inicial_Firmado.pdf</div>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>ID: 442-PRO-01</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Investigador</td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>08/06/2026<br/>10:25</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <FileText size={24} color="#dc2626" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Resolución_Decanatura_RD045.pdf</div>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>ID: 442-RES-45</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Decano</td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>20/06/2026<br/>09:35</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <FileText size={24} color="#2563eb" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Evidencia_Avance_Q1.docx</div>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>ID: 442-EVI-Q1</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Docente</td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>15/07/2026<br/>14:20</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <FileText size={24} color="#dc2626" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Anexo_Presupuestario_Final.pdf</div>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>ID: 442-ANX-09</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Coordinador</td>
                <td style={{ padding: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>22/07/2026<br/>11:15</td>
              </tr>
            </tbody>
          </table>
          <div style={{ padding: '24px', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} color="#16a34a" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--on-surface)' }}>Integridad de documentos verificada</div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  mediante Blockchain <span style={{ border: '1px solid var(--outline-variant)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>SHA-256 Verified</span>
                </div>
              </div>
            </div>
            <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>Mostrando 4 de 4 documentos firmados digitalmente.</div>
          </div>
        </div>

        {/* Right Column - Dark Audit Timeline */}
        <div style={{ backgroundColor: '#111827', color: '#e5e7eb', padding: '24px', borderLeft: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="text-title-lg" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>Auditoría</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4b5563' }} />
            </div>
          </div>
          
          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '32px', borderBottom: '1px solid #374151', paddingBottom: '12px' }}>
            READ_ONLY_SESSION // V_STAMP: 442-AUTH
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
            {/* Timeline Vertical Line */}
            <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: '0', width: '2px', backgroundColor: '#374151', zIndex: 0 }} />
            
            {/* Event 1 */}
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '32px' }}>
              <div style={{ position: 'absolute', left: '0', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '4px solid #111827' }} />
              <div className="text-caption" style={{ color: '#9ca3af', marginBottom: '8px', fontFamily: 'monospace' }}>[20/06/2026 09:30]</div>
              <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '12px', fontSize: '14px', letterSpacing: '0.05em' }}>EMISIÓN DE RESOLUCIÓN</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  <span>Usuario:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>Decano</span>
                  <span>Estado:</span> <span style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>APROBADO</span>
                  <span>TX_ID:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>0x8a92...f33b</span>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '32px' }}>
              <div style={{ position: 'absolute', left: '0', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#4b5563', border: '4px solid #111827' }} />
              <div className="text-caption" style={{ color: '#9ca3af', marginBottom: '8px', fontFamily: 'monospace' }}>[12/06/2026 11:10]</div>
              <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '12px', fontSize: '14px', letterSpacing: '0.05em' }}>APROBACIÓN DERIVACIÓN</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  <span>Usuario:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>Director Inv.</span>
                  <span>IP:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>192.168.1.104</span>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '32px' }}>
              <div style={{ position: 'absolute', left: '0', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#4b5563', border: '4px solid #111827' }} />
              <div className="text-caption" style={{ color: '#9ca3af', marginBottom: '8px', fontFamily: 'monospace' }}>[09/06/2026 15:40]</div>
              <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '12px', fontSize: '14px', letterSpacing: '0.05em' }}>REVISIÓN CONFORME</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  <span>Usuario:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>Coord. GINSOFT</span>
                  <span>Acción:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>CHECKLIST_OK</span>
                </div>
              </div>
            </div>

            {/* Event 4 */}
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '32px' }}>
              <div style={{ position: 'absolute', left: '0', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#4b5563', border: '4px solid #111827' }} />
              <div className="text-caption" style={{ color: '#9ca3af', marginBottom: '8px', fontFamily: 'monospace' }}>[08/06/2026 10:25]</div>
              <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '12px', fontSize: '14px', letterSpacing: '0.05em' }}>REGISTRO INICIAL</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  <span>Usuario:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>Docente Inv.</span>
                  <span>Ref:</span> <span style={{ textAlign: 'right', color: '#e5e7eb' }}>INIT_UPLOAD</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            IMMUTABLE SYSTEM ACTIVE
          </div>
        </div>

      </div>
    </div>
  );
};
