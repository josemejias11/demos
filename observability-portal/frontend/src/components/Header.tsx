import React from 'react';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-logo">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="logo-text">
          <h1>Universal Automation</h1>
          <span className="subtext">Observability & AI Diagnostics Suite</span>
        </div>
      </div>
      
      <div className="header-status">
        <div className="status-indicator">
          <span className="pulse-dot"></span>
          <span className="status-text">System Active</span>
        </div>
        <div className="site-badge">
          <span className="badge-label">Target:</span>
          <span className="badge-value">example.com</span>
        </div>
      </div>
    </header>
  );
}
