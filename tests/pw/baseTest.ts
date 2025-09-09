import { test as base, expect } from '@playwright/test';
import { container } from '../../automation/core/container';
import { config, validateConfig } from '../../automation/automation.config';
import { JsonlSink } from '../../automation/telemetry/sinks/jsonlSink';
import { consoleSink } from '../../automation/telemetry/sinks/consoleSink';
import { otelSink } from '../../automation/telemetry/sinks/otelSink';
import type { EventBus } from '../../automation/core/eventBus';

interface TelemetryFixture {
  emit: (type: string, payload?: Record<string, unknown>) => Promise<void>;
  eventBus: EventBus;
}

let sinksWired = false;

export const test = base.extend<{ telemetry: TelemetryFixture }>({
  telemetry: [
    async ({}, use, workerInfo) => {
      // Initialize defaults only once per worker if container is empty (heuristic)
      try {
        container.get('eventBus');
      } catch {
        container.initializeDefaults(config);
      }
      validateConfig(config);
      const eventBus = container.get('eventBus');
      if (!sinksWired) {
        const sink = new JsonlSink(config.artifacts.telemetryPath);
        eventBus.onAny((evt) => sink.write(evt));
        if (config.consoleSink) eventBus.onAny(consoleSink);
        if (process.env.OTEL_ENABLED === 'true') {
          const serviceName = process.env.OTEL_SERVICE_NAME || 'qa-automation';
          eventBus.onAny((evt) => otelSink(evt, { serviceName }));
        }
        sinksWired = true;
      }
      // Emit test start
      await eventBus.emit({
        ts: Date.now(),
        type: 'test.start',
        payload: { id: workerInfo.testId, title: workerInfo.project.name },
      });
      await use({
        eventBus,
        emit: async (type, payload) => {
          await eventBus.emit({ ts: Date.now(), type, payload });
        },
      });
      // Emit test end
      await eventBus.emit({
        ts: Date.now(),
        type: 'test.end',
        payload: { id: workerInfo.testId, status: workerInfo.repeatEachIndex },
      });
    },
    { scope: 'test' },
  ],
});

export { expect };
