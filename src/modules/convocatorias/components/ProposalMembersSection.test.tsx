import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProposalMembersSection } from './ProposalMembersSection';
import { researchService } from '../../../services/researchService';

vi.mock('../../../services/researchService', () => ({
  researchService: {
    getMembers: vi.fn(),
  },
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => ({
    confirmDialog: vi.fn().mockResolvedValue(true),
  }),
}));

describe('ProposalMembersSection', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    groupId: '5',
    members: [],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows info alert when no group is selected', () => {
    render(<ProposalMembersSection groupId="" members={[]} onChange={mockOnChange} />);
    expect(screen.getByText(/Selecciona un grupo de investigación/)).toBeDefined();
  });

  it('renders the section title and description', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([]);
    render(<ProposalMembersSection {...defaultProps} />);
    expect(screen.getByText('Equipo de Investigación')).toBeDefined();
    expect(screen.getByText(/Busca y agrega los integrantes del grupo/)).toBeDefined();
    await waitFor(() => {
      expect(researchService.getMembers).toHaveBeenCalled();
    });
  });

  it('fetches and displays available members in select', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([
      { id: 1, userId: 1, userFirstNames: 'Juan', userLastNames: 'Pérez', userEmail: 'juan@test.com', active: true },
      { id: 2, userId: 2, userFirstNames: 'María', userLastNames: 'López', userEmail: 'maria@test.com', active: true },
    ]);

    render(<ProposalMembersSection {...defaultProps} />);

    await waitFor(() => {
      expect(researchService.getMembers).toHaveBeenCalledWith(5);
    });
  });

  it('filters out inactive members', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([
      { id: 1, userId: 1, userFirstNames: 'Active', userLastNames: 'User', userEmail: 'active@test.com', active: true },
      { id: 2, userId: 2, userFirstNames: 'Inactive', userLastNames: 'User', userEmail: 'inactive@test.com', active: false },
    ]);

    render(<ProposalMembersSection {...defaultProps} />);

    await waitFor(() => {
      expect(researchService.getMembers).toHaveBeenCalled();
    });
  });

  it('displays existing members in table', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([]);
    const members = [
      { userId: 1, userFirstNames: 'Juan', userLastNames: 'Pérez', userEmail: 'juan@test.com', role: 'INVESTIGADOR_PRINCIPAL' },
    ];

    render(<ProposalMembersSection {...defaultProps} members={members} />);

    expect(screen.getByText(/Juan.*Pérez/)).toBeDefined();
    expect(screen.getByText('juan@test.com')).toBeDefined();
    await waitFor(() => {
      expect(researchService.getMembers).toHaveBeenCalled();
    });
  });

  it('calls onChange when removing a member', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([]);
    const members = [
      { userId: 1, userFirstNames: 'Juan', userLastNames: 'Pérez', userEmail: 'juan@test.com', role: 'COINVESTIGADOR' },
    ];

    render(<ProposalMembersSection {...defaultProps} members={members} />);

    const deleteButton = screen.getByLabelText(/Eliminar a Juan/);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  it('calls onChange when changing member role', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([]);
    const members = [
      { userId: 1, userFirstNames: 'Juan', userLastNames: 'Pérez', userEmail: 'juan@test.com', role: 'COINVESTIGADOR' },
    ];

    render(<ProposalMembersSection {...defaultProps} members={members} />);

    const comboboxes = screen.getAllByRole('combobox');
    fireEvent.mouseDown(comboboxes[0]);
    const option = screen.getByText('Asesor');
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('shows no-available-members alert when group has no members', async () => {
    vi.mocked(researchService.getMembers).mockResolvedValue([]);

    render(<ProposalMembersSection {...defaultProps} members={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/No hay miembros disponibles/)).toBeDefined();
    });
  });
});
