export function generateAppReadyTemplate() {
  return `export class AppReady {
    private static instance: AppReady;
    private readinessMap: Map<string, boolean> = new Map();

    private constructor() {}

    static getInstance(): AppReady {
      if (!AppReady.instance) {
        AppReady.instance = new AppReady();
      }
      return AppReady.instance;
    }

    set(service: string, status: boolean): void {
      this.readinessMap.set(service, status);
    }

    get(service: string): boolean {
      return this.readinessMap.get(service) || false;
    }

    getAll(): Record<string, boolean> {
      return Object.fromEntries(this.readinessMap.entries());
    }

    isAllReady(): boolean {
      for (const status of this.readinessMap.values()) {
        if (!status) return false;
      }
      return true;
    }`
  }
