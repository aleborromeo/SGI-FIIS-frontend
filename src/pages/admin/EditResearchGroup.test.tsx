import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { EditResearchGroup } from './EditResearchGroup';
import { researchService } from '../../services/researchService';

const mockGetGroupById = vi.hoisted(() => vi.fn());
const mockUpdateGroup = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroupById: mockGetGroupById,
    updateGroup: mockUpdateGroup,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/groups/1/edit']}>
        <Routes>
          <Route path="/groups/:id/edit" element={<EditResearchGroup />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );

describe('EditResearchGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and shows the group data', async () => {
    mockGetGroupById.mockResolvedValue({ id: 1, groupCode: 'GI-01', groupName: 'Grupo IA' });
    renderPage();

    expect(await screen.findByDisplayValue('GI-01')).toBeDefined();
    expect(screen.getByDisplayValue('Grupo IA')).toBeDefined();
  });

  it('updates the group via the form', async () => {
    mockGetGroupById.mockResolvedValue({ id: 1, groupCode: 'GI-01', groupName: 'Grupo IA' });
    mockUpdateGroup.mockResolvedValue({ id: 1, groupCode: 'GI-01', groupName: 'Grupo Editado' });
    renderPage();

    const nameInput = await screen.findByDisplayValue('Grupo IA');
    fireEvent.change(nameInput, { target: { value: 'Grupo Editado' } });

    const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() => expect(mockUpdateGroup).toHaveBeenCalledWith(1, { groupCode: 'GI-01', groupName: 'Grupo Editado' }));
  });

  it('shows an error when the group cannot be loaded', async () => {
    mockGetGroupById.mockRejectedValue(new Error('fallo'));
    renderPage();
    expect(await screen.findByText(/No se pudo cargar el grupo/i)).toBeDefined();
  });
});
