import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getGroupByUser, getGroupLines } = vi.hoisted(() => ({
  getGroupByUser: vi.fn(),
  getGroupLines: vi.fn(),
}));

vi.mock('../../services/researchService', () => ({
  researchService: { getGroupByUser, getGroupLines },
}));

import { UserDetailsModal } from './UserDetailsModal';

const user = {
  id: 'u1',
  dni: '12345678',
  roleCode: 'DOCENTE',
  roleDescription: 'Docente',
  firstNames: 'Ana',
  lastNames: 'Lopez',
  institutionalEmail: 'ana@unas.edu.pe',
  phone: '999999999',
  status: 'ACTIVE',
  active: true,
  createdAt: '2026-01-15T00:00:00Z',
} as any;

describe('UserDetailsModal', () => {
  beforeEach(() => {
    getGroupByUser.mockReset();
    getGroupLines.mockReset();
  });

  it('no renderiza nada cuando esta cerrado', () => {
    const { container } = render(<UserDetailsModal user={user} open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada cuando no hay usuario', () => {
    const { container } = render(<UserDetailsModal user={null} open onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra los datos del usuario y mensaje de sin grupo', async () => {
    getGroupByUser.mockResolvedValue(null);
    render(<UserDetailsModal user={user} open onClose={() => {}} />);
    expect(await screen.findByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@unas.edu.pe')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no research group assigned/i)).toBeInTheDocument());
  });

  it('muestra grupo y lineas cuando existen', async () => {
    getGroupByUser.mockResolvedValue({ id: 'g1', groupCode: 'G1', groupName: 'Grupo A' });
    getGroupLines.mockResolvedValue([{ id: 'l1', lineCode: 'L1', lineName: 'Linea 1', active: true }]);
    render(<UserDetailsModal user={user} open onClose={() => {}} />);
    expect(await screen.findByText('Grupo A')).toBeInTheDocument();
    expect(await screen.findByText(/L1 · Linea 1/)).toBeInTheDocument();
  });

  it('llama onClose al hacer click en cerrar', async () => {
    getGroupByUser.mockResolvedValue(null);
    const onClose = vi.fn();
    render(<UserDetailsModal user={user} open onClose={onClose} />);
    const buttons = await screen.findAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });
});
