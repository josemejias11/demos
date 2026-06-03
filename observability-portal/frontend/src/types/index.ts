export interface TestStats {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

export interface TestFailure {
  title: string;
  suite: string;
  error: string;
  videoPath: string | null;
  rca: string;
}

export interface Trend {
  date: string;
  passRate: number;
}

export interface FlakyTest {
  id: string;
  testName: string;
  score: number;
  history: string[];
}

export interface TelemetryLog {
  timestamp: string;
  siteName: string;
  eventType: string;
  url: string;
  message: string;
  details?: any;
}

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
