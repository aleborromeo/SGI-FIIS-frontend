import React from 'react';
import './ui.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, options, className = '', id, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(7);
    return (
      <div className="input-group">
        {label && <label htmlFor={selectId} className="label">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={`select ${error ? 'input-error' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {(error || helpText) && (
          <span className={`help-text ${error ? 'error' : ''}`}>
            {error || helpText}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
