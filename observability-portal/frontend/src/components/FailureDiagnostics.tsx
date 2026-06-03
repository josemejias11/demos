import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function FailureDiagnostics() {
  const { data: failures, isLoading, isError } = useQuery({ queryKey: ['failures'], queryFn: api.getTestFailures });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ path: string, context: string } | null>(null);

  const openVideo = (path: string, context: string) => {
    setCurrentVideo({ path, context });
    setVideoModalOpen(true);
  };

  return (
    <>
      <div className="card telemetry-card">
        <div className="card-header telemetry-header-row">
          <div className="header-title-wrapper">
            <svg className="card-icon text-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h2>Test Failure Diagnostics & Replays</h2>
          </div>
        </div>
        <div className="telemetry-table-wrapper" style={{ maxHeight: '300px' }}>
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Test Suite</th>
                <th>Failure Reason</th>
                <th>AI RCA Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="no-logs-msg" style={{ textAlign: 'center', padding: '20px' }}>Loading failures...</td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="no-logs-msg" style={{ textAlign: 'center', padding: '20px', color: 'var(--rose)' }}>Error loading failures</td>
                </tr>
              )}
              {!isLoading && !isError && (!failures || failures.length === 0) ? (
                <tr>
                  <td colSpan={5} className="no-logs-msg" style={{ textAlign: 'center', padding: '20px' }}>
                    No test failures recorded.
                  </td>
                </tr>
              ) : (
                failures?.map((fail, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{fail.title}</td>
                    <td>{fail.suite}</td>
                    <td><div className="msg-text" style={{ color: 'var(--rose)' }}>{fail.error}</div></td>
                    <td>
                      <div className="msg-text" style={{ fontStyle: 'italic', color: 'var(--blue)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                        </svg>
                        {fail.rca}
                      </div>
                    </td>
                    <td>
                      {fail.videoPath ? (
                        <button 
                          className="btn" 
                          style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => openVideo(fail.videoPath!, fail.title)}
                        >
                          ▶ Play Video
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Video</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {videoModalOpen && currentVideo && (
        <div className="modal-overlay" onClick={() => setVideoModalOpen(false)} style={{ display: 'flex' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '800px' }}>
            <div className="modal-header">
              <h3>Playwright Failure Replay</h3>
              <button className="close-btn" onClick={() => setVideoModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '10px', fontSize: '14px' }}>Context: {currentVideo.context}</p>
              <video 
                src={api.getVideoUrl(currentVideo.path)}
                controls 
                autoPlay 
                style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
