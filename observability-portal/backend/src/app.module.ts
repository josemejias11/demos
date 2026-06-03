import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryModule } from './telemetry/telemetry.module';
import { TestResultsModule } from './test-results/test-results.module';
import { KbModule } from './kb/kb.module';
import { RunnerModule } from './runner/runner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelemetryModule,
    TestResultsModule,
    KbModule,
    RunnerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
