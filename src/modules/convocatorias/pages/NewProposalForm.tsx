import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Save, ArrowRight, ArrowLeft, Send, Info, AlertTriangle, FileText,
  Lock, CheckCircle, XCircle, Users, Calendar, DollarSign, MapPin,
  Paperclip, UserPlus, File,
} from 'lucide-react';

import { AuthContext } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { projectService } from '../../../services/projectService';
import { researchService, type ResearchLine, type ResearchGroup } from '../../../services/researchService';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { ConvocatoriaSelect } from '../components/ConvocatoriaSelect';
import { EligibilityGate } from '../components/EligibilityGate';
import { ProposalMembersSection } from '../components/ProposalMembersSection';
import { FileUploadSection } from '../components/FileUploadSection';
import { PROJECT_TYPES } from '../validators/proposal.schema';
import type { ProposalFormData } from '../types/convocatoria.types';

const GINSOFT_CODE = 'GINSOFT';

function buildSummary(data: ProposalFormData): string {
  const parts: string[] = [];
  if (data.recibeApoyoFif) parts.push(`[FIF: ${data.recibeApoyoFif === 'SI' ? 'SÍ' : 'NO'}]`);
  if (data.abstract) parts.push(`RESUMEN:\n${data.abstract}`);
  if (data.specificObjectives) parts.push(`OBJETIVOS ESPECÍFICOS:\n${data.specificObjectives}`);
  if (data.methodology) parts.push(`METODOLOGÍA:\n${data.methodology}`);
  if (data.expectedResults) parts.push(`RESULTADOS ESPERADOS:\n${data.expectedResults}`);
  if (data.projectType) {
    const label = PROJECT_TYPES.find((t) => t.value === data.projectType)?.label || data.projectType;
    parts.push(`TIPO DE PROYECTO: ${label}`);
  }
  return parts.join('\n\n');
}

interface ParsedSummary {
  abstract: string;
  specificObjectives: string;
  methodology: string;
  expectedResults: string;
  recibeApoyoFif: string;
  projectType: string;
}

function parseSummary(raw: string): ParsedSummary {
  const result: ParsedSummary = {
    abstract: '',
    specificObjectives: '',
    methodology: '',
    expectedResults: '',
    recibeApoyoFif: '',
    projectType: '',
  };

  if (!raw) return result;

  const fifMatch = raw.match(/\[FIF:\s*(S[IÍ]|NO)\]/i);
  if (fifMatch) {
    result.recibeApoyoFif = fifMatch[1].toUpperCase().includes('S') ? 'SI' : 'NO';
  }

  const sectionRegex = /^(RESUMEN|OBJETIVOS?\s+ESPEC[IÍ]FICOS?|METODOLOG[IÍ]A|RESULTADOS?\s+ESPERADOS?|TIPO\s+DE\s+PROYECTO)\s*:\s*/gim;
  const sections: { key: string; start: number; labelEnd: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(raw)) !== null) {
    const label = match[1].toUpperCase();
    let key = '';
    if (label.startsWith('RESUMEN')) key = 'abstract';
    else if (label.includes('ESPEC')) key = 'specificObjectives';
    else if (label.startsWith('METODOLOG')) key = 'methodology';
    else if (label.includes('RESULTADOS')) key = 'expectedResults';
    else if (label.includes('TIPO')) key = 'projectType';

    sections.push({ key, start: match.index, labelEnd: match.index + match[0].length });
  }

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const valueStart = sec.labelEnd;
    const valueEnd = i < sections.length - 1 ? sections[i + 1].start : raw.length;
    const chunk = raw.slice(valueStart, valueEnd).trim();

    if (sec.key === 'projectType') {
      result.projectType = PROJECT_TYPES.find((t) => t.label.toLowerCase() === chunk.toLowerCase())?.value || chunk;
    } else {
      (result as any)[sec.key] = chunk;
    }
  }

  return result;
}

const STEPS = ['Datos Generales', 'Detalles de Investigación', 'Equipo', 'Documento', 'Revisión'];

interface ProposalMember {
  userId: number;
  userFirstNames: string;
  userLastNames: string;
  userEmail: string;
  role: string;
}

function EmptyField() {
  return (
    <Typography
      variant="body2"
      component="span"
      sx={{
        color: 'text.disabled',
        fontStyle: 'italic',
        fontSize: '0.85rem',
      }}
    >
      Sin datos
    </Typography>
  );
}

export function NewProposalForm() {
  return (
    <EligibilityGate>
      <NewProposalFormInner />
    </EligibilityGate>
  );
}

function NewProposalFormInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCallId = searchParams.get('callId');
  const editDraftId = searchParams.get('editDraft');
  const toast = useToast();
  const confirm = useConfirm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: convocatorias = [], isLoading: loadingCalls } = useConvocatorias();

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingDraft, setLoadingDraft] = useState(!!editDraftId);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [members, setMembers] = useState<ProposalMember[]>([]);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [isGinsoft, setIsGinsoft] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty }, trigger } = useForm<ProposalFormData>({
    defaultValues: {
      convocatoriaId: urlCallId || '',
      researchGroupId: '',
      researchLineId: '',
      title: '',
      abstract: '',
      generalObjective: '',
      specificObjectives: '',
      methodology: '',
      expectedResults: '',
      projectType: '',
      budget: '',
      startDate: '',
      endDate: '',
      executionPlace: '',
      recibeApoyoFif: '',
    },
  });

  const watchedGroupId = watch('researchGroupId');
  const watchedValues = watch();

  useEffect(() => {
    if (urlCallId && convocatorias.some((c) => String(c.id) === urlCallId)) {
      setValue('convocatoriaId', urlCallId);
    } else if (convocatorias.length > 0 && !watch('convocatoriaId')) {
      setValue('convocatoriaId', String(convocatorias[0].id));
    }
  }, [urlCallId, convocatorias, setValue, watch]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [linesData, groupsData] = await Promise.all([
          researchService.getLines(true),
          researchService.getGroups(),
        ]);
        setLines(linesData || []);
        setFilteredLines(linesData || []);
        setGroups(groupsData || []);
      } catch {
        toast.error('Error al cargar catálogos del sistema.');
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (!watchedGroupId) {
      setFilteredLines(lines);
      setIsGinsoft(false);
      return;
    }
    const selectedGroup = groups.find((g) => String(g.id) === watchedGroupId);
    setIsGinsoft(selectedGroup?.groupCode === GINSOFT_CODE);

    let cancelled = false;
    researchService.getGroupLines(Number(watchedGroupId)).then((groupLines) => {
      if (!cancelled) {
        setFilteredLines(groupLines && groupLines.length > 0 ? groupLines : lines);
      }
    }).catch(() => {
      if (!cancelled) setFilteredLines(lines);
    });
    return () => { cancelled = true; };
  }, [watchedGroupId, groups, lines]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || members.length > 0 || documentId) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, members.length, documentId]);

  useEffect(() => {
    if (!editDraftId || loadingCatalogs || loadingCalls) return;

    let cancelled = false;

    const loadDraft = async () => {
      try {
        setLoadingDraft(true);
        const draft = await projectService.getById(editDraftId);
        if (cancelled) return;

        setValue('title', draft.title || '');
        setValue('generalObjective', draft.generalObjective || '');

        const parsed = parseSummary(draft.abstract || draft.summary || '');
        setValue('abstract', draft.abstract || parsed.abstract);
        setValue('specificObjectives', draft.specificObjectives || parsed.specificObjectives);
        setValue('methodology', draft.methodology || parsed.methodology);
        setValue('expectedResults', draft.expectedResults || parsed.expectedResults);
        setValue('projectType', draft.projectType || parsed.projectType);
        setValue('recibeApoyoFif', draft.recibeApoyoFif || parsed.recibeApoyoFif);
        setValue('budget', draft.budget != null ? String(draft.budget) : '');
        setValue('startDate', draft.startDate || '');
        setValue('endDate', draft.endDate || '');
        setValue('executionPlace', draft.executionPlace || '');

        if (draft.researchGroupId) {
          setValue('researchGroupId', String(draft.researchGroupId));
        }
        if (draft.researchLineId) {
          setValue('researchLineId', String(draft.researchLineId));
        }
        if (draft.callId) {
          setValue('convocatoriaId', String(draft.callId));
        }

        if (draft.documentId) {
          setDocumentId(draft.documentId);
          setDocumentName(draft.documentName || 'Documento cargado');
        }

        if (draft.members && draft.members.length > 0) {
          setMembers(
            draft.members.map((m) => ({
              userId: m.userId,
              role: m.role,
              userFirstNames: (m as any).userFirstNames || '',
              userLastNames: (m as any).userLastNames || '',
              userEmail: (m as any).userEmail || '',
            }))
          );
        }
      } catch {
        toast.error('No se pudo cargar el borrador. Verifica que aún exista.');
      } finally {
        setLoadingDraft(false);
      }
    };

    loadDraft();
    return () => { cancelled = true; };
  }, [editDraftId, loadingCatalogs, loadingCalls, setValue, toast]);

  const activeConvocatorias = convocatorias.filter((c) => {
    const today = new Date().toISOString().split('T')[0];
    const statusMatch = String(c.status).toUpperCase() === 'ABIERTA';
    const isStarted = c.startDate ? c.startDate <= today : true;
    const isNotEnded = c.endDate ? c.endDate >= today : true;
    return statusMatch && isStarted && isNotEnded;
  });

  const noConvocatorias = !loadingCalls && activeConvocatorias.length === 0;

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger(['convocatoriaId', 'researchGroupId', 'researchLineId', 'title', 'projectType', 'executionPlace', 'recibeApoyoFif']);
      case 1:
        return await trigger(['abstract', 'generalObjective', 'specificObjectives', 'methodology', 'expectedResults', 'budget', 'startDate', 'endDate']);
      case 2:
        if (members.length === 0) {
          toast.warning('Debes agregar al menos un miembro al equipo de investigación.');
          return false;
        }
        return true;
      case 3:
        if (!documentId) {
          toast.warning('Debes subir al menos un documento (anteproyecto) para continuar.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const valid = await validateStep(activeStep);
    if (valid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const formData = watch();
      const researchLineId = Number(formData.researchLineId) || undefined;
      const researchGroupId = Number(formData.researchGroupId) || undefined;
      const budget = Number(formData.budget) || 0;
      const today = new Date().toISOString().split('T')[0];
      await projectService.create({
        title: formData.title || 'Borrador sin título',
        summary: buildSummary(formData),
        generalObjective: formData.generalObjective || '',
        ...(researchLineId ? { researchLineId } : {}),
        budget,
        startDate: formData.startDate || today,
        endDate: formData.endDate || today,
        executionPlace: formData.executionPlace || '',
        ...(researchGroupId ? { researchGroupId } : {}),
        callId: formData.convocatoriaId ? Number(formData.convocatoriaId) : undefined,
        documentId: documentId || undefined,
        members: members.length > 0 ? members.map((m) => ({ userId: m.userId, role: m.role })) : undefined,
        draft: true,
      });
      toast.success('Borrador guardado correctamente.');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el borrador.');
    } finally {
      setSavingDraft(false);
    }
  };

  const onSubmitFinal = async (data: ProposalFormData) => {
    const confirmed = await confirm.confirmDialog({
      title: 'Enviar propuesta a Coordinador',
      message: '¿Estás seguro de enviar esta propuesta? El Coordinador de grupo será notificado para su revisión.',
      confirmText: 'Enviar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await projectService.create({
        title: data.title,
        summary: buildSummary(data),
        generalObjective: data.generalObjective,
        researchLineId: Number(data.researchLineId),
        budget: Number(data.budget),
        startDate: data.startDate,
        endDate: data.endDate,
        executionPlace: data.executionPlace,
        researchGroupId: Number(data.researchGroupId),
        callId: data.convocatoriaId ? Number(data.convocatoriaId) : undefined,
        documentId: documentId || undefined,
        members: members.map((m) => ({ userId: m.userId, role: m.role })),
        draft: false,
      });
      toast.success('Propuesta enviada correctamente al Coordinador de grupo.');
      navigate('/projects');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar la propuesta.');
    } finally {
      setSubmitting(false);
    }
  };

  const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 1.5 } };

  if (noConvocatorias) {
    return (
      <Box sx={{ p: 3, width: '100%', maxWidth: 900, mx: 'auto', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
              {editDraftId ? 'Editar Borrador' : 'Postular Proyecto de Investigación'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
              Registra la información de tu propuesta de investigación para iniciar el flujo de revisión institucional.
            </Typography>
          </Box>
          <Link to="/projects" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" sx={{ textTransform: 'none' }}>Volver</Button>
          </Link>
        </Box>
        <Alert severity="warning" icon={<AlertTriangle />} sx={{ borderRadius: 2, mb: 3 }}>
          <AlertTitle>Sin convocatorias disponibles</AlertTitle>
          En este momento no existen convocatorias de investigación abiertas en la FIIS. No es posible registrar nuevas propuestas.
        </Alert>
      </Box>
    );
  }

  if (loadingCatalogs || loadingCalls || loadingDraft) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {loadingDraft ? 'Cargando borrador...' : 'Cargando datos del formulario...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%', maxWidth: 960, mx: 'auto', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: 2, mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }} gutterBottom>
            {editDraftId ? 'Editar Borrador' : 'Postular Proyecto de Investigación'}
                    </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { xs: '100%', sm: 560 } }}>
            {editDraftId
              ? 'Completa los pasos para finalizar y enviar tu propuesta de investigación.'
              : 'Completa los pasos a continuación para registrar tu propuesta de investigación.'}
          </Typography>
        </Box>
        <Link to="/projects" style={{ textDecoration: 'none' }} onClick={async (e) => {
          if (isDirty || members.length > 0 || documentId) {
            e.preventDefault();
            const confirmed = await confirm.confirmDialog({
              title: 'Cambios sin guardar',
              message: 'Tienes cambios sin guardar. Si sales ahora, perderás todo el progreso. ¿Estás seguro?',
              confirmText: 'Salir sin guardar',
              cancelText: 'Seguir editando',
            });
            if (confirmed) navigate('/projects');
          }
        }}>
          <Button variant="outlined" fullWidth={isMobile} sx={{ textTransform: 'none' }} disabled={submitting}>Cancelar</Button>
        </Link>
      </Box>

      {isMobile ? (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Paso {activeStep + 1} de {STEPS.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1 }}>
            {STEPS.map((stepName, i) => (
              <Box
                key={stepName}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: i <= activeStep ? 'primary.main' : 'action.disabledBackground',
                  transition: 'bgcolor 0.2s',
                }}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <form onSubmit={handleSubmit(onSubmitFinal)}>
        {/* STEP 0: Datos Generales */}
        {activeStep === 0 && (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Datos Generales</Typography>}
              subheader="Información básica del proyecto de investigación"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <ConvocatoriaSelect
                  control={control as any}
                  convocatorias={activeConvocatorias}
                  error={errors.convocatoriaId}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="researchGroupId"
                    control={control}
                    rules={{ required: 'Selecciona un grupo de investigación' }}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Grupo de Investigación *</InputLabel>
                        <Select label="Grupo de Investigación *" {...field}>
                          <MenuItem value=""><em>Selecciona un grupo...</em></MenuItem>
                          {groups.map((g) => (
                            <MenuItem key={g.id} value={String(g.id)}>{g.groupName}</MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="researchLineId"
                    control={control}
                    rules={{ required: 'Selecciona una línea de investigación' }}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Línea de Investigación *</InputLabel>
                        <Select label="Línea de Investigación *" {...field}>
                          <MenuItem value=""><em>Selecciona una línea...</em></MenuItem>
                          {filteredLines.map((l) => (
                            <MenuItem key={l.id} value={String(l.id)}>{l.lineName}</MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>

              {isGinsoft && (
                <Alert severity="info" icon={<Info />} sx={{ mb: 2, borderRadius: 1.5 }}>
                  <strong>Grupo GINSOFT detectado:</strong> Las líneas de investigación disponibles están restringidas a <strong>Computación</strong> e <strong>Ingeniería de Software</strong>.
                </Alert>
              )}

              <Controller
                name="title"
                control={control}
                rules={{ required: 'El título es obligatorio', minLength: { value: 5, message: 'Mínimo 5 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    label="Título del Proyecto *"
                    placeholder="Ingresa el título completo del proyecto..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Controller
                name="projectType"
                control={control}
                rules={{ required: 'Selecciona un tipo de proyecto' }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error} sx={{ mb: 2 }}>
                    <InputLabel>Tipo de Proyecto *</InputLabel>
                    <Select label="Tipo de Proyecto *" {...field}>
                      <MenuItem value=""><em>Selecciona un tipo...</em></MenuItem>
                      {PROJECT_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="recibeApoyoFif"
                control={control}
                rules={{ required: 'Indica si recibe apoyo FIF' }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error} sx={{ mb: 2 }}>
                    <InputLabel>¿Recibirá apoyo FIF? *</InputLabel>
                    <Select label="¿Recibirá apoyo FIF? *" {...field}>
                      <MenuItem value=""><em>Selecciona una opción...</em></MenuItem>
                      <MenuItem value="SI">Sí</MenuItem>
                      <MenuItem value="NO">No</MenuItem>
                    </Select>
                    {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="executionPlace"
                control={control}
                rules={{ required: 'Ingresa el lugar de ejecución' }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    label="Lugar de Ejecución *"
                    placeholder="Ej. Laboratorio FIIS - Piso 3"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={textFieldSx}
                    {...field}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* STEP 1: Detalles de Investigación */}
        {activeStep === 1 && (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Detalles de Investigación</Typography>}
              subheader="Describe el contenido y planificación del proyecto"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Controller
                name="abstract"
                control={control}
                rules={{ required: 'El resumen es obligatorio', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resumen Ejecutivo *"
                    placeholder="Breve descripción del proyecto de investigación..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Controller
                name="generalObjective"
                control={control}
                rules={{ required: 'El objetivo general es obligatorio', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Objetivo General *"
                    placeholder="Objetivo principal del proyecto..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Controller
                name="specificObjectives"
                control={control}
                rules={{ required: 'Los objetivos específicos son obligatorios', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Objetivos Específicos *"
                    placeholder="Describe los objetivos específicos del proyecto..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Controller
                name="methodology"
                control={control}
                rules={{ required: 'La metodología es obligatoria', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Metodología *"
                    placeholder="Describe la metodología que se empleará..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Controller
                name="expectedResults"
                control={control}
                rules={{ required: 'Los resultados esperados son obligatorios', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resultados Esperados *"
                    placeholder="Describe los resultados esperados del proyecto..."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2, ...textFieldSx }}
                    {...field}
                  />
                )}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="budget"
                    control={control}
                    rules={{
                      required: 'El presupuesto es obligatorio',
                      validate: (v) => Number(v) > 0 || 'Debe ser mayor a 0',
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        type="number"
                        label="Presupuesto (S/) *"
                        placeholder="0.00"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={textFieldSx}
                        {...field}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} />
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: 'Fecha de inicio obligatoria' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Inicio *"
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={textFieldSx}
                        {...field}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{
                      required: 'Fecha de fin obligatoria',
                      validate: (value, formValues) => {
                        if (formValues.startDate && new Date(value) < new Date(formValues.startDate)) {
                          return 'No puede ser anterior a la fecha de inicio';
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Fin *"
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={textFieldSx}
                        {...field}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Equipo de Investigación */}
        {activeStep === 2 && (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Equipo de Investigación</Typography>}
              subheader="Integrantes del grupo que participarán en el proyecto"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <ProposalMembersSection
                groupId={watchedGroupId}
                members={members}
                onChange={setMembers}
              />
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Documento Principal */}
        {activeStep === 3 && (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Documento Principal</Typography>}
              subheader="Adjunta el archivo de tu propuesta. Formatos permitidos: PDF, DOC, DOCX. Máximo 10 MB."
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <FileUploadSection
                documentId={documentId}
                onChange={(id, name) => { setDocumentId(id); setDocumentName(name); }}
              />
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Revisión */}
        {activeStep === 4 && (

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Page Header */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                Revisión de la Propuesta
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Verifica la información antes de enviar al Coordinador de grupo
              </Typography>
            </Box>

            {/* ── SECCIÓN 1: Datos Generales ── */}
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              <Box
                sx={{
                  px: 3, py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: 'primary.main', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Info size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Datos Generales</Typography>
                  <Typography variant="caption" color="text.secondary">Identificación y clasificación del proyecto</Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Row: Status + Code */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {/* Status Badge */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="body2" color="#b45309" sx={{ fontWeight: 600 }}>
                      Pendiente de Coordinador
                    </Typography>
                  </Box>

                  {/* Auto-generated Code */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: 'grey.50',
                      border: '1px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Lock size={14} color="var(--on-surface-variant, #666)" />
                    <Typography variant="body2" color="text.secondary">
                      PRJ-YYYY-XXXX
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                      (autogenerado)
                    </Typography>
                  </Box>
                </Box>

                {/* Grid: metadata fields */}
                <Grid container spacing={2.5}>
                  {[
                    {
                      label: 'Convocatoria',
                      value: activeConvocatorias.find((c) => String(c.id) === watchedValues.convocatoriaId)?.title,
                    },
                    {
                      label: 'Grupo de Investigación',
                      value: groups.find((g) => String(g.id) === watchedValues.researchGroupId)?.groupName,
                    },
                    {
                      label: 'Línea de Investigación',
                      value: filteredLines.find((l) => String(l.id) === watchedValues.researchLineId)?.lineName,
                    },
                    {
                      label: 'Tipo de Proyecto',
                      value: PROJECT_TYPES.find((t) => t.value === watchedValues.projectType)?.label,
                    },
                  ].map((item) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25, lineHeight: 1.6, wordBreak: 'break-word', fontWeight: 600 }}>
                        {item.value || <EmptyField />}
                      </Typography>
                    </Grid>
                  ))}

                  {/* FIF - special display */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Recibe Apoyo FIF
                    </Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {watchedValues.recibeApoyoFif === 'SI' ? (
                        <>
                          <CheckCircle size={16} color="#16a34a" />
                          <Typography variant="body2" color="#16a34a" sx={{ fontWeight: 600 }}>Sí, recibe apoyo</Typography>
                        </>
                      ) : watchedValues.recibeApoyoFif === 'NO' ? (
                        <>
                          <XCircle size={16} color="#dc2626" />
                          <Typography variant="body2" color="#dc2626" sx={{ fontWeight: 600 }}>No recibe apoyo</Typography>
                        </>
                      ) : (
                        <EmptyField />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── SECCIÓN 2: Detalles del Proyecto ── */}
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              <Box
                sx={{
                  px: 3, py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: 'info.main', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <FileText size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Detalles del Proyecto</Typography>
                  <Typography variant="caption" color="text.secondary">Contenido técnico y académico de la propuesta</Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Title */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Título del Proyecto
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, lineHeight: 1.6, wordBreak: 'break-word', fontWeight: 600 }}>
                    {watchedValues.title || <EmptyField />}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Abstract */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Resumen Ejecutivo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.75,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      color: 'text.primary',
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {watchedValues.abstract || <EmptyField />}

                  </Typography>
                </Box>

                {/* Objectives - side by side on desktop */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Objetivo General
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.75, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {watchedValues.generalObjective || <EmptyField />}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Objetivos Específicos
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.75, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {watchedValues.specificObjectives || <EmptyField />}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />


                {/* Methodology - separate section below */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Metodología
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(25, 118, 210, 0.03)',
                      border: '1px solid',
                      borderColor: 'rgba(25, 118, 210, 0.12)',
                    }}
                  >
                    {watchedValues.methodology || <EmptyField />}
                  </Typography>
                </Box>

                {/* Expected Results */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Resultados Esperados

                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.75,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {watchedValues.expectedResults || <EmptyField />}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* ── SECCIÓN 3: Finanzas y Cronograma ── */}
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              <Box
                sx={{
                  px: 3, py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: 'success.main', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <DollarSign size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Finanzas y Cronograma</Typography>
                  <Typography variant="caption" color="text.secondary">Presupuesto, lugar y fechas de ejecución</Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Budget - highlighted card */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(22, 163, 74, 0.04)',
                    border: '1px solid',
                    borderColor: 'rgba(22, 163, 74, 0.2)',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 48, height: 48, borderRadius: 2,
                      bgcolor: 'rgba(22, 163, 74, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <DollarSign size={24} color="#16a34a" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Presupuesto Total
                    </Typography>
                    <Typography variant="h5" color="#16a34a" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                      S/ {Number(watchedValues.budget || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>

                {/* Place + Dates grid */}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <MapPin size={13} color="var(--on-surface-variant, #666)" />
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Lugar de Ejecución
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, wordBreak: 'break-word', fontWeight: 600 }}>
                      {watchedValues.executionPlace || <EmptyField />}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Calendar size={13} color="var(--on-surface-variant, #666)" />
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Fecha de Inicio
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 600 }}>
                      {watchedValues.startDate
                        ? new Date(watchedValues.startDate + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                        : <EmptyField />}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Calendar size={13} color="var(--on-surface-variant, #666)" />
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Fecha de Fin
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 600 }}>
                      {watchedValues.endDate
                        ? new Date(watchedValues.endDate + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                        : <EmptyField />}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── SECCIÓN 4: Equipo y Archivos ── */}
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              <Box
                sx={{
                  px: 3, py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: '#7c3aed', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Users size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Equipo y Archivos</Typography>
                  <Typography variant="caption" color="text.secondary">Miembros del equipo y documento adjunto</Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Team Members */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Equipo de Investigación
                  </Typography>

                  {members.length > 0 ? (
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {members.map((member) => (
                        <Box
                          key={member.userId}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <Box
                            sx={{
                              width: 32, height: 32, borderRadius: '50%',
                              bgcolor: 'primary.main', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700,
                            }}
                          >
                            {member.userFirstNames?.[0]}{member.userLastNames?.[0]}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                              {member.userFirstNames} {member.userLastNames}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                              {member.userEmail}
                            </Typography>
                          </Box>
                          <Chip
                            label={member.role}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(124, 58, 237, 0.08)',
                              color: '#7c3aed',
                              border: '1px solid rgba(124, 58, 237, 0.2)',
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Sin miembros adicionales
                    </Typography>
                  )}

                  <Button
                    variant="text"
                    size="small"
                    startIcon={<UserPlus size={15} />}
                    disabled
                    sx={{
                      mt: 1.5,
                      textTransform: 'none',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&.Mui-disabled': { color: 'text.disabled' },
                    }}
                  >
                    Añadir otro miembro
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Attached Document */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Documento Adjunto
                  </Typography>

                  {documentName || documentId ? (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40, height: 40, borderRadius: 1.5,
                          bgcolor: 'rgba(220, 38, 38, 0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <File size={20} color="#dc2626" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {documentName || 'Documento cargado'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Anteproyecto · PDF
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label="Cargado"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: 'grey.300',
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Paperclip size={16} color="var(--on-surface-variant, #999)" />
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Sin documento adjunto
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

          </Box>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                startIcon={<ArrowLeft />}
                onClick={handleBack}
                disabled={submitting || savingDraft}
                sx={{ textTransform: 'none' }}
              >
                Anterior
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={savingDraft ? <CircularProgress size={16} color="inherit" /> : <Save />}
              onClick={handleSaveDraft}
              disabled={submitting || savingDraft}
              sx={{ textTransform: 'none' }}
            >
              Guardar Borrador
            </Button>
          </Box>

          <Box>
            {activeStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowRight />}
                onClick={handleNext}
                disabled={submitting || savingDraft}
                sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
                disabled={submitting || savingDraft}
                sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                {submitting ? 'Enviando...' : 'Enviar a Coordinador'}
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
}


