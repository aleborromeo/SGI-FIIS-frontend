import React from 'react';
import './ui.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    return (
      <div className="input-group">
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={`textarea ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {(error || helpText) && (
          <span className={`help-text ${error ? 'error' : ''}`}>
            {error || helpText}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
