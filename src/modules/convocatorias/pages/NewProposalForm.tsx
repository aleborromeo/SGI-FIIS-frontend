import { useEffect, useState, useCallback, useRef, useContext } from 'react';
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
  Snackbar,
  Box,
  CircularProgress,
} from '@mui/material';
import { Save, Upload, Trash2, Info, AlertTriangle } from 'lucide-react';

import { AuthContext } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { researchService, type ResearchLine, type ResearchGroup } from '../../../services/researchService';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useEligibility } from '../hooks/useEligibility';
import { ConvocatoriaSelect } from '../components/ConvocatoriaSelect';
import type { ProposalFormData } from '../types/convocatoria.types';

const GINSOFT_CODE = 'GINSOFT';
const GINSOFT_ALLOWED_LINES = ['computación', 'ingeniería de software'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function isGinsoftLine(lineName: string): boolean {
  return GINSOFT_ALLOWED_LINES.some((kw) => lineName.toLowerCase().includes(kw));
}

function validateFileExtension(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function NewProposalForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCallId = searchParams.get('callId');
  const { user } = useContext(AuthContext);

  const { data: convocatorias = [], isLoading: loadingCalls } = useConvocatorias();
  const { data: eligibility, isLoading: loadingEligibility } = useEligibility();

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<ResearchLine[]>([]);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGinsoft, setIsGinsoft] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProposalFormData>({
    defaultValues: {
      convocatoriaId: '',
      researchGroupId: '',
      researchLineId: '',
      title: '',
      abstract: '',
      generalObjective: '',
      budget: '',
      startDate: '',
      endDate: '',
      executionPlace: '',
    },
  });

  const watchedGroupId = watch('researchGroupId');

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
        setSnackbar({ open: true, message: 'Error al cargar catálogos.', severity: 'error' });
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
    if (selectedGroup?.groupCode === GINSOFT_CODE) {
      setIsGinsoft(true);
      const restricted = lines.filter((l) => isGinsoftLine(l.lineName));
      setFilteredLines(restricted);
    } else {
      setIsGinsoft(false);
      setFilteredLines(lines);
    }
  }, [watchedGroupId, groups, lines]);

  const processFile = useCallback((file: File) => {
    setFileError('');
    if (!validateFileExtension(file)) {
      setFileError(`Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onSubmit = async (data: ProposalFormData) => {
    setSubmitting(true);
    try {
      await projectService.create({
        title: data.title,
        summary: data.abstract,
        generalObjective: data.generalObjective,
        researchLineId: Number(data.researchLineId),
        budget: Number(data.budget),
        startDate: data.startDate,
        endDate: data.endDate,
        executionPlace: data.executionPlace,
        researchGroupId: Number(data.researchGroupId),
        callId: Number(data.convocatoriaId),
      });
      navigate('/projects');
    } catch (err: any) {
      const msg = err.message || 'Error al registrar la propuesta.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const noConvocatorias = !loadingCalls && convocatorias.length === 0;
  const isFormDisabled = noConvocatorias || loadingEligibility;

  const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 1.5 } };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Nueva Propuesta de Proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={560}>
            Registra la información de tu propuesta de investigación para iniciar el flujo de revisión institucional.
          </Typography>
        </Box>
        <Link to="/projects" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" sx={{ textTransform: 'none' }}>Cancelar</Button>
        </Link>
      </Box>

      {noConvocatorias && (
        <Alert severity="warning" icon={<AlertTriangle />} sx={{ borderRadius: 2, mb: 3 }}>
          <AlertTitle>Convocatorias no disponibles</AlertTitle>
          En este momento no existen convocatorias de investigación activas en la FIIS.
        </Alert>
      )}

      {loadingCatalogs || loadingCalls || loadingEligibility ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cargando datos del formulario...
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Datos Generales</Typography>}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <ConvocatoriaSelect
                  control={control}
                  convocatorias={convocatorias}
                  error={errors.convocatoriaId}
                  disabled={isFormDisabled}
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
                        <InputLabel>{isGinsoft ? 'Línea (restringida GINSOFT) *' : 'Línea de Investigación *'}</InputLabel>
                        <Select label={isGinsoft ? 'Línea (restringida GINSOFT) *' : 'Línea de Investigación *'} {...field}>
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
                name="abstract"
                control={control}
                rules={{ required: 'El resumen es obligatorio', minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resumen *"
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
                    rows={3}
                    label="Objetivo General *"
                    placeholder="Objetivo principal del proyecto..."
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
                </Grid>
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

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Documento Principal</Typography>}
              subheader="Adjunta el archivo de tu propuesta. Formatos permitidos: PDF, DOC, DOCX."
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 1.5 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragOver ? 'primary.main' : fileError ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 5,
                  textAlign: 'center',
                  bgcolor: isDragOver ? 'primary.50' : 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Upload sx={{ fontSize: 36, mx: 'auto', mb: 1.5, color: isDragOver ? 'primary.main' : 'text.disabled' }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo o haz clic para seleccionar'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF, DOC o DOCX — sin límite de tamaño
                </Typography>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
              </Box>

              {fileError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {fileError}
                </Typography>
              )}

              {selectedFile && !fileError && (
                <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ fontSize: 18 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{selectedFile.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Typography>
                    </Box>
                  </Box>
                  <Button size="small" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    <Trash2 size={16} />
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" disabled={submitting}>Cancelar</Button>
            </Link>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
              disabled={submitting || noConvocatorias}
              sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              {submitting ? 'Guardando...' : 'Registrar Propuesta'}
            </Button>
          </Box>
        </form>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
