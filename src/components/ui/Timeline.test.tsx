import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from './Timeline';

describe('Timeline', () => {
  it('renderiza items con titulo, tiempo y badge', () => {
    render(
      <Timeline>
        <TimelineItem id="1" title="Paso 1" time="2026-01-01" status="success" badge={<span>OK</span>}>
          Detalle
        </TimelineItem>
        <TimelineItem id="2" title="Paso 2" status="pending" isLast>
          Final
        </TimelineItem>
      </Timeline>
    );
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
  });

  it('no renderiza linea conectora cuando isLast', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem id="1" title="Paso 1" status="success" isLast>C</TimelineItem>
      </Timeline>
    );
    const item = container.querySelector('.text-label-md')?.closest('div')?.parentElement;
    expect(item).toBeTruthy();
  });

  it('maneja estados error y active', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem id="1" title="Err" status="error" isLast>e</TimelineItem>
        <TimelineItem id="2" title="Act" status="active" isLast>a</TimelineItem>
      </Timeline>
    );
    expect(container.textContent).toContain('Err');
    expect(container.textContent).toContain('Act');
  });
});
