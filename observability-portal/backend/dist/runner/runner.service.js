"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let RunnerService = class RunnerService {
    configService;
    ROOT_DIR;
    constructor(configService) {
        this.configService = configService;
        this.ROOT_DIR = this.configService.get('PLAYWRIGHT_RESULTS_DIR') || path.resolve(__dirname, '../../../../');
    }
    runTest(suite, targetEnv, headed, browser, workers, req, res) {
        const isHeaded = headed === 'true';
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
        if (testPath)
            args.push(testPath);
        if (isHeaded)
            args.push('--headed');
        if (browser !== 'all')
            args.push(`--project=${browser}`);
        if (workers)
            args.push(`--workers=${workers}`);
        const env = {
            ...process.env,
            FORCE_COLOR: '3',
            PLAYWRIGHT_HTML_OPEN: 'never',
            TARGET_ENV: targetEnv
        };
        const child = (0, child_process_1.spawn)('npx', args, { cwd: this.ROOT_DIR, env });
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
    streamVideo(videoPath, res) {
        if (!videoPath) {
            throw new common_1.BadRequestException('Video path is required');
        }
        const resolvedPath = path.resolve(this.ROOT_DIR, videoPath);
        if (!resolvedPath.startsWith(this.ROOT_DIR)) {
            throw new common_1.BadRequestException('Invalid path traversal attempt');
        }
        if (!resolvedPath.endsWith('.webm')) {
            throw new common_1.BadRequestException('Invalid file type, only .webm allowed');
        }
        if (!fs.existsSync(resolvedPath)) {
            throw new common_1.NotFoundException('Video not found');
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
    resolveSimulator(intent) {
        let score = 92;
        let selector = `[data-intent="${intent.replace(/\s+/g, '-')}"]`;
        if (intent.toLowerCase().includes('nav') || intent.toLowerCase().includes('menu')) {
            selector = 'header, .navbar, nav';
            score = 96;
        }
        else if (intent.toLowerCase().includes('search')) {
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
        const child = (0, child_process_1.spawn)('npx', ['playwright', 'show-report', 'test-results/html', '--port', '0'], { cwd: this.ROOT_DIR, detached: true, stdio: 'ignore' });
        child.unref();
        return { success: true };
    }
    openUiMode() {
        const child = (0, child_process_1.spawn)('npx', ['playwright', 'test', '--ui'], { cwd: this.ROOT_DIR, detached: true, stdio: 'ignore' });
        child.unref();
        return { success: true };
    }
};
exports.RunnerService = RunnerService;
exports.RunnerService = RunnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RunnerService);
//# sourceMappingURL=runner.service.js.map