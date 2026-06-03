import React from 'react';
import { api } from '../api';
import type { TestStats } from '../types';

export function StatsGrid({ stats }: { stats?: TestStats }) {
  if (!stats) return null;

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
  
  const handleViewReport = () => {
    api.openReport().catch(console.error);
  };

  return (
    <div className="stats-grid">
      {/* Stat 1: Pass Rate */}
      <div className="stat-card">
        <div className="stat-icon-wrapper bg-emerald-glow">
          <svg className="stat-icon text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{passRate}%</span>
          <span className="stat-label">Playwright Pass Rate</span>
          <button 
            onClick={handleViewReport}
            style={{ marginTop: '6px', background: 'transparent', border: '1px solid var(--emerald)', color: 'var(--emerald)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            View Report
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '12px' }}>
          <div className="percentage-ring-container" style={{ width: '50px', height: '50px', position: 'relative' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--emerald)" strokeWidth="3" strokeDasharray={`${passRate}, 100`} style={{ strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.75rem' }}>
              {passRate}
            </div>
          </div>

          <div className="test-counts" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald)' }}></span>
              <span>{stats.passed} Pass</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rose)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--rose)' }}></span>
              <span>{stats.failed} Fail</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span>
              <span>{stats.skipped} Skip</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat 2: Total Suites */}
      <div className="stat-card">
        <div className="stat-icon-wrapper bg-blue-glow">
          <svg className="stat-icon text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">4</span>
          <span className="stat-label">Target Test Suites</span>
        </div>
      </div>
    </div>
  );
}
