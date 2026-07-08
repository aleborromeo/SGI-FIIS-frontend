import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Save,
  Upload,
  X,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

type ProposalType = '' | 'TESIS' | 'PROYECTO';

interface ProposalForm {
  type: ProposalType;
  researchLineId: string;
  title: string;
  summary: string;
  generalObjective: string;
  budget: string;
  startDate: string;
  endDate: string;
  executionPlace: string;
  fileName: string;
}

const initialForm: ProposalForm = {
  type: '',
  researchLineId: '',
  title: '',
  summary: '',
  generalObjective: '',
  budget: '',
  startDate: '',
  endDate: '',
  executionPlace: '',
  fileName: '',
};

export const NewProposal: React.FC = () => {
  const [formData, setFormData] = useState<ProposalForm>(initialForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(field: keyof ProposalForm, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  }

  function validateForm(): boolean {
    if (!formData.type) {
      setErrorMsg('Seleccione el tipo de propuesta.');
      return false;
    }

    if (!formData.researchLineId) {
      setErrorMsg('Seleccione una línea de investigación.');
      return false;
    }

    if (formData.title.trim().length < 5) {
      setErrorMsg('El título debe tener al menos 5 caracteres.');
      return false;
    }

    if (formData.summary.trim().length < 10) {
      setErrorMsg('El resumen debe tener al menos 10 caracteres.');
      return false;
    }

    if (formData.generalObjective.trim().length < 10) {
      setErrorMsg('El objetivo general debe tener al menos 10 caracteres.');
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      setErrorMsg('Registre la fecha de inicio y la fecha de finalización.');
      return false;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMsg('La fecha de finalización no puede ser anterior a la fecha de inicio.');
      return false;
    }

    if (!formData.executionPlace.trim()) {
      setErrorMsg('Ingrese el lugar de ejecución.');
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccessMsg(
        'Propuesta preparada correctamente. La integración de envío real al backend queda pendiente de validación final.'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSaveDraft() {
    if (!formData.title.trim()) {
      setErrorMsg('Ingrese al menos el título para guardar el borrador.');
      return;
    }

    setSuccessMsg('Borrador preparado en la vista. Pendiente integración con backend.');
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      handleChange('fileName', '');
      return;
    }

    handleChange('fileName', file.name);
  }

  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '64px',
        maxWidth: '980px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="text-headline-lg">Nueva propuesta</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
              maxWidth: '720px',
            }}
          >
            Registra la información base de un plan de tesis o proyecto de investigación
            para iniciar su revisión académica.
          </p>
        </div>

        <Link to="/projects">
          <Button variant="secondary" icon={<X size={18} />}>
            Cancelar
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Revisa la información ingresada">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          </Alert>
        </div>
      )}

      {successMsg && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Propuesta lista">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          </Alert>
        </div>
      )}

      <Card style={{ marginBottom: '28px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Datos generales</h2>
        </CardHeader>

        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <Select
              label="Tipo de propuesta"
              value={formData.type}
              onChange={(event) => handleChange('type', event.target.value as ProposalType)}
              options={[
                { value: '', label: 'Seleccione un tipo...' },
                { value: 'TESIS', label: 'Plan de tesis' },
                { value: 'PROYECTO', label: 'Proyecto de investigación' },
              ]}
            />

            <Select
              label="Línea de investigación"
              value={formData.researchLineId}
              onChange={(event) => handleChange('researchLineId', event.target.value)}
              options={[
                { value: '', label: 'Seleccione una línea...' },
                { value: '1', label: 'Ingeniería de Software' },
                { value: '2', label: 'Inteligencia Artificial' },
                { value: '3', label: 'Sistemas de Información' },
                { value: '4', label: 'Seguridad de la Información' },
              ]}
            />
          </div>

          <Input
            label="Título de la propuesta"
            placeholder="Ingrese el título completo..."
            style={{ marginTop: '16px' }}
            value={formData.title}
            onChange={(event) => handleChange('title', event.target.value)}
          />

          <Textarea
            label="Resumen"
            placeholder="Describa brevemente la propuesta..."
            rows={4}
            style={{ marginTop: '16px' }}
            value={formData.summary}
            onChange={(event) => handleChange('summary', event.target.value)}
          />

          <Textarea
            label="Objetivo general"
            placeholder="Ingrese el objetivo general de la investigación..."
            rows={3}
            style={{ marginTop: '16px' }}
            value={formData.generalObjective}
            onChange={(event) => handleChange('generalObjective', event.target.value)}
          />
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '28px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Planificación</h2>
        </CardHeader>

        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <Input
              label="Presupuesto estimado"
              placeholder="Ejemplo: 2500"
              type="number"
              value={formData.budget}
              onChange={(event) => handleChange('budget', event.target.value)}
            />

            <Input
              label="Lugar de ejecución"
              placeholder="Ejemplo: FIIS - UNAS"
              value={formData.executionPlace}
              onChange={(event) => handleChange('executionPlace', event.target.value)}
            />

            <Input
              label="Fecha de inicio"
              type="date"
              value={formData.startDate}
              onChange={(event) => handleChange('startDate', event.target.value)}
            />

            <Input
              label="Fecha de finalización"
              type="date"
              value={formData.endDate}
              onChange={(event) => handleChange('endDate', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '28px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Documento principal</h2>
        </CardHeader>

        <CardContent>
          <div
            style={{
              border: '2px dashed var(--outline-variant)',
              borderRadius: 'var(--radius-md)',
              padding: '42px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--surface-container-lowest)',
            }}
          >
            <Upload
              size={34}
              color="var(--on-surface-variant)"
              style={{ margin: '0 auto 16px' }}
            />

            <h3 className="text-title-lg" style={{ marginBottom: '8px' }}>
              Adjunta el documento de la propuesta
            </h3>

            <p
              className="text-body-md"
              style={{
                color: 'var(--on-surface-variant)',
                marginBottom: '24px',
              }}
            >
              Selecciona el archivo principal en formato PDF, DOC o DOCX.
            </p>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="secondary" icon={<FileText size={16} />}>
                Seleccionar archivo
              </Button>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </div>

            <p
              className="text-caption"
              style={{
                marginTop: '16px',
                color: 'var(--on-surface-variant)',
              }}
            >
              Tamaño máximo sugerido: 10 MB.
            </p>

            {formData.fileName && (
              <div
                style={{
                  marginTop: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--primary-fixed)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                }}
              >
                <FileText size={16} />
                {formData.fileName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
        }}
      >
        <Button variant="secondary" onClick={handleSaveDraft}>
          Guardar borrador
        </Button>

        <Button
          variant="primary"
          icon={<Save size={18} />}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Preparando...' : 'Enviar propuesta'}
        </Button>
      </div>
    </div>
  );
};

export default NewProposal;