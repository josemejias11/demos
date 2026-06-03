import { Controller, Get, Post, Body } from '@nestjs/common';
import { KbService } from './kb.service';
import type { KbEntry, PendingApproval } from './kb.service';

@Controller('api')
export class KbController {
  constructor(private readonly kbService: KbService) {}

  @Get('kb')
  getKbEntries(): KbEntry[] {
    return this.kbService.getKbEntries();
  }

  @Get('pending-approvals')
  getPendingApprovals(): PendingApproval[] {
    return this.kbService.getPendingApprovals();
  }

  @Post('approve-selector')
  approveSelector(@Body('id') id: string) {
    return this.kbService.approveSelector(id);
  }

  @Post('reject-selector')
  rejectSelector(@Body('id') id: string) {
    return this.kbService.rejectSelector(id);
  }
}
