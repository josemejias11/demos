import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function ApprovalQueue() {
  const queryClient = useQueryClient();
  const { data: approvals, isLoading } = useQuery({ queryKey: ['approvals'], queryFn: api.getPendingApprovals });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveSelector(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] })
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectSelector(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] })
  });

  if (isLoading || !approvals || approvals.length === 0) return null;

  return (
    <div className="card approval-card" style={{ marginTop: '20px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
      <div className="card-header telemetry-header-row">
        <div className="header-title-wrapper">
          <svg className="card-icon text-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h2>Auto-Healing Approval Queue</h2>
        </div>
        <span className="badge-count" style={{ background: 'var(--yellow-glow)', color: 'var(--yellow)' }}>{approvals.length} Pending</span>
      </div>
      <div className="approval-list" style={{ marginTop: '15px' }}>
        {approvals.map(app => (
          <div key={app.id} className="approval-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '14px', margin: '0 0 5px 0' }}>{app.testName} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>— {new Date(app.timestamp).toLocaleString()}</span></h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>AI detected a broken selector for intent: <strong style={{ color: '#fff' }}>"{app.intent}"</strong></p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ color: 'var(--rose)' }}>- {app.oldSelector}</div>
                  <div style={{ color: 'var(--emerald)' }}>+ {app.newSelector}</div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--blue)' }}>AI Confidence: {Math.round(app.confidence * 100)}%</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => approveMutation.mutate(app.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Approve
                </button>
                <button 
                  onClick={() => rejectMutation.mutate(app.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
