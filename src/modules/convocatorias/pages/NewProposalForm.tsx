import { useEffect, useState, useCallback, useContext } from 'react';
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
import { Save, ArrowRight, ArrowLeft, Send, Info, AlertTriangle, FileText } from 'lucide-react';

import { AuthContext } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { projectService } from '../../../services/projectService';
import { researchService, type ResearchLine, type ResearchGroup } from '../../../services/researchService';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useEligibility } from '../hooks/useEligibility';
import { ConvocatoriaSelect } from '../components/ConvocatoriaSelect';
import { EligibilityGate } from '../components/EligibilityGate';
import { ProposalMembersSection } from '../components/ProposalMembersSection';
import { FileUploadSection } from '../components/FileUploadSection';
import { PROJECT_TYPES, PROPOSAL_FIELD_LABELS } from '../validators/proposal.schema';
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

const STEPS = ['Datos Generales', 'Detalles de Investigación', 'Equipo', 'Documento', 'Revisión'];

interface ProposalMember {
  userId: number;
  userFirstNames: string;
  userLastNames: string;
  userEmail: string;
  role: string;
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
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const confirm = useConfirm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: convocatorias = [], isLoading: loadingCalls } = useConvocatorias();

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
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
  const watchedValues = watch([
    'convocatoriaId', 'researchGroupId', 'researchLineId', 'projectType',
    'title', 'abstract', 'generalObjective', 'specificObjectives',
    'methodology', 'expectedResults', 'budget', 'executionPlace',
    'startDate', 'endDate', 'recibeApoyoFif',
  ]);

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
        return await trigger(['convocatoriaId', 'researchGroupId', 'researchLineId', 'title', 'executionPlace', 'recibeApoyoFif']);
      case 1:
        return await trigger(['abstract', 'generalObjective', 'budget', 'startDate', 'endDate']);
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
      const budget = Number(formData.budget) || undefined;
      await projectService.create({
        title: formData.title || 'Borrador sin título',
        summary: buildSummary(formData),
        generalObjective: formData.generalObjective || '',
        ...(researchLineId ? { researchLineId } : {}),
        ...(budget ? { budget } : {}),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        executionPlace: formData.executionPlace || '',
        ...(researchGroupId ? { researchGroupId } : {}),
        callId: formData.convocatoriaId ? Number(formData.convocatoriaId) : undefined,
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
    const confirmed = await confirm({
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
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Postular Proyecto de Investigación
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={560}>
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

  if (loadingCatalogs || loadingCalls) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando datos del formulario...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 960, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: 2, mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
            Postular Proyecto de Investigación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { xs: '100%', sm: 560 } }}>
            Completa los pasos a continuación para registrar tu propuesta de investigación.
          </Typography>
        </Box>
        <Link to="/projects" style={{ textDecoration: 'none' }} onClick={async (e) => {
          if (isDirty || members.length > 0 || documentId) {
            e.preventDefault();
            const confirmed = await confirm({
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
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Paso {activeStep + 1} de {STEPS.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1 }}>
            {STEPS.map((_, i) => (
              <Box
                key={i}
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
              title={<Typography variant="h6" fontWeight={700}>Datos Generales</Typography>}
              subheader="Información básica del proyecto de investigación"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <ConvocatoriaSelect
                  control={control}
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
              title={<Typography variant="h6" fontWeight={700}>Detalles de Investigación</Typography>}
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
              title={<Typography variant="h6" fontWeight={700}>Equipo de Investigación</Typography>}
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
              title={<Typography variant="h6" fontWeight={700}>Documento Principal</Typography>}
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
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Revisión de la Propuesta</Typography>}
              subheader="Verifica la información antes de enviar al Coordinador de grupo"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FileText size={18} color="var(--primary)" />
                <Typography variant="subtitle1" fontWeight={700}>Resumen de la Propuesta</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Código</Typography>
                  <Typography variant="body2" fontWeight={600}>Se generará automáticamente (PRJ-YYYY-XXXX)</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Estado</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    <Chip label="Pendiente de Coordinador" size="small" color="warning" sx={{ fontWeight: 600 }} />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Convocatoria</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {activeConvocatorias.find((c) => String(c.id) === watchedValues.convocatoriaId)?.title || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Grupo de Investigación</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {groups.find((g) => String(g.id) === watchedValues.researchGroupId)?.groupName || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Línea de Investigación</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {filteredLines.find((l) => String(l.id) === watchedValues.researchLineId)?.lineName || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Tipo de Proyecto</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {PROJECT_TYPES.find((t) => t.value === watchedValues.projectType)?.label || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Recibe Apoyo FIF</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {watchedValues.recibeApoyoFif === 'SI' ? 'Sí' : watchedValues.recibeApoyoFif === 'NO' ? 'No' : '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Título</Typography>
                  <Typography variant="body2" fontWeight={600}>{watchedValues.title || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Resumen Ejecutivo</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{watchedValues.abstract || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Objetivo General</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{watchedValues.generalObjective || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Objetivos Específicos</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{watchedValues.specificObjectives || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Metodología</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{watchedValues.methodology || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Resultados Esperados</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{watchedValues.expectedResults || '—'}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
                  <Typography variant="body2" fontWeight={600}>S/ {watchedValues.budget || '0.00'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Lugar de Ejecución</Typography>
                  <Typography variant="body2" fontWeight={600}>{watchedValues.executionPlace || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Fecha de Inicio</Typography>
                  <Typography variant="body2" fontWeight={600}>{watchedValues.startDate || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Fecha de Fin</Typography>
                  <Typography variant="body2" fontWeight={600}>{watchedValues.endDate || '—'}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Equipo de Investigación</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {members.length > 0 ? `${members.length} miembro(s)` : 'Sin miembros adicionales'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Documento Adjunto</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {documentName || (documentId ? 'Documento cargado' : 'Sin documento')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
