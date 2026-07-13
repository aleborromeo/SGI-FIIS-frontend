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

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={className} {...props}>{children}</tr>
);

export const TableHeader: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => (
  <th style={style} {...props}>{children}</th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => (
  <td style={style} {...props}>{children}</td>
);
