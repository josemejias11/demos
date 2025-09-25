import { Container } from '../../../automation/core/container';
import { performanceThresholds } from '../infinite.config';

interface PerformanceTimer {
  id: string;
  startTime: number;
  category: string;
}

export class PerformanceTestUtils {
  private container: Container;
  private activeTimers: Map<string, PerformanceTimer> = new Map();

  constructor(container: Container) {
    this.container = container;
  }

  async startTimer(category: string): Promise<string> {
    const id = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timer: PerformanceTimer = {
      id,
      startTime: Date.now(),
      category
    };

    this.activeTimers.set(id, timer);

    // Record timer start telemetry
    const telemetry = this.container.get('telemetryCollector');
    telemetry.recordEvent({
      ts: Date.now(),
      type: 'performance.timer_start',
      payload: {
        timerId: id,
        category,
        startTime: timer.startTime
      }
    });

    return id;
  }

  async endTimer(timerId: string): Promise<number> {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      throw new Error(`Timer ${timerId} not found`);
    }

    const endTime = Date.now();
    const duration = endTime - timer.startTime;
    
    this.activeTimers.delete(timerId);

    // Record timer end telemetry
    const telemetry = this.container.get('telemetryCollector');
    telemetry.recordEvent({
      ts: endTime,
      type: 'performance.timer_end',
      payload: {
        timerId,
        category: timer.category,
        startTime: timer.startTime,
        endTime,
        duration,
        withinThreshold: this.isWithinThreshold(timer.category, duration)
      }
    });

    return duration;
  }

  private isWithinThreshold(category: string, duration: number): boolean {
    switch (category) {
      case 'page_load':
        return duration < performanceThresholds.maxPageLoadTime;
      case 'carousel_transition':
        return duration < performanceThresholds.maxCarouselTransition;
      case 'image_load':
        return duration < performanceThresholds.maxImageLoadTime;
      default:
        return true; // Unknown category, assume pass
    }
  }

  async measurePageLoad(url: string, page: import('@playwright/test').Page): Promise<number> {
    const timerId = await this.startTimer('page_load');

    // Many modern sites keep connections open; avoid hanging on 'networkidle'.
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Wait for a meaningful content marker to appear
    await page
      .locator('main, [role="main"], article, [role="region"][aria-label*="Slides" i]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => void 0);
    // Best-effort short settle; ignore if it doesn't become idle
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => void 0);

    return await this.endTimer(timerId);
  }

  async measureCarouselTransition(
    page: import('@playwright/test').Page,
    carouselSelector: string,
    direction: 'next' | 'previous' = 'next'
  ): Promise<number> {
    const timerId = await this.startTimer('carousel_transition');
    
    const buttonSelector = direction === 'next' 
      ? `${carouselSelector} .carousel-next, ${carouselSelector} button:has-text("Next")`
      : `${carouselSelector} .carousel-prev, ${carouselSelector} button:has-text("Previous")`;
    
    await page.locator(buttonSelector).first().click();
    
    // Wait for transition animation to complete
    await page.waitForTimeout(500);
    
    return await this.endTimer(timerId);
  }

  async measureImageLoad(page: import('@playwright/test').Page, imageSelector: string): Promise<number> {
    const timerId = await this.startTimer('image_load');
    
    const image = page.locator(imageSelector).first();
    await image.waitFor({ state: 'visible' });
    
    // Verify image is fully loaded
    const isLoaded = await page.evaluate((selector) => {
      const img = document.querySelector(selector) as HTMLImageElement;
      return img && img.complete && img.naturalWidth > 0;
    }, imageSelector);
    
    if (!isLoaded) {
      throw new Error(`Image ${imageSelector} failed to load properly`);
    }
    
    return await this.endTimer(timerId);
  }

  async performCoreWebVitalsCheck(page: import('@playwright/test').Page): Promise<Record<string, number>> {
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise<Record<string, number>>((resolve) => {
        // Simple LCP approximation
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          
          const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          resolve({
            lcp: lcp?.startTime || 0,
            fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            ttfb: navigationEntry?.responseStart || 0
          });
        });
        
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            resolve({
              lcp: 0,
              fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
              ttfb: navigationEntry?.responseStart || 0
            });
          }, 5000);
        } catch {
          resolve({
            lcp: 0,
            fcp: 0,
            ttfb: 0
          });
        }
      });
    });

    // Record Core Web Vitals telemetry
    const telemetry = this.container.get('telemetryCollector');
    telemetry.recordEvent({
      ts: Date.now(),
      type: 'performance.core_web_vitals',
      payload: {
        url: page.url(),
        metrics,
        thresholds: {
          lcp_good: metrics.lcp < 2500,
          fcp_good: metrics.fcp < 1800,
          ttfb_good: metrics.ttfb < 800
        }
      }
    });

    return metrics;
  }

  async generatePerformanceReport(): Promise<Record<string, unknown>> {
    return {
      timestamp: Date.now(),
      thresholds: performanceThresholds,
      activeTimers: Array.from(this.activeTimers.keys()),
      summary: 'Performance testing utilities initialized and ready'
    };
  }
}