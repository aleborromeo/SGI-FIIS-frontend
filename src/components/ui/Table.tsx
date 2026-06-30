import React from 'react';
import './ui.css';

export const TableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="table-container">
    <table className="table">{children}</table>
  </div>
);

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={className}>{children}</tr>
);

export const TableHeader: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <th style={style}>{children}</th>
);

export const TableCell: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <td style={style}>{children}</td>
);
