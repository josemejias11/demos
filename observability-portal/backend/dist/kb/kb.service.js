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
exports.KbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let KbService = class KbService {
    configService;
    ROOT_DIR;
    KB_FILE;
    pendingApprovals = [
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
    constructor(configService) {
        this.configService = configService;
        this.ROOT_DIR = this.configService.get('PLAYWRIGHT_RESULTS_DIR') || path.resolve(__dirname, '../../../../');
        this.KB_FILE = path.join(this.ROOT_DIR, 'discovery-results', 'automation-locators-kb.jsonl');
    }
    getKbEntries() {
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
        }
        catch (err) {
            console.error('Failed to read KB:', err);
            return [];
        }
    }
    getPendingApprovals() {
        return this.pendingApprovals;
    }
    approveSelector(id) {
        const idx = this.pendingApprovals.findIndex(pa => pa.id === id);
        if (idx === -1) {
            throw new common_1.NotFoundException('Approval request not found');
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
    rejectSelector(id) {
        const idx = this.pendingApprovals.findIndex(pa => pa.id === id);
        if (idx === -1) {
            throw new common_1.NotFoundException('Approval request not found');
        }
        this.pendingApprovals.splice(idx, 1);
        return { success: true, message: 'Selector rejected and discarded' };
    }
};
exports.KbService = KbService;
exports.KbService = KbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KbService);
//# sourceMappingURL=kb.service.js.map