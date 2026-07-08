import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Upload, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { researchService } from '../../services/researchService';
import type { ResearchLine, ResearchGroup } from '../../services/researchService';

export const NewProposal: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'proyecto',
    researchLineId: '',
    researchGroupId: '',
    title: '',
    abstract: '',
    generalObjective: '',
    budget: '',
    startDate: '',
    endDate: '',
    executionPlace: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [linesData, groupsData] = await Promise.all([
          researchService.getLines(true),
          researchService.getGroups()
        ]);
        setLines(linesData || []);
        // En una implementación real, filtraríamos solo los grupos a los que pertenece el investigador actual
        setGroups(groupsData || []);
      } catch (err: any) {
        console.error('Error fetching catalogs', err);
        setErrorMsg('Error al cargar catálogos. Inténtalo nuevamente.');
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(''); // clear error when typing
  };

  const handleSubmit = async () => {
    if (!formData.researchLineId) {
      setErrorMsg('Por favor seleccione una línea de investigación.');
      return;
    }
    if (!formData.researchGroupId) {
      setErrorMsg('Por favor seleccione un grupo de investigación.');
      return;
    }
    if (!formData.title || formData.title.length < 5) {
      setErrorMsg('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setErrorMsg('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    if (!formData.budget || isNaN(Number(formData.budget))) {
      setErrorMsg('El presupuesto debe ser un número válido.');
      return;
    }
    if (!formData.executionPlace) {
      setErrorMsg('El lugar de ejecución es obligatorio.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (formData.type === 'proyecto') {
        await projectService.create({
          title: formData.title,
          summary: formData.abstract || 'Sin resumen',
          generalObjective: formData.generalObjective || 'Sin objetivo general',
          researchLineId: Number(formData.researchLineId),
          budget: Number(formData.budget),
          startDate: formData.startDate,
          endDate: formData.endDate,
          executionPlace: formData.executionPlace,
          researchGroupId: Number(formData.researchGroupId)
        });
        navigate('/projects');
      } else {
        // Lógica de tesis (por ahora se redirige o se lanza un error porque la API puede no estar lista igual)
        setErrorMsg('El plan de tesis aún no está disponible.');
      }
    } catch (error: any) {
      console.error('Error creating proposal', error);
      const msg = error.message || '';
      if (msg.includes('Error interno del servidor') || msg.includes('500')) {
          setErrorMsg('Ocurrió un problema en el servidor. Asegúrese de pertenecer al grupo seleccionado y de que los datos sean válidos.');
      } else {
          setErrorMsg(msg || 'Error al crear la propuesta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">Nueva Propuesta</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Registra un nuevo plan de tesis o proyecto de investigación.</p>
        </div>
        <Link to="/projects">
          <Button variant="secondary" icon={<X size={18} />}>Cancelar</Button>
        </Link>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {loadingCatalogs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando catálogos...</div>
      ) : (
        <>
          <Card style={{ marginBottom: '32px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Datos Generales</h2>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Select 
                  label="Tipo de Propuesta" 
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  options={[
                    { value: 'proyecto', label: 'Proyecto de Investigación' },
                    { value: 'tesis', label: 'Plan de Tesis' }
                  ]} 
                />
                <Select 
                  label="Línea de Investigación" 
                  value={formData.researchLineId}
                  onChange={(e) => handleChange('researchLineId', e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione una línea...' },
                    ...lines.map(l => ({ value: l.id.toString(), label: l.lineName }))
                  ]} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Select 
                  label="Grupo de Investigación" 
                  value={formData.researchGroupId}
                  onChange={(e) => handleChange('researchGroupId', e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione un grupo...' },
                    ...groups.map(g => ({ value: g.id.toString(), label: g.groupName }))
                  ]} 
                />
                <Input 
                  label="Lugar de Ejecución" 
                  placeholder="Ej. Laboratorio FIIS..." 
                  value={formData.executionPlace}
                  onChange={(e) => handleChange('executionPlace', e.target.value)}
                />
              </div>
              
              <Input 
                label="Título del Proyecto" 
                placeholder="Ingrese el título completo..." 
                style={{ marginBottom: '16px' }} 
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              
              <Textarea 
                label="Resumen" 
                placeholder="Breve descripción del proyecto..." 
                rows={3} 
                style={{ marginBottom: '16px' }} 
                value={formData.abstract}
                onChange={(e) => handleChange('abstract', e.target.value)}
              />

              <Textarea 
                label="Objetivo General" 
                placeholder="Objetivo principal del proyecto..." 
                rows={2} 
                style={{ marginBottom: '16px' }} 
                value={formData.generalObjective}
                onChange={(e) => handleChange('generalObjective', e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <Input 
                  label="Presupuesto (S/)" 
                  type="number"
                  placeholder="0.00" 
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                />
                <Input 
                  label="Fecha de Inicio" 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
                <Input 
                  label="Fecha de Fin" 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '32px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Documento Principal (Opcional por ahora)</h2>
            </CardHeader>
            <CardContent>
              <div style={{ 
                border: '2px dashed var(--outline-variant)', 
                borderRadius: 'var(--radius-md)', 
                padding: '48px 24px', 
                textAlign: 'center',
                backgroundColor: 'var(--surface-container-lowest)'
              }}>
                <Upload size={32} color="var(--on-surface-variant)" style={{ margin: '0 auto 16px' }} />
                <h3 className="text-title-lg" style={{ marginBottom: '8px' }}>Sube tu archivo PDF</h3>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Button variant="secondary">Seleccionar Archivo</Button>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
                {selectedFile && (
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--primary-fixed)', borderRadius: 'var(--radius-md)', color: 'var(--on-primary-fixed)' }}>
                    <strong>Archivo:</strong> {selectedFile.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Link to="/projects">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button variant="primary" icon={<Save size={18} />} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Propuesta'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

