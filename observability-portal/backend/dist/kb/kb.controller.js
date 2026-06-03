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
exports.KbController = void 0;
const common_1 = require("@nestjs/common");
const kb_service_1 = require("./kb.service");
let KbController = class KbController {
    kbService;
    constructor(kbService) {
        this.kbService = kbService;
    }
    getKbEntries() {
        return this.kbService.getKbEntries();
    }
    getPendingApprovals() {
        return this.kbService.getPendingApprovals();
    }
    approveSelector(id) {
        return this.kbService.approveSelector(id);
    }
    rejectSelector(id) {
        return this.kbService.rejectSelector(id);
    }
};
exports.KbController = KbController;
__decorate([
    (0, common_1.Get)('kb'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], KbController.prototype, "getKbEntries", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], KbController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approve-selector'),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KbController.prototype, "approveSelector", null);
__decorate([
    (0, common_1.Post)('reject-selector'),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KbController.prototype, "rejectSelector", null);
exports.KbController = KbController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [kb_service_1.KbService])
], KbController);
//# sourceMappingURL=kb.controller.js.map