// JavaScript Controller for Universal Automation Observability Suite

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Execution Hub
  const suiteSelect = document.getElementById('suite-select');
  const headedToggle = document.getElementById('headed-toggle');
  const btnRun = document.getElementById('btn-run');
  const btnUiMode = document.getElementById('btn-ui-mode');
  const btnStop = document.getElementById('btn-stop');
  const btnClearConsole = document.getElementById('btn-clear-console');
  const terminalBody = document.getElementById('terminal-body');
  
  // New Elements
  const envSelect = document.getElementById('env-select');
  const browserSelect = document.getElementById('browser-select');
  const workersInput = document.getElementById('workers-input');
  const jiraToggle = document.getElementById('jira-toggle');
  const xrayToggle = document.getElementById('xray-toggle');

  // Elements - AI Intent Simulator
  const btnSimulateIntent = document.getElementById('btn-simulate-intent');
  const intentInput = document.getElementById('intent-input');
  const simVisualizer = document.getElementById('sim-visualizer');
  const simOutputDetails = document.getElementById('sim-output-details');
  const resolvedSelectorCode = document.getElementById('resolved-selector-code');
  const steps = {
    analyze: document.getElementById('step-analyze'),
    candidates: document.getElementById('step-candidates'),
    validate: document.getElementById('step-validate'),
    kb: document.getElementById('step-kb')
  };

  // Elements - Stats & Telemetry
  const statsAlerts = document.getElementById('stats-alerts');
  const statsKb = document.getElementById('stats-kb');
  const telemetryTbody = document.getElementById('telemetry-tbody');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const pagePrev = document.getElementById('page-prev');
  const pageNext = document.getElementById('page-next');
  const pageInfo = document.getElementById('page-info');
  const telemetryPagination = document.getElementById('telemetry-pagination');

  // Global State
  let eventSource = null;
  let allTelemetryLogs = [];
  let activeFilter = 'all';
  let currentLogPage = 1;
  const LOGS_PER_PAGE = 10;

  // -------------------------------------------------------------
  // 1. Live Test Runner Stream Controller
  // -------------------------------------------------------------

  function appendTerminalLine(text, className = 'stdout') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    
    // Simple ANSI escape sequence colorizer helper
    // Strips or transforms common styling
    let formattedText = text
      .replace(/\u001b\[\d+m/g, '') // Strip color sequences
      .replace(/\[\d+m/g, '')
      .replace(/\[2K/g, '')
      .replace(/\[\d+D/g, '');

    // Highlight key words for visual appeal
    if (formattedText.includes('✓') || formattedText.includes('passed') || formattedText.includes('Passed')) {
      line.style.color = '#10b981'; // Emerald
    } else if (formattedText.includes('✗') || formattedText.includes('failed') || formattedText.includes('Failed') || formattedText.includes('Error:')) {
      line.style.color = '#f43f5e'; // Crimson
    } else if (formattedText.includes('running') || formattedText.includes('Starting')) {
      line.style.color = '#6366f1'; // Indigo
    } else if (formattedText.includes('LocatorIntent') || formattedText.includes('KB recorded')) {
      line.style.color = '#8b5cf6'; // Violet
    }

    line.textContent = formattedText;
    terminalBody.appendChild(line);
    
    // Auto-scroll terminal
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function startTestRun() {
    const suite = suiteSelect.value;
    const targetEnv = envSelect.value;
    const isHeaded = headedToggle.checked;
    const browser = browserSelect.value;
    const workers = workersInput.value;
    
    // State updates
    btnRun.disabled = true;
    btnStop.disabled = false;
    suiteSelect.disabled = true;
    envSelect.disabled = true;
    headedToggle.disabled = true;
    browserSelect.disabled = true;
    workersInput.disabled = true;
    jiraToggle.disabled = true;
    xrayToggle.disabled = true;
    
    // Clear terminal
    terminalBody.innerHTML = '';
    appendTerminalLine(`> Initializing child process and test runner hook...`, 'system-msg');
    if (isHeaded) {
      appendTerminalLine(`> Mode: Headed (Visible Browser)`, 'system-msg');
    }
    appendTerminalLine(`> Environment: ${targetEnv.toUpperCase()}`, 'system-msg');
    if (browser !== 'all') {
      appendTerminalLine(`> Browser: ${browser}`, 'system-msg');
    }
    appendTerminalLine(`> Workers: ${workers}`, 'system-msg');
    if (jiraToggle.checked || xrayToggle.checked) {
      appendTerminalLine(`> Integrations: ${[jiraToggle.checked ? 'Jira' : '', xrayToggle.checked ? 'Xray' : ''].filter(Boolean).join(', ')} (Pre-imp Mode)`, 'system-msg');
    }
    
    // Open Server-Sent Events stream
    eventSource = new EventSource(`/api/run-test?suite=${suite}&env=${targetEnv}&headed=${isHeaded}&browser=${browser}&workers=${workers}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stdout') {
          appendTerminalLine(data.text, 'stdout');
        } else if (data.type === 'stderr') {
          appendTerminalLine(data.text, 'stderr');
        } else if (data.type === 'info') {
          appendTerminalLine(data.text, 'system-msg');
        } else if (data.type === 'error') {
          appendTerminalLine(data.text, 'error-msg');
        } else if (data.type === 'exit') {
          appendTerminalLine(`\n> Playwright exited with code: ${data.code}`, data.code === 0 ? 'success-msg' : 'error-msg');
          if (data.code === 0) {
            appendTerminalLine(`🏆 Suite run completed successfully.`, 'success-msg');
          } else {
            appendTerminalLine(`⚠️ Suite run encountered issues. Review logs above.`, 'error-msg');
          }
          appendTerminalLine(`> Test run finished. Use the "Playwright Pass Rate" button to view report.`, 'system-msg');
          stopTestRun(true);
        }
      } catch (err) {
        appendTerminalLine(`Failed to parse chunk: ${event.data}`, 'stderr');
      }
    };
    
    eventSource.onerror = (err) => {
      appendTerminalLine(`\n> Stream connection closed or error encountered.`, 'error-msg');
      stopTestRun(true);
    };
  }

  function stopTestRun(finishedNaturally = false) {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    
    if (!finishedNaturally) {
      appendTerminalLine(`\n> Execution process manually terminated. Connection closed.`, 'error-msg');
    }
    
    // Reset states
    btnRun.disabled = false;
    btnStop.disabled = true;
    suiteSelect.disabled = false;
    envSelect.disabled = false;
    headedToggle.disabled = false;
    browserSelect.disabled = false;
    workersInput.disabled = false;
    jiraToggle.disabled = false;
    xrayToggle.disabled = false;
    
    // Reload telemetry logs to reflect any new entries
    loadTelemetryLogs();
    loadKbStats();
  }

  btnRun.addEventListener('click', startTestRun);
  btnStop.addEventListener('click', () => stopTestRun(false));
  
  btnUiMode.addEventListener('click', async () => {
    try {
      appendTerminalLine(`> Launching Playwright UI Mode...`, 'system-msg');
      btnUiMode.disabled = true;
      const response = await fetch('/api/open-ui-mode', { method: 'POST' });
      if (response.ok) {
        appendTerminalLine(`> UI Mode window opened successfully.`, 'success-msg');
      } else {
        appendTerminalLine(`> Failed to launch UI Mode.`, 'error-msg');
      }
    } catch (err) {
      appendTerminalLine(`> Error launching UI Mode: ${err.message}`, 'error-msg');
    } finally {
      setTimeout(() => btnUiMode.disabled = false, 2000);
    }
  });

  btnClearConsole.addEventListener('click', () => {
    terminalBody.innerHTML = '<div class="terminal-line system-msg">> Console cleared. Ready.</div>';
  });

  // -------------------------------------------------------------
  // 2. AI Intent Locator Resolver Simulator
  // -------------------------------------------------------------

  const INTENT_DATABASE = {
    'navigation menu': {
      selector: "header, [class*='nav'], [class*='header'], [class*='menu']",
      score: 94,
      steps: [
        'Analyzed intent "navigation menu". Match found for domain tags [nav, menu, header]',
        'Found 3 locator candidates using config fallbacks and contextual matching',
        'Scanned page DOM: Matches <header> and primary navbar elements',
        'Validated element hierarchy. Confidence score: 0.94. Added resolved pattern link.'
      ]
    },
    'search input': {
      selector: "[class*='search'] input, input[type='search'], [placeholder*='search' i]",
      score: 92,
      steps: [
        'Analyzed intent "search input". Key identifiers parsed: [input, text, search]',
        'Resolved 3 query forms mapping to standard search templates',
        'Validated element: Input with attribute name="search" is active and visible',
        'Successful resolution score: 0.92. Cache recorded.'
      ]
    },
    'search box': {
      selector: "[class*='search'] input, input[type='search'], [placeholder*='search' i]",
      score: 92,
      steps: [
        'Analyzed intent "search box". Key identifiers parsed: [input, box, search]',
        'Resolved 3 query forms mapping to standard search templates',
        'Validated element: Input with attribute name="search" is active and visible',
        'Successful resolution score: 0.92. Cache recorded.'
      ]
    },
    'main content': {
      selector: "[class*='content'], [class*='main'], [class*='body'], section",
      score: 89,
      steps: [
        'Analyzed intent "main content". Matches target layout area [main, section, container]',
        'Found 4 container candidates with appropriate landmark roles',
        'DOM verification: <main> tag visible and viewport attached',
        'Recorded selector. Confidence score: 0.89.'
      ]
    },
    'main content area': {
      selector: "[class*='content'], [class*='main'], [class*='body'], section",
      score: 89,
      steps: [
        'Analyzed intent "main content area". Matches target layout area [main, section, container]',
        'Found 4 container candidates with appropriate landmark roles',
        'DOM verification: <main> tag visible and viewport attached',
        'Recorded selector. Confidence score: 0.89.'
      ]
    },
    'footer': {
      selector: "footer, [class*='footer']",
      score: 95,
      steps: [
        'Analyzed intent "footer". Identifiers: [footer, contentinfo]',
        'Resolved 2 primary candidates representing page footer bounds',
        'DOM checked: <footer> node attached to DOM tree',
        'Confidence score: 0.95. Selector saved.'
      ]
    }
  };

  async function runIntentSimulation() {
    const query = intentInput.value.trim().toLowerCase();
    if (!query) return;

    btnSimulateIntent.disabled = true;
    simVisualizer.classList.remove('hidden');
    simOutputDetails.classList.add('hidden');
    simVisualizer.classList.add('scanning');

    // Reset step styles
    Object.values(steps).forEach(s => {
      s.className = 'sim-step';
      s.querySelector('.step-check').textContent = '○';
    });

    // Extract simulator config or build generic mock
    const match = INTENT_DATABASE[query] || {
      selector: `div, section, [class*="${query.replace(/[^a-z0-9_-]/g, '')}"]`,
      score: 81,
      steps: [
        `Analyzed query "${query}". Extracting semantic tokens...`,
        `Resolved generic selector based on class naming schema`,
        `DOM checked: Found elements matching class containing "${query}"`,
        `Fuzzy element match verified. Heuristic confidence: 0.81.`
      ]
    };

    // Sequential timing animation
    const updateStep = (stepKey, stepText, nextDelay) => {
      return new Promise(resolve => {
        setTimeout(() => {
          const el = steps[stepKey];
          el.classList.add('active');
          el.querySelector('.step-text').textContent = stepText;
          
          setTimeout(() => {
            el.classList.remove('active');
            el.classList.add('done');
            el.querySelector('.step-check').textContent = '✓';
            resolve();
          }, 800);
        }, nextDelay);
      });
    };

    await updateStep('analyze', match.steps[0], 0);
    await updateStep('candidates', match.steps[1], 200);
    await updateStep('validate', match.steps[2], 200);
    await updateStep('kb', match.steps[3], 200);

    // Stop scan animation
    simVisualizer.classList.remove('scanning');

    // Show output details
    resolvedSelectorCode.textContent = match.selector;
    document.querySelector('.res-score-badge').textContent = `Score: ${match.score}% Confidence`;
    simOutputDetails.classList.remove('hidden');
    btnSimulateIntent.disabled = false;

    // Increment KB statistics card visually!
    const kbVal = parseInt(statsKb.textContent);
    if (!isNaN(kbVal)) {
      statsKb.textContent = kbVal + 1;
    }
  }

  btnSimulateIntent.addEventListener('click', runIntentSimulation);
  intentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runIntentSimulation();
  });

  // -------------------------------------------------------------
  // 3. Telemetry Observer Logs, Analytics & KB Fetcher
  // -------------------------------------------------------------

  async function loadKbStats() {
    try {
      const response = await fetch('/api/kb-stats');
      if (response.ok) {
        const data = await response.json();
        if (data.count !== undefined) {
          statsKb.textContent = data.count;
        }
      }
    } catch (err) {
      console.error('Failed to load KB stats:', err);
    }
  }

  // Modal Elements
  const btnViewKb = document.getElementById('btn-view-kb');
  const kbModal = document.getElementById('kb-modal');
  const closeKbModal = document.getElementById('close-kb-modal');
  const kbTbody = document.getElementById('kb-tbody');

  if (btnViewKb && kbModal && closeKbModal) {
    btnViewKb.addEventListener('click', async () => {
      kbModal.classList.remove('hidden');
      kbTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Loading...</td></tr>';
      try {
        const response = await fetch('/api/kb-list');
        if (response.ok) {
          const list = await response.json();
          kbTbody.innerHTML = '';
          if (list.length === 0) {
            kbTbody.innerHTML = '<tr><td colspan="4" class="no-logs-msg">No KB selectors learned yet.</td></tr>';
          } else {
            list.forEach(item => {
              const tr = document.createElement('tr');
              
              const tsTd = document.createElement('td');
              tsTd.className = 'timestamp-col';
              const date = new Date(item.timestamp);
              tsTd.textContent = isNaN(date.getTime()) ? (item.timestamp || 'N/A') : (date.toLocaleTimeString() + ' | ' + date.toLocaleDateString());
              tr.appendChild(tsTd);
              
              const intentTd = document.createElement('td');
              intentTd.innerHTML = `<strong>${item.target || 'Unknown'}</strong>`;
              tr.appendChild(intentTd);
              
              const selectorTd = document.createElement('td');
              selectorTd.className = 'msg-text';
              selectorTd.textContent = item.selector || 'N/A';
              tr.appendChild(selectorTd);
              
              const scoreTd = document.createElement('td');
              scoreTd.textContent = item.score ? Math.round(item.score * 100) + '%' : 'N/A';
              tr.appendChild(scoreTd);
              
              kbTbody.appendChild(tr);
            });
          }
        }
      } catch (e) {
        kbTbody.innerHTML = '<tr><td colspan="4" class="no-logs-msg">Failed to load KB list</td></tr>';
      }
    });

    closeKbModal.addEventListener('click', () => {
      kbModal.classList.add('hidden');
    });

    kbModal.addEventListener('click', (e) => {
      if (e.target === kbModal) {
        kbModal.classList.add('hidden');
      }
    });
  }

  async function loadTelemetryLogs() {
    try {
      const response = await fetch('/api/telemetry');
      if (!response.ok) throw new Error('API request failed');
      
      allTelemetryLogs = await response.json();
      
      // Update statistics
      statsAlerts.textContent = allTelemetryLogs.length;
      
      renderTelemetryTable();
    } catch (err) {
      console.error('Failed to load telemetry:', err);
      telemetryTbody.innerHTML = `
        <tr>
          <td colspan="5" class="no-logs-msg">
            <span style="color: #f43f5e;">Failed to load observability logs. Verify server connectivity.</span>
          </td>
        </tr>
      `;
    }
  }

  function renderTelemetryTable() {
    const filteredLogs = allTelemetryLogs.filter(log => {
      if (activeFilter === 'all') return true;
      return log.eventType === activeFilter;
    });

    if (filteredLogs.length === 0) {
      telemetryTbody.innerHTML = `
        <tr>
          <td colspan="5" class="no-logs-msg">
            No ${activeFilter !== 'all' ? activeFilter.replace('_', ' ') : ''} alert events recorded in telemetry.
          </td>
        </tr>
      `;
      if (telemetryPagination) telemetryPagination.style.display = 'none';
      return;
    }

    const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
    if (currentLogPage > totalPages) currentLogPage = totalPages;
    if (currentLogPage < 1) currentLogPage = 1;

    if (telemetryPagination) {
      if (totalPages > 1) {
        telemetryPagination.style.display = 'flex';
        pageInfo.textContent = `Page ${currentLogPage} of ${totalPages}`;
        pagePrev.disabled = currentLogPage === 1;
        pageNext.disabled = currentLogPage === totalPages;
      } else {
        telemetryPagination.style.display = 'none';
      }
    }

    const startIdx = (currentLogPage - 1) * LOGS_PER_PAGE;
    const paginatedLogs = filteredLogs.slice(startIdx, startIdx + LOGS_PER_PAGE);

    telemetryTbody.innerHTML = '';
    
    paginatedLogs.forEach(log => {
      const tr = document.createElement('tr');
      
      // Timestamp Cell
      const tsTd = document.createElement('td');
      tsTd.className = 'timestamp-col';
      const date = new Date(log.timestamp);
      tsTd.textContent = date.toLocaleTimeString() + ' | ' + date.toLocaleDateString();
      tr.appendChild(tsTd);
      
      // Category Cell
      const catTd = document.createElement('td');
      const catBadge = document.createElement('span');
      catBadge.className = `badge-category ${log.eventType}`;
      catBadge.textContent = log.eventType.replace('_', ' ');
      catTd.appendChild(catBadge);
      tr.appendChild(catTd);
      
      // URL Cell
      const urlTd = document.createElement('td');
      const urlDiv = document.createElement('div');
      urlDiv.className = 'url-text';
      urlDiv.textContent = log.url;
      urlDiv.title = log.url;
      urlTd.appendChild(urlDiv);
      tr.appendChild(urlTd);
      
      // Message Cell
      const msgTd = document.createElement('td');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'msg-text';
      msgDiv.textContent = log.message;
      msgDiv.title = log.message;
      msgTd.appendChild(msgDiv);
      tr.appendChild(msgTd);
      
      // Context Cell
      const ctxTd = document.createElement('td');
      ctxTd.className = 'context-text';
      ctxTd.textContent = log.details && log.details.test ? log.details.test : 'Global hook';
      tr.appendChild(ctxTd);
      
      telemetryTbody.appendChild(tr);
    });
  }

  // Filter Buttons Handler
  filterButtons.forEach(btn => {
    if (btn.id === 'btn-clear-telemetry') return;
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        if (b.id !== 'btn-clear-telemetry') b.classList.remove('active');
      });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      currentLogPage = 1; // Reset to page 1 on filter change
      renderTelemetryTable();
    });
  });

  if (pagePrev) {
    pagePrev.addEventListener('click', () => {
      if (currentLogPage > 1) {
        currentLogPage--;
        renderTelemetryTable();
      }
    });
  }

  if (pageNext) {
    pageNext.addEventListener('click', () => {
      const filteredLogs = allTelemetryLogs.filter(log => activeFilter === 'all' || log.eventType === activeFilter);
      const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
      if (currentLogPage < totalPages) {
        currentLogPage++;
        renderTelemetryTable();
      }
    });
  }

  const btnClearTelemetry = document.getElementById('btn-clear-telemetry');
  if (btnClearTelemetry) {
    btnClearTelemetry.addEventListener('click', async () => {
      try {
        btnClearTelemetry.disabled = true;
        const response = await fetch('/api/clear-telemetry', { method: 'POST' });
        if (response.ok) {
          allTelemetryLogs = [];
          currentLogPage = 1;
          renderTelemetryTable();
          statsAlerts.textContent = 0;
        } else {
          console.error('Failed to clear telemetry logs via API');
        }
      } catch (err) {
        console.error('Network error when clearing telemetry logs', err);
      } finally {
        btnClearTelemetry.disabled = false;
      }
    });
  }

  // Stat Card Interactive Buttons
  const btnViewReport = document.getElementById('btn-view-report');
  const btnSelectSuite = document.getElementById('btn-select-suite');
  const btnScrollLogs = document.getElementById('btn-scroll-logs');

  if (btnViewReport) {
    btnViewReport.addEventListener('click', async () => {
      btnViewReport.textContent = 'Opening...';
      try {
        await fetch('/api/show-report');
        setTimeout(() => btnViewReport.textContent = 'View Report', 2000);
      } catch (err) {
        console.error('Failed to open report', err);
        btnViewReport.textContent = 'View Report';
      }
    });
  }

  if (btnSelectSuite) {
    btnSelectSuite.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => suiteSelect.focus(), 300);
    });
  }

  if (btnScrollLogs) {
    btnScrollLogs.addEventListener('click', () => {
      const telemetryCard = document.querySelector('.telemetry-card');
      if (telemetryCard) {
        telemetryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Optional: highlight briefly
        telemetryCard.style.boxShadow = '0 0 20px rgba(225, 29, 72, 0.4)';
        setTimeout(() => {
          telemetryCard.style.boxShadow = '0 4px 6px var(--card-border)';
        }, 1500);
      }
    });
  }

  // Initial Data Loads
  loadTelemetryLogs();
  loadKbStats();
});
