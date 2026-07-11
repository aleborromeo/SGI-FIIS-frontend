import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { Plus, Trash2, Users } from 'lucide-react';
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
  const [addingUserId, setAddingUserId] = useState('');
  const [addingRole, setAddingRole] = useState('COINVESTIGADOR');
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

  const availableMembers = groupMembers.filter(
    (gm) => !members.some((m) => m.userId === gm.userId)
  );

  const handleAdd = useCallback(() => {
    if (!addingUserId) {
      setError('Selecciona un miembro del grupo.');
      return;
    }
    const member = groupMembers.find((gm) => String(gm.userId) === addingUserId);
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
    setAddingUserId('');
    setAddingRole('COINVESTIGADOR');
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Users size={20} color="var(--primary)" aria-hidden="true" />
        <Typography variant="h6" fontWeight={700}>
          Equipo de Investigación
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Agrega los integrantes del grupo que participarán en este proyecto.
      </Typography>

      {members.length > 0 && (
        isMobile ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {members.map((m) => (
              <Card key={m.userId} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {m.userFirstNames} {m.userLastNames}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
                  <TableRow key={m.userId}>
                    <TableCell>{m.userFirstNames} {m.userLastNames}</TableCell>
                    <TableCell>{m.userEmail}</TableCell>
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

      {availableMembers.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: isMobile ? '100%' : 250 }} size="small">
            <InputLabel>Agregar miembro del grupo</InputLabel>
            <Select
              label="Agregar miembro del grupo"
              value={addingUserId}
              onChange={(e) => { setAddingUserId(e.target.value); setError(''); }}
            >
              <MenuItem value="">
                <em>Selecciona un miembro...</em>
              </MenuItem>
              {availableMembers.map((gm) => (
                <MenuItem key={gm.userId} value={String(gm.userId)}>
                  {gm.userFirstNames} {gm.userLastNames} — {gm.userEmail}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={handleAdd}
            disabled={!addingUserId}
            sx={{ textTransform: 'none', height: 40, width: isMobile ? '100%' : 'auto' }}
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

      {error && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
