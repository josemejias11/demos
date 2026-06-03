"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerController = void 0;
const common_1 = require("@nestjs/common");
const runner_service_1 = require("./runner.service");
let RunnerController = class RunnerController {
    runnerService;
    constructor(runnerService) {
        this.runnerService = runnerService;
    }
    runTest(suite = 'all', targetEnv = 'production', headed = 'false', browser = 'all', workers = '1', req, res) {
        return this.runnerService.runTest(suite, targetEnv, headed, browser, workers, req, res);
    }
    streamVideo(videoPath, res) {
        return this.runnerService.streamVideo(videoPath, res);
    }
    resolveSimulator(intent) {
        return this.runnerService.resolveSimulator(intent);
    }
    showReport() {
        return this.runnerService.showReport();
    }
    openUiMode() {
        return this.runnerService.openUiMode();
    }
};
exports.RunnerController = RunnerController;
__decorate([
    (0, common_1.Get)('run-test'),
    __param(0, (0, common_1.Query)('suite')),
    __param(1, (0, common_1.Query)('env')),
    __param(2, (0, common_1.Query)('headed')),
    __param(3, (0, common_1.Query)('browser')),
    __param(4, (0, common_1.Query)('workers')),
    __param(5, (0, common_1.Req)()),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RunnerController.prototype, "runTest", null);
__decorate([
    (0, common_1.Get)('video'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RunnerController.prototype, "streamVideo", null);
__decorate([
    (0, common_1.Post)('simulator/resolve'),
    __param(0, (0, common_1.Body)('intent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RunnerController.prototype, "resolveSimulator", null);
__decorate([
    (0, common_1.Get)('show-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RunnerController.prototype, "showReport", null);
__decorate([
    (0, common_1.Get)('open-ui-mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RunnerController.prototype, "openUiMode", null);
exports.RunnerController = RunnerController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [runner_service_1.RunnerService])
], RunnerController);
//# sourceMappingURL=runner.controller.js.map