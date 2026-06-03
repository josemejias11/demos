import React, { useState } from 'react';
import type { TelemetryLog } from '../types';

export function TelemetryTable({ logs }: { logs: TelemetryLog[] }) {
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs?.filter(log => filter === 'all' || log.eventType === filter) || [];

  return (
    <div className="card telemetry-card">
      <div className="card-header telemetry-header-row">
        <div className="header-title-wrapper">
          <svg className="card-icon text-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2>Observability Guard Logs</h2>
        </div>
        
        <div className="log-filters">
          {['all', 'console_error', 'http_error', 'network_failure'].map(f => (
            <button 
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`} 
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Logs' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="telemetry-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Source URL / Path</th>
              <th>Message / Exception Detail</th>
              <th>Test Suite Context</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-logs-msg" style={{ textAlign: 'center', padding: '20px' }}>
                  No telemetry logs available.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="timestamp-col">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className={`badge-category ${log.eventType}`}>
                      {log.eventType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="url-text" title={log.url}>{log.url}</div>
                  </td>
                  <td>
                    <div className="msg-text" title={log.message}>{log.message}</div>
                  </td>
                  <td className="context-text">{log.details?.test || 'Global hook'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
