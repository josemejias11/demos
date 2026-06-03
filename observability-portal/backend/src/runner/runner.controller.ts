import { Controller, Get, Res, Req, Query, Post, Body, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { RunnerService } from './runner.service';

@Controller('api')
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  // TODO: Add simple auth guard: @UseGuards(SimpleAuthGuard)
  @Get('run-test')
  runTest(
    @Query('suite') suite: string = 'all',
    @Query('env') targetEnv: string = 'production',
    @Query('headed') headed: string = 'false',
    @Query('browser') browser: string = 'all',
    @Query('workers') workers: string = '1',
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.runnerService.runTest(suite, targetEnv, headed, browser, workers, req, res);
  }

  @Get('video')
  streamVideo(@Query('path') videoPath: string, @Res() res: Response) {
    return this.runnerService.streamVideo(videoPath, res);
  }

  @Post('simulator/resolve')
  resolveSimulator(@Body('intent') intent: string) {
    return this.runnerService.resolveSimulator(intent);
  }

  @Get('show-report')
  showReport() {
    return this.runnerService.showReport();
  }

  @Get('open-ui-mode')
  openUiMode() {
    return this.runnerService.openUiMode();
  }
}
