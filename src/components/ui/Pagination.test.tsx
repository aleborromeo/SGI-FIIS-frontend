import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('no renderiza nada si totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} totalItems={5} pageSize={10} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el rango mostrando X de Y', () => {
    render(
      <Pagination currentPage={2} totalPages={5} totalItems={50} pageSize={10} onPageChange={() => {}} />
    );
    expect(screen.getByText(/11–20/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('llama onPageChange al hacer click en siguiente/anterior', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} totalItems={50} pageSize={10} onPageChange={onPageChange} />
    );
    const buttons = screen.getAllByRole('button');
    const next = buttons[buttons.length - 1];
    await userEvent.click(next);
    expect(onPageChange).toHaveBeenCalledWith(3);

    const prev = buttons[0];
    await userEvent.click(prev);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('deshabilita anterior en la primera pagina y siguiente en la ultima', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} totalItems={30} pageSize={10} onPageChange={() => {}} />
    );
    expect(screen.getAllByRole('button')[0]).toBeDisabled();

    rerender(
      <Pagination currentPage={3} totalPages={3} totalItems={30} pageSize={10} onPageChange={() => {}} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it('genera botones de pagina numericos', () => {
    render(
      <Pagination currentPage={1} totalPages={3} totalItems={30} pageSize={10} onPageChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });
});
