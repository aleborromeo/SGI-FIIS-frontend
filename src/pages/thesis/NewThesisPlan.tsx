import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Save,
  X,
  AlertCircle,
  GraduationCap,
  User,
  BookOpen,
  Users,
  Upload,
  CheckCircle,
  FileText,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import { api } from '../../services/api';
import { researchService } from '../../services/researchService';
import { documentService } from '../../services/documentService';
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
  idDocumentoActual: number;
  idAsesor?: number;
}

export const NewThesisPlan: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('thesis');
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

  const [idDocumentoActual, setIdDocumentoActual] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

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
      setErrorMsg(t('thesis:planForm.validation.titleMinLength')); return false;
    }
    if (formData.resumen.trim().length < 10) {
      setErrorMsg(t('thesis:planForm.validation.summaryMinLength')); return false;
    }
    if (!formData.idLinea) {
      setErrorMsg(t('thesis:planForm.validation.lineRequired')); return false;
    }
    if (!formData.idGrupo) {
      setErrorMsg(t('thesis:planForm.validation.groupRequired')); return false;
    }
    if (!idDocumentoActual) {
      setErrorMsg(t('thesis:planForm.validation.documentRequired')); return false;
    }
    return true;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension !== 'PDF' && extension !== 'DOC' && extension !== 'DOCX') {
      setErrorMsg(t('thesis:planForm.validation.invalidFormat'));
      return;
    }

    try {
      setUploadingFile(true);
      setErrorMsg('');
      const res = await documentService.upload(file);
      setIdDocumentoActual(res.id);
      setFileName(file.name);
    } catch (err: any) {
      setErrorMsg(err.message || t('thesis:planForm.validation.uploadError'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: CreateThesisPlanPayload = {
        tituloTesis: formData.tituloTesis,
        resumen: formData.resumen,
        idLinea: Number(formData.idLinea),
        idGrupo: Number(formData.idGrupo),
        idDocumentoActual: idDocumentoActual!,
      };
      if (formData.idAsesor) payload.idAsesor = Number(formData.idAsesor);

      await api.post('/thesis/plans', payload);
      navigate('/thesis/plans');
    } catch (err: any) {
      setErrorMsg(err.message || t('thesis:planForm.errorSave'));
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
            {t('thesis:planForm.title')}
          </h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>
            {t('thesis:planForm.subtitle')}
          </p>
        </div>
        <Link to="/thesis/plans">
          <Button variant="secondary" icon={<X size={16} />}>{t('thesis:planForm.cancel')}</Button>
        </Link>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '20px' }}>
          <Alert title={t('thesis:planForm.reviewInfo')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          </Alert>
        </div>
      )}

      {loadingCatalogs ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
          {t('thesis:planForm.loadingForm')}
        </div>
      ) : (
        <>
          {/* Datos del plan */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                {t('thesis:planForm.thesisInfo')}
              </h2>
            </CardHeader>
            <CardContent>
              <Input
                label={t('thesis:planForm.thesisTitle')}
                placeholder={t('thesis:planForm.thesisTitlePlaceholder')}
                value={formData.tituloTesis}
                onChange={e => handleChange('tituloTesis', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <Textarea
                label={t('thesis:planForm.academicSummary')}
                placeholder={t('thesis:planForm.academicSummaryPlaceholder')}
                rows={5}
                value={formData.resumen}
                onChange={e => handleChange('resumen', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <div className="form-row" style={{ gap: '16px' }}>
                <Select
                  label={t('thesis:planForm.researchLine')}
                  value={formData.idLinea}
                  onChange={e => handleChange('idLinea', e.target.value)}
                  options={[
                    { value: '', label: t('thesis:planForm.selectLine') },
                    ...lines.map(l => ({ value: String(l.id), label: l.lineName })),
                  ]}
                />
                <Select
                  label={t('thesis:planForm.researchGroup')}
                  value={formData.idGrupo}
                  onChange={e => handleChange('idGrupo', e.target.value)}
                  options={[
                    { value: '', label: t('thesis:planForm.selectGroup') },
                    ...groups.map(g => ({ value: String(g.id), label: g.groupName })),
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documento adjunto (RNF-07: obligatorio) */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                {t('thesis:planForm.documentCard')}
              </h2>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                {t('thesis:planForm.documentSubtitle')}
              </p>
            </CardHeader>
            <CardContent>
              <div style={{
                border: '1px dashed var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                backgroundColor: 'var(--surface-container-low)',
                textAlign: 'center',
              }}>
                <input
                  type="file"
                  id="thesis-plan-file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploadingFile || loading}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--on-surface-variant)',
                  }}>
                    <Upload size={22} />
                  </div>
                  <label
                    htmlFor="thesis-plan-file"
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {uploadingFile ? t('thesis:planForm.uploadingFile') : t('thesis:planForm.selectFile')}
                  </label>
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                    {t('thesis:planForm.allowedFormats')}
                  </span>

                  {fileName && idDocumentoActual && (
                    <div style={{
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
                    }}>
                      <CheckCircle size={15} />
                      <span>{fileName}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asesor */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                {t('thesis:planForm.advisorCard')}
              </h2>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                {t('thesis:planForm.advisorSubtitle')}
              </p>
            </CardHeader>
            <CardContent>
              {docentes.length === 0 ? (
                <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  {t('thesis:planForm.noDocentes')}
                </p>
              ) : (
                <Select
                  label={t('thesis:planForm.selectAdvisor')}
                  value={formData.idAsesor}
                  onChange={e => handleChange('idAsesor', e.target.value)}
                  options={[
                    { value: '', label: t('thesis:planForm.noAdvisor') },
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
                    {t('thesis:planForm.selectedAdvisor')}{' '}
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
              <Button variant="secondary">{t('thesis:planForm.cancel')}</Button>
            </Link>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSubmit}
              disabled={loading || uploadingFile}
            >
              {loading ? t('thesis:planForm.submitting') : t('thesis:planForm.submit')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewThesisPlan;
