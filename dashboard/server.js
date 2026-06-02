import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, exec } from 'node:child_process';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Live Test Running SSE Endpoint
  if (pathname === '/api/run-test') {
    const suite = parsedUrl.searchParams.get('suite') || 'all';
    const targetEnv = parsedUrl.searchParams.get('env') || 'production';
    const isHeaded = parsedUrl.searchParams.get('headed') === 'true';
    const browser = parsedUrl.searchParams.get('browser') || 'all';
    const workers = parsedUrl.searchParams.get('workers') || '1';
    let testPath = '';

    switch (suite) {
      case 'smoke':
        testPath = 'e2e/smoke.spec.ts';
        break;
      case 'api':
        testPath = 'api/api.spec.ts';
        break;
      case 'a11y':
        testPath = 'accessibility/a11y.spec.ts';
        break;
      case 'framework':
        testPath = 'e2e/framework-showcase.spec.ts';
        break;
      default:
        testPath = ''; // Runs all specs
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`data: ${JSON.stringify({ type: 'info', text: `🚀 Starting suite: ${suite.toUpperCase()}...\n` })}\n\n`);

    const args = ['playwright', 'test'];
    if (testPath) {
      args.push(testPath);
    }
    if (isHeaded) {
      args.push('--headed');
    }
    if (browser !== 'all') {
      args.push(`--project=${browser}`);
    }
    if (workers) {
      args.push(`--workers=${workers}`);
    }
    
    // Disable playwright's auto-open to prevent the process from hanging
    const env = { 
      ...process.env, 
      FORCE_COLOR: '3', 
      PLAYWRIGHT_HTML_OPEN: 'never',
      TARGET_ENV: targetEnv 
    };

    const child = spawn('npx', args, { cwd: ROOT_DIR, env });

    child.stdout.on('data', (data) => {
      res.write(`data: ${JSON.stringify({ type: 'stdout', text: data.toString() })}\n\n`);
    });

    child.stderr.on('data', (data) => {
      res.write(`data: ${JSON.stringify({ type: 'stderr', text: data.toString() })}\n\n`);
    });

    child.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', text: `Failed to start process: ${err.message}\n` })}\n\n`);
      res.end();
    });

    child.on('close', (code) => {
      res.write(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`);
      res.end();
    });

    // If client closes connection, terminate child process
    req.on('close', () => {
      if (child.pid) {
        child.kill();
      }
    });
    return;
  }

  // 2. Telemetry Log API Endpoint
  if (pathname === '/api/telemetry') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    const telemetryFile = path.join(ROOT_DIR, 'discovery-results', 'automation-telemetry.jsonl');
    if (!fs.existsSync(telemetryFile)) {
      // Fallback beautiful mock data if telemetry is cleaned
      const mockTelemetry = [
        {
          timestamp: new Date(Date.now() - 500000).toISOString(),
          siteName: 'moodys.com',
          eventType: 'console_error',
          url: 'https://www.moodys.com/',
          message: 'Uncaught TypeError: Cannot read properties of undefined (reading "init")',
          details: { test: 'Homepage loads successfully' }
        },
        {
          timestamp: new Date(Date.now() - 400000).toISOString(),
          siteName: 'moodys.com',
          eventType: 'http_error',
          url: 'https://www.moodys.com/api/v1/user',
          message: 'HTTP 502 Bad Gateway on https://www.moodys.com/api/v1/user',
          details: { test: 'Interactive Showcase', status: 502, resourceUrl: 'https://www.moodys.com/api/v1/user' }
        },
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          siteName: 'moodys.com',
          eventType: 'network_failure',
          url: 'https://www.moodys.com/',
          message: 'Failed to load: https://www.googletagmanager.com/gtm.js',
          details: { test: 'Accessibility verification', failure: 'net::ERR_CONNECTION_TIMED_OUT' }
        }
      ];
      res.end(JSON.stringify(mockTelemetry));
      return;
    }

    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(telemetryFile),
        crlfDelay: Infinity
      });
      
      const parsedLines = [];
      rl.on('line', (line) => {
        if (line.trim() !== '') {
          try {
            parsedLines.push(JSON.parse(line));
            // Keep memory bounded to last 1000 logs
            if (parsedLines.length > 1000) {
              parsedLines.shift();
            }
          } catch (e) {
            // Ignore malformed lines
          }
        }
      });
      
      rl.on('close', () => {
        res.end(JSON.stringify(parsedLines.reverse())); // Newest first
      });
      
      rl.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to stream telemetry log', details: err.message }));
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to init telemetry stream', details: String(err) }));
    }
    return;
  }

  // 3. KB Stats API Endpoint
  if (pathname === '/api/kb-stats') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    
    const kbFile = path.join(ROOT_DIR, 'discovery-results', 'automation-locators-kb.jsonl');
    
    if (!fs.existsSync(kbFile)) {
      return res.end(JSON.stringify({ count: 0 }));
    }
    
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(kbFile),
        crlfDelay: Infinity
      });
      
      let count = 0;
      rl.on('line', (line) => {
        if (line.trim() !== '') count++;
      });
      
      rl.on('close', () => {
        res.end(JSON.stringify({ count }));
      });
      
      rl.on('error', (err) => {
        console.error('Failed to read KB stream:', err);
        res.end(JSON.stringify({ count: 0 }));
      });
    } catch (err) {
      console.error('Failed to init KB stream:', err);
      res.end(JSON.stringify({ count: 0 }));
    }
    return;
  }

  // 4. Endpoint to show Playwright Report
  if (pathname === '/api/show-report') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    // Launch report in detached process so it opens the browser independently
    const child = spawn('npx', ['playwright', 'show-report', 'test-results/html'], { cwd: ROOT_DIR, detached: true, stdio: 'ignore' });
    child.unref();
    return;
  }

  // 5. Endpoint to open Playwright UI Mode
  if (pathname === '/api/open-ui-mode') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    // Launch UI Mode in detached process
    const child = spawn('npx', ['playwright', 'test', '--ui'], { cwd: ROOT_DIR, detached: true, stdio: 'ignore' });
    child.unref();
    return;
  }

  // 6. Static File Serving
  let relativePath = pathname === '/' ? 'index.html' : pathname.substring(1);
  let filePath = path.join(__dirname, relativePath);

  // Security check - prevent directory traversal outside dashboard
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
  🌐 ======================================================= 🌐
  🚀 Universal Automation Observability Dashboard is running!
  👉 Access the interface here: http://localhost:${PORT}
  🌐 ======================================================= 🌐
  `);
  
  // Open the browser automatically
  const platform = process.platform;
  const url = `http://localhost:${PORT}`;
  if (platform === 'darwin') {
    exec(`open ${url}`);
  } else if (platform === 'win32') {
    exec(`start ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});
