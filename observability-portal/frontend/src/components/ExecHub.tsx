import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export function ExecHub() {
  const [suite, setSuite] = useState('all');
  const [browser, setBrowser] = useState('chromium');
  const [env, setEnv] = useState('production');
  const [headed, setHeaded] = useState(false);
  const [workers, setWorkers] = useState('1');
  const [jira, setJira] = useState(false);
  const [xray, setXray] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['> Ready to execute suites. Select a suite and click "Run Selected Suite".']);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    
    const qs = new URLSearchParams({
      suite,
      env,
      browser,
      headed: headed.toString(),
      workers
    });
    
    const eventSource = new EventSource(api.getSseUrl(qs.toString()));
    sseRef.current = eventSource;

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'exit') {
          setLogs(prev => [...prev, `[System] Process exited with code ${data.code}`]);
          setIsRunning(false);
          eventSource.close();
        } else {
          setLogs(prev => [...prev, data.text]);
        }
      } catch (err) {
        console.error('Failed to parse SSE data', err);
      }
    };

    eventSource.onerror = () => {
      setLogs(prev => [...prev, '[System] SSE Connection Error or Terminated']);
      setIsRunning(false);
      eventSource.close();
    };
  };

  const handleStop = () => {
    if (sseRef.current) {
      sseRef.current.close();
      setLogs(prev => [...prev, '[System] Test execution aborted by user.']);
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setLogs(['> Ready to execute suites. Select a suite and click "Run Selected Suite".']);
  };

  return (
    <div className="card exec-hub-card">
      <div className="card-header">
        <svg className="card-icon text-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>Test Execution Hub</h2>
      </div>
      
      <div className="exec-controls">
        <div className="form-group">
          <label>Select Target Test Suite</label>
          <div className="custom-select-wrapper">
            <select value={suite} onChange={e => setSuite(e.target.value)}>
              <option value="all">All Specs (Complete Test Suite)</option>
              <option value="smoke">Smoke Suite (e2e/smoke.spec.ts)</option>
              <option value="api">API Integrity Suite (api/api.spec.ts)</option>
              <option value="a11y">Accessibility/A11y Suite (accessibility/a11y.spec.ts)</option>
              <option value="framework">AI Locator Intent Suite (e2e/framework-showcase.spec.ts)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Target Environment</label>
          <div className="custom-select-wrapper">
            <select value={env} onChange={e => setEnv(e.target.value)}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="dev">Dev</option>
            </select>
          </div>
        </div>

        <div className="form-group toggle-group">
          <label className="toggle-container">
            <input type="checkbox" checked={headed} onChange={e => setHeaded(e.target.checked)} />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Run in Headed Mode (Visible Browser)</span>
          </label>
        </div>

        <div className="form-group">
          <label>Select Browser</label>
          <div className="custom-select-wrapper">
            <select value={browser} onChange={e => setBrowser(e.target.value)}>
              <option value="all">All Browsers</option>
              <option value="chromium">Chromium</option>
              <option value="firefox">Firefox</option>
              <option value="webkit">WebKit</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Number of Workers</label>
          <input type="number" min="1" max="10" value={workers} onChange={e => setWorkers(e.target.value)} placeholder="e.g. 4" />
        </div>

        <div className="form-group toggle-group" style={{ marginTop: '10px' }}>
          <label className="toggle-container">
            <input type="checkbox" checked={jira} onChange={e => setJira(e.target.checked)} />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Export Results to Jira (Pre-imp)</span>
          </label>
        </div>
        
        <div className="form-group toggle-group">
          <label className="toggle-container">
            <input type="checkbox" checked={xray} onChange={e => setXray(e.target.checked)} />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Export Results to Xray (Pre-imp)</span>
          </label>
        </div>
        
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleStart} disabled={isRunning}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Run Selected Suite</span>
          </button>
          
          <button className="btn btn-secondary" onClick={() => api.openUiMode().catch(console.error)}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
            </svg>
            <span>Open UI Mode</span>
          </button>
          
          <button className="btn btn-secondary" onClick={handleStop} disabled={!isRunning}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
            </svg>
            <span>Terminate Run</span>
          </button>
        </div>
      </div>

      <div className="terminal-wrapper">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="term-dot close"></span>
            <span className="term-dot minimize"></span>
            <span className="term-dot expand"></span>
          </div>
          <div className="terminal-title">live-playwright-stream.sh</div>
          <button className="clear-console-btn" title="Clear Console" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="terminal-body" ref={terminalRef}>
          {logs.map((log, i) => (
            <div key={i} className={log.startsWith('>') ? 'terminal-line system-msg' : 'terminal-line'}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
