import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from './Timeline';

describe('Timeline & TimelineItem', () => {
  it('renders Timeline items with correct title, status styles, and child nodes', () => {
    render(
      <Timeline>
        <TimelineItem id="1" title="First Node" time="10:00 AM" status="success">
          <p>Success Detail</p>
        </TimelineItem>
        <TimelineItem id="2" title="Second Node" time="11:00 AM" status="error">
          <p>Error Detail</p>
        </TimelineItem>
        <TimelineItem id="3" title="Third Node" time="12:00 PM" status="active">
          <p>Active Detail</p>
        </TimelineItem>
        <TimelineItem id="4" title="Fourth Node" status="pending" isLast={true}>
          <p>Pending Detail</p>
        </TimelineItem>
      </Timeline>
    );

    expect(screen.getByText('First Node')).toBeDefined();
    expect(screen.getByText('10:00 AM')).toBeDefined();
    expect(screen.getByText('Success Detail')).toBeDefined();

    expect(screen.getByText('Second Node')).toBeDefined();
    expect(screen.getByText('11:00 AM')).toBeDefined();
    expect(screen.getByText('Error Detail')).toBeDefined();

    expect(screen.getByText('Third Node')).toBeDefined();
    expect(screen.getByText('12:00 PM')).toBeDefined();
    expect(screen.getByText('Active Detail')).toBeDefined();

    expect(screen.getByText('Fourth Node')).toBeDefined();
    expect(screen.getByText('Pending Detail')).toBeDefined();
  });
});
