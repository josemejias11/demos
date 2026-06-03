import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface KbEntry {
  timestamp: string;
  intent: string;
  selector: string;
  confidence: string;
}

export interface PendingApproval {
  id: string;
  testName: string;
  intent: string;
  oldSelector: string;
  newSelector: string;
  confidence: number;
  timestamp: string;
}

@Injectable()
export class KbService {
  private readonly ROOT_DIR: string;
  private readonly KB_FILE: string;

  private pendingApprovals: PendingApproval[] = [
    {
      id: 'pa_1',
      testName: 'Login Form Submission',
      intent: 'submit button',
      oldSelector: '#login-btn-old',
      newSelector: 'button[type="submit"], [data-test="login-submit"]',
      confidence: 0.96,
      timestamp: new Date().toISOString()
    },
    {
      id: 'pa_2',
      testName: 'Navigation to Dashboard',
      intent: 'dashboard link',
      oldSelector: '.nav-item-dash',
      newSelector: 'a[href="/dashboard"], .dashboard-link',
      confidence: 0.88,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  constructor(private configService: ConfigService) {
    this.ROOT_DIR = this.configService.get<string>('PLAYWRIGHT_RESULTS_DIR') || path.resolve(__dirname, '../../../../');
    this.KB_FILE = path.join(this.ROOT_DIR, 'discovery-results', 'automation-locators-kb.jsonl');
  }

  getKbEntries(): KbEntry[] {
    if (!fs.existsSync(this.KB_FILE)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.KB_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => {
        const item = JSON.parse(line);
        return {
          timestamp: new Date(item.timestamp).toLocaleString(),
          intent: item.intent,
          selector: item.selector || item.resolvedSelector,
          confidence: `${Math.round((item.confidenceScore || 0.9) * 100)}%`
        };
      });
    } catch (err) {
      console.error('Failed to read KB:', err);
      return [];
    }
  }

  getPendingApprovals(): PendingApproval[] {
    return this.pendingApprovals;
  }

  approveSelector(id: string): { success: boolean, message: string } {
    const idx = this.pendingApprovals.findIndex(pa => pa.id === id);
    if (idx === -1) {
      throw new NotFoundException('Approval request not found');
    }
    
    const approval = this.pendingApprovals[idx];
    const newEntry = {
      timestamp: new Date().toISOString(),
      intent: approval.intent,
      resolvedSelector: approval.newSelector,
      confidenceScore: approval.confidence,
      source: 'dashboard_approval'
    };

    if (!fs.existsSync(path.dirname(this.KB_FILE))) {
      fs.mkdirSync(path.dirname(this.KB_FILE), { recursive: true });
    }
    fs.appendFileSync(this.KB_FILE, JSON.stringify(newEntry) + '\n');
    this.pendingApprovals.splice(idx, 1);
    
    return { success: true, message: 'Selector approved and added to KB' };
  }

  rejectSelector(id: string): { success: boolean, message: string } {
    const idx = this.pendingApprovals.findIndex(pa => pa.id === id);
    if (idx === -1) {
      throw new NotFoundException('Approval request not found');
    }
    
    this.pendingApprovals.splice(idx, 1);
    return { success: true, message: 'Selector rejected and discarded' };
  }
}
