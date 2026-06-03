import type { TestStats, TestFailure, Trend, FlakyTest, TelemetryLog, KbEntry, PendingApproval } from './types';

// In development, the Vite proxy handles /api to localhost:3000
// In production, VITE_API_BASE_URL should be set
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  getTestStats: (): Promise<TestStats> => fetch(`${API_BASE}/api/test-stats`).then(r => r.json()),
  getTestFailures: (): Promise<TestFailure[]> => fetch(`${API_BASE}/api/test-failures`).then(r => r.json()),
  getTrends: (): Promise<Trend[]> => fetch(`${API_BASE}/api/trends`).then(r => r.json()),
  getFlakyTests: (): Promise<FlakyTest[]> => fetch(`${API_BASE}/api/flaky-tests`).then(r => r.json()),
  getTelemetryLogs: (): Promise<TelemetryLog[]> => fetch(`${API_BASE}/api/telemetry`).then(r => r.json()),
  getKbEntries: (): Promise<KbEntry[]> => fetch(`${API_BASE}/api/kb`).then(r => r.json()),
  getPendingApprovals: (): Promise<PendingApproval[]> => fetch(`${API_BASE}/api/pending-approvals`).then(r => r.json()),
  
  approveSelector: (id: string) => fetch(`${API_BASE}/api/approve-selector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  }).then(r => r.json()),
  
  rejectSelector: (id: string) => fetch(`${API_BASE}/api/reject-selector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  }).then(r => r.json()),
  
  resolveSimulator: (intent: string) => fetch(`${API_BASE}/api/simulator/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent })
  }).then(r => r.json()),

  openReport: () => fetch(`${API_BASE}/api/show-report`),
  openUiMode: () => fetch(`${API_BASE}/api/open-ui-mode`),

  getSseUrl: (qs: string) => `${API_BASE}/api/run-test?${qs}`,
  getVideoUrl: (path: string) => `${API_BASE}/api/video?path=${encodeURIComponent(path)}`
};
