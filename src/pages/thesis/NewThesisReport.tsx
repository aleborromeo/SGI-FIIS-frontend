import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { thesisService } from '../../services/thesisService';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/common/Spinner';

export const NewThesisReport: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [loadingPlan, setLoadingPlan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [tituloFinal, setTituloFinal] = useState('');
  const [idDocumentoTesis, setIdDocumentoTesis] = useState<number | null>(null);

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      if (!planId) return;
      try {
        setLoadingPlan(true);
        const data = await thesisService.getPlanById(planId);
        setPlan(data);
        // Pre-poblar el título final con el título del plan aprobado
        const pTitle = data.title || '';
        setTituloFinal(pTitle);
      } catch (err: any) {
        toast.error(err.message || 'Error al cargar los datos del plan de tesis.');
        setErrorMsg('No se pudo encontrar el plan de tesis especificado.');
      } finally {
        setLoadingPlan(false);
      }
    }
    fetchPlan();
  }, [planId, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension !== 'PDF' && extension !== 'DOC' && extension !== 'DOCX') {
      toast.error('Solo se permiten archivos en formato PDF, DOC o DOCX.');
      return;
    }

    try {
      setUploadingFile(true);
      const res = await documentService.upload(file);
      setIdDocumentoTesis(res.id);
      setFileName(file.name);
      toast.success('Archivo de tesis cargado exitosamente.');
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el archivo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!planId) return;
    if (!tituloFinal.trim()) {
      toast.error('Debe ingresar el título final de la tesis.');
      return;
    }
    if (idDocumentoTesis === null) {
      toast.error('Es obligatorio cargar el documento final de la tesis.');
      return;
    }

    try {
      setSubmitting(true);
      await thesisService.createReport({
        idPlanTesis: Number(planId),
        tituloFinal: tituloFinal.trim(),
        idDocumentoTesis: idDocumentoTesis,
      } as any);

      toast.success('Informe de tesis final registrado y enviado para revisión.');
      navigate(`/thesis/plan/${planId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al registrar el informe.');
      toast.error(err.message || 'Error al guardar el informe de tesis.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Spinner size="large" />
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Cargando datos del plan de tesis...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <strong>Error:</strong> {errorMsg || 'No se encontró el plan de tesis especificado.'}
        </div>
        <Button onClick={() => navigate('/thesis/plans')}>Volver a Planes de Tesis</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate(`/thesis/plan/${planId}`)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--on-surface-variant)',
          fontWeight: 600,
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={18} />
        Volver a Trazabilidad de Tesis
      </button>

      <div
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(26, 54, 93, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
              Registrar Informe de Tesis Final
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0, marginTop: '2px' }}>
              Suba y envíe el borrador final de su tesis una vez aprobado el plan correspondiente.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '24px 0' }} />

        {errorMsg && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={20} />
            <div>
              <strong>Error:</strong> {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Fila 1: Título Final de la Tesis */}
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              Título Final de la Tesis *
            </label>
            <input
              type="text"
              id="input-thesis-final-title"
              value={tituloFinal}
              onChange={e => setTituloFinal(e.target.value)}
              required
              placeholder="Ingrese el título definitivo de su investigación"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '15px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '4px' }}>
              Puede modificar el título original del plan si hubo variaciones en la tesis final.
            </span>
          </div>

          {/* Fila 2: Carga del Archivo de Tesis */}
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              Subir Archivo de la Tesis Completa *
            </label>
            <div
              style={{
                border: '1px dashed var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                backgroundColor: 'var(--surface-container-low)',
                textAlign: 'center',
              }}
            >
              <input
                type="file"
                id="attached-thesis-file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploadingFile || submitting}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <Upload size={22} />
                </div>
                <label
                  htmlFor="attached-thesis-file"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {uploadingFile ? 'Cargando archivo...' : 'Seleccione el archivo de tesis'}
                </label>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  Formatos permitidos: PDF, DOC, DOCX (Máx. 10MB)
                </span>

                {fileName && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--surface-container-lowest)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #d1fae5',
                      color: '#065f46',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={15} />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px',
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '20px',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              icon={<X size={16} />}
              onClick={() => navigate(`/thesis/plan/${planId}`)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              disabled={submitting || uploadingFile}
            >
              {submitting ? 'Enviando...' : 'Enviar Tesis'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
