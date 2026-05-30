export class Logger {
  public log(name: string, ...args: unknown[]) {
    if (!import.meta.env.PROD) {
      console.log(`[Logger][${name}]`, ...args);
    }
  }

  public error(name: string, ...args: unknown[]) {
    console.error(`[Logger][${name}]`, ...args);
  }
}

export const logger = new Logger();
