import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Divider,
  Autocomplete,
  TextField,
  Chip,
  Fade,
} from '@mui/material';
import { Trash2, Users, Search, UserPlus } from 'lucide-react';
import { researchService, type GroupMember } from '../../../services/researchService';
import { useConfirm } from '../../../context/ConfirmContext';

interface ProposalMember {
  userId: number;
  userFirstNames: string;
  userLastNames: string;
  userEmail: string;
  role: string;
}

interface ProposalMembersSectionProps {
  groupId: string;
  members: ProposalMember[];
  onChange: (members: ProposalMember[]) => void;
}

const ROLE_OPTIONS = [
  { value: 'INVESTIGADOR_PRINCIPAL', label: 'Investigador Principal' },
  { value: 'COINVESTIGADOR', label: 'Coinvestigador' },
  { value: 'COLABORADOR', label: 'Colaborador' },
  { value: 'ASESOR', label: 'Asesor' },
];

export function ProposalMembersSection({ groupId, members, onChange }: ProposalMembersSectionProps) {
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);
  const [addingRole, setAddingRole] = useState('COINVESTIGADOR');
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!groupId) {
      setGroupMembers([]);
      return;
    }
    setLoadingMembers(true);
    researchService.getMembers(Number(groupId))
      .then((data) => setGroupMembers(data.filter((m) => m.active)))
      .catch(() => setGroupMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [groupId]);

  const availableMembers = useMemo(
    () => groupMembers.filter((gm) => !members.some((m) => m.userId === gm.userId)),
    [groupMembers, members],
  );

  const selectedMember = useMemo(
    () => availableMembers.find((gm) => gm.userId === addingUserId) || null,
    [availableMembers, addingUserId],
  );

  const handleAdd = useCallback(() => {
    if (addingUserId === null) {
      setError('Selecciona un miembro del grupo.');
      return;
    }
    const member = groupMembers.find((gm) => gm.userId === addingUserId);
    if (!member) return;

    if (members.some((m) => m.userId === member.userId)) {
      setError('Este miembro ya está en el equipo.');
      return;
    }

    onChange([
      ...members,
      {
        userId: member.userId,
        userFirstNames: member.userFirstNames,
        userLastNames: member.userLastNames,
        userEmail: member.userEmail,
        role: addingRole,
      },
    ]);
    setAddingUserId(null);
    setAddingRole('COINVESTIGADOR');
    setSearchValue('');
    setError('');
  }, [addingUserId, addingRole, groupMembers, members, onChange]);

  const handleRemove = useCallback(async (userId: number) => {
    const member = members.find((m) => m.userId === userId);
    const name = member ? `${member.userFirstNames} ${member.userLastNames}` : '';
    const confirmed = await confirm({
      title: 'Eliminar miembro del equipo',
      message: `¿Estás seguro de eliminar a ${name} del equipo de investigación?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (confirmed) {
      onChange(members.filter((m) => m.userId !== userId));
    }
  }, [members, onChange, confirm]);

  const handleRoleChange = useCallback((userId: number, newRole: string) => {
    onChange(members.map((m) => m.userId === userId ? { ...m, role: newRole } : m));
  }, [members, onChange]);

  if (!groupId) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Selecciona un grupo de investigación para agregar miembros al equipo.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Users size={20} color="var(--primary)" aria-hidden="true" />
        <Typography variant="h6" fontWeight={700}>
          Equipo de Investigación
        </Typography>
        {members.length > 0 && (
          <Chip
            label={`${members.length} miembro(s)`}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, ml: 1 }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Busca y agrega los integrantes del grupo que participarán en este proyecto.
      </Typography>

      {members.length > 0 && (
        isMobile ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {members.map((m) => (
              <Fade in key={m.userId}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {m.userFirstNames} {m.userLastNames}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          {m.userEmail}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemove(m.userId)} aria-label={`Eliminar a ${m.userFirstNames}`}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rol</InputLabel>
                      <Select
                        label="Rol"
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} width={200}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} width={60} align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.userId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {m.userFirstNames} {m.userLastNames}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {m.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Rol</InputLabel>
                        <Select
                          label="Rol"
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemove(m.userId)} aria-label={`Eliminar a ${m.userFirstNames}`}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {members.length > 0 && <Divider sx={{ my: 2 }} />}

      {availableMembers.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Autocomplete
            fullWidth
            size="small"
            options={availableMembers}
            getOptionLabel={(option) => `${option.userFirstNames} ${option.userLastNames} — ${option.userEmail}`}
            isOptionEqualToValue={(option, value) => option.userId === value.userId}
            value={selectedMember}
            onChange={(_, newValue) => {
              setAddingUserId(newValue?.userId ?? null);
              setError('');
            }}
            inputValue={searchValue}
            onInputChange={(_, newInputValue) => setSearchValue(newInputValue)}
            loading={loadingMembers}
            noOptionsText="No se encontraron miembros"
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.userId}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {option.userFirstNames} {option.userLastNames}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.userEmail}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar miembro por nombre o correo"
                placeholder="Escribe para buscar..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <Search size={18} sx={{ mr: 0.5, color: 'text.disabled' }} />
                  ),
                }}
              />
            )}
            sx={{ minWidth: isMobile ? '100%' : 320 }}
          />
          <FormControl sx={{ minWidth: isMobile ? '100%' : 180 }} size="small">
            <InputLabel>Rol</InputLabel>
            <Select
              label="Rol"
              value={addingRole}
              onChange={(e) => setAddingRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={handleAdd}
            disabled={addingUserId === null}
            sx={{ textTransform: 'none', height: 40, width: isMobile ? '100%' : 'auto', fontWeight: 600 }}
          >
            Agregar
          </Button>
        </Box>
      ) : (
        members.length === 0 && !loadingMembers && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No hay miembros disponibles en este grupo para agregar al proyecto.
          </Alert>
        )
      )}

      {availableMembers.length === 0 && members.length > 0 && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
          Todos los miembros activos del grupo ya han sido agregados al equipo.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
