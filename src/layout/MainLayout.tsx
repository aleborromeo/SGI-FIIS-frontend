import React from 'react';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="container-main fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};
