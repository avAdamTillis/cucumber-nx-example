import { StringLogLevel } from './interfaces';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: StringLogLevel;
    }
  }
}

export * from './interfaces';