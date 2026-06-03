import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class RunnerService {
  private readonly ROOT_DIR: string;

  constructor(private configService: ConfigService) {
    this.ROOT_DIR = this.configService.get<string>('PLAYWRIGHT_RESULTS_DIR') || path.resolve(__dirname, '../../../../');
  }

  runTest(
    suite: string,
    targetEnv: string,
    headed: string,
    browser: string,
    workers: string,
    req: Request,
    res: Response
  ) {
    const isHeaded = headed === 'true';
    let testPath = '';

    switch (suite) {
      case 'smoke': testPath = 'e2e/smoke.spec.ts'; break;
      case 'api': testPath = 'api/api.spec.ts'; break;
      case 'a11y': testPath = 'accessibility/a11y.spec.ts'; break;
      case 'framework': testPath = 'e2e/framework-showcase.spec.ts'; break;
      default: testPath = '';
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`data: ${JSON.stringify({ type: 'info', text: `🚀 Starting suite: ${suite.toUpperCase()}...\n` })}\n\n`);

    const args = ['playwright', 'test'];
    if (testPath) args.push(testPath);
    if (isHeaded) args.push('--headed');
    if (browser !== 'all') args.push(`--project=${browser}`);
    if (workers) args.push(`--workers=${workers}`);

    const env = { 
      ...process.env, 
      FORCE_COLOR: '3', 
      PLAYWRIGHT_HTML_OPEN: 'never',
      TARGET_ENV: targetEnv 
    };

    const child = spawn('npx', args, { cwd: this.ROOT_DIR, env });

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

    req.on('close', () => {
      if (child.pid) {
        child.kill();
      }
    });
  }

  streamVideo(videoPath: string, res: Response) {
    if (!videoPath) {
      throw new BadRequestException('Video path is required');
    }

    // Harden path traversal by resolving and asserting it belongs to ROOT_DIR
    const resolvedPath = path.resolve(this.ROOT_DIR, videoPath);
    if (!resolvedPath.startsWith(this.ROOT_DIR)) {
      throw new BadRequestException('Invalid path traversal attempt');
    }

    if (!resolvedPath.endsWith('.webm')) {
      throw new BadRequestException('Invalid file type, only .webm allowed');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException('Video not found');
    }

    const stat = fs.statSync(resolvedPath);
    res.writeHead(200, {
      'Content-Type': 'video/webm',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    
    const readStream = fs.createReadStream(resolvedPath);
    readStream.pipe(res);
  }

  resolveSimulator(intent: string) {
    let score = 92;
    let selector = `[data-intent="${intent.replace(/\s+/g, '-')}"]`;
    if (intent.toLowerCase().includes('nav') || intent.toLowerCase().includes('menu')) {
      selector = 'header, .navbar, nav';
      score = 96;
    } else if (intent.toLowerCase().includes('search')) {
      selector = 'input[type="search"], .search-bar, #search';
      score = 88;
    }
    return {
      success: true,
      data: {
        intent,
        resolvedSelector: selector,
        confidenceScore: score,
        recordingPath: '.discovery-results/automation-locators-kb.jsonl'
      }
    };
  }

  showReport() {
    const child = spawn('npx', ['playwright', 'show-report', 'test-results/html', '--port', '0'], { cwd: this.ROOT_DIR, detached: true, stdio: 'ignore' });
    child.unref();
    return { success: true };
  }

  openUiMode() {
    const child = spawn('npx', ['playwright', 'test', '--ui'], { cwd: this.ROOT_DIR, detached: true, stdio: 'ignore' });
    child.unref();
    return { success: true };
  }
}
