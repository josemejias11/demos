// Minimal DI container stub for demo tests
export class Container {
  private static instance: Container;
  private services = new Map<string, any>();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) Container.instance = new Container();
    return Container.instance;
  }

  // Return a mock service by name. Tests expect services like 'telemetryCollector'
  get(name: string) {
    if (!this.services.has(name)) {
      // Provide simple default implementations for common services
      const service = {
        locate: () => null,
        collect: () => {},
        log: (..._args: any[]) => {},
        recordEvent: (_name: string, _payload?: any) => {},
      };
      this.services.set(name, service);
    }
    return this.services.get(name);
  }

  set(name: string, value: any) {
    this.services.set(name, value);
  }
}

export default Container.getInstance();
