export class HealthService {
  public getStatus() {
    return { status: 'ok' };
  }
}

export const healthService = new HealthService();
