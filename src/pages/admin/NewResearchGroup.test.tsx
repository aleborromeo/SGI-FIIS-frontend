import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { NewResearchGroup } from './NewResearchGroup';
import { researchService } from '../../services/researchService';

const mockCreateGroup = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    createGroup: mockCreateGroup,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter>
        <NewResearchGroup />
      </MemoryRouter>
    </ToastProvider>
  );

describe('NewResearchGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title', () => {
    renderPage();
    expect(screen.getByText('Nuevo Grupo de Investigación')).toBeDefined();
  });

  it('creates a group via the form', async () => {
    mockCreateGroup.mockResolvedValue({ id: 5, groupCode: 'GI-05', groupName: 'Nuevo' });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/GI-01/), { target: { value: 'GI-05' } });
    fireEvent.change(screen.getByPlaceholderText(/Inteligencia Artificial/), { target: { value: 'Nuevo' } });

    const submit = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() => expect(mockCreateGroup).toHaveBeenCalledWith({ groupCode: 'GI-05', groupName: 'Nuevo' }));
  });
});
