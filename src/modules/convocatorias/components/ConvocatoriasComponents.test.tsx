import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { ConvocatoriaCard } from './ConvocatoriaCard';
import { ConvocatoriaSelect } from './ConvocatoriaSelect';
import { ConvocatoriasEmpty } from './ConvocatoriasEmpty';
import { ConvocatoriasSkeleton } from './ConvocatoriasSkeleton';
import { EligibilityWarning } from './EligibilityWarning';

const convocatoria = {
  id: 10,
  title: 'Beca de Investigación 2026',
  description: 'Convocatoria dirigida a docentes.',
  targetAudience: 'DOCENTES' as const,
  startDate: '2026-03-01',
  endDate: '2026-04-30',
};

describe('ConvocatoriaCard', () => {
  it('renderiza titulo, fechas y boton de postular cuando es elegible', async () => {
    const onPostular = vi.fn();
    render(<ConvocatoriaCard convocatoria={convocatoria} eligible onPostular={onPostular} />);
    expect(screen.getByText('Beca de Investigación 2026')).toBeInTheDocument();
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();
    const btn = screen.getByRole('button');
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(onPostular).toHaveBeenCalledWith(convocatoria);
  });

  it('deshabilita el boton cuando no es elegible', () => {
    render(<ConvocatoriaCard convocatoria={convocatoria} eligible={false} onPostular={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ConvocatoriaSelect', () => {
  function Wrapper({ convocatorias, error, disabled }: any) {
    const { control } = useForm();
    return <ConvocatoriaSelect control={control} convocatorias={convocatorias} error={error} disabled={disabled} />;
  }

  it('renderiza la etiqueta y los items de convocatoria', () => {
    render(<Wrapper convocatorias={[convocatoria, { ...convocatoria, id: 11, title: 'Otra' }]} />);
    expect(screen.getAllByText(/Convocatoria/).length).toBeGreaterThan(0);
  });

  it('muestra el mensaje de error', () => {
    render(<Wrapper convocatorias={[]} error={{ message: 'Campo requerido' } as any} />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });
});

describe('ConvocatoriasEmpty', () => {
  it('muestra el mensaje de vacio', () => {
    render(<ConvocatoriasEmpty />);
    expect(screen.getByText(/no existen convocatorias activas/i)).toBeInTheDocument();
  });
});

describe('ConvocatoriasSkeleton', () => {
  it('renderiza la cantidad de tarjetas indicada', () => {
    const { container } = render(<ConvocatoriasSkeleton count={4} />);
    expect(container.querySelectorAll('.MuiCard-root').length).toBe(4);
  });
});

describe('EligibilityWarning', () => {
  it('no muestra nada cuando hay grupo y convocatorias vigentes', () => {
    const { container } = render(<EligibilityWarning hasActiveGroup hasVigentCalls />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra aviso cuando no hay grupo activo', () => {
    render(<EligibilityWarning hasActiveGroup={false} hasVigentCalls />);
    expect(screen.getByText(/no habilitado para postular/i)).toBeInTheDocument();
    expect(screen.getByText(/grupo de investigación activo/i)).toBeInTheDocument();
  });

  it('muestra aviso cuando no hay convocatorias vigentes', () => {
    render(<EligibilityWarning hasActiveGroup hasVigentCalls={false} />);
    expect(screen.getByText(/convocatorias abiertas y vigentes/i)).toBeInTheDocument();
  });
});
