import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';

export function Simulator() {
  const [intent, setIntent] = useState('navigation menu');
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState(0);

  const resolveMutation = useMutation({
    mutationFn: (intentStr: string) => api.resolveSimulator(intentStr)
  });

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStep(1);
    resolveMutation.reset();

    // Simulate steps with timeouts for visual effect
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1600);
    setTimeout(() => setStep(4), 2400);

    resolveMutation.mutate(intent, {
      onSettled: () => {
        setTimeout(() => {
          setIsSimulating(false);
        }, 800);
      }
    });
  };

  const result = resolveMutation.data?.data;

  return (
    <div className="card intent-card">
      <div className="card-header">
        <svg className="card-icon text-violet" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
        </svg>
        <h2>AI Intent Locator Simulator</h2>
      </div>
      
      <div className="intent-simulator-body">
        <p className="section-desc">Test how the framework translates high-level natural language intents into validated selectors and records them into the Knowledge Base.</p>
        
        <div className="simulator-input-row">
          <div className="form-group flex-1">
            <label>Target Locator Intent</label>
            <input 
              type="text" 
              placeholder="e.g. navigation menu, search input, footer..." 
              value={intent}
              onChange={e => setIntent(e.target.value)}
            />
          </div>
          <button className="btn btn-violet" onClick={handleSimulate} disabled={isSimulating || resolveMutation.isPending}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Resolve Intent</span>
          </button>
        </div>

        {(isSimulating || result) && (
          <div className="sim-visualizer">
            <div className="scanner-bar" style={{ animation: isSimulating ? 'scan 2s linear infinite' : 'none', opacity: isSimulating ? 1 : 0 }}></div>
            
            <div className="sim-steps">
              <div className={`sim-step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-check">○</span>
                <span className="step-text">Analyzing semantic meaning and intent aliases...</span>
              </div>
              <div className={`sim-step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-check">○</span>
                <span className="step-text">Generating resolution selector candidates...</span>
              </div>
              <div className={`sim-step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-check">○</span>
                <span className="step-text">Validating against DOM heuristic scores...</span>
              </div>
              <div className={`sim-step ${step >= 4 ? 'active' : ''}`}>
                <span className="step-check">○</span>
                <span className="step-text">Recording optimized pattern match into KB...</span>
              </div>
            </div>

            {!isSimulating && result && (
              <div className="sim-output-details">
                <div className="res-badge-container">
                  <span className="res-status-badge">Validated Match</span>
                  <span className="res-score-badge">Score: {result.confidenceScore}% Confidence</span>
                </div>
                <div className="selector-display">
                  <span className="selector-tag">BEST SELECTOR:</span>
                  <code>{result.resolvedSelector}</code>
                </div>
                <div className="kb-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="text-emerald">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Selector recorded in `.discovery-results/automation-locators-kb.jsonl`</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
