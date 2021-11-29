import debug from 'debug';
import { APP_NAME } from './constants';

// Enable app debugging by default.
if (process.env.NODE_ENV !== 'test' && !localStorage.getItem('debug')) {
  debug.enable(`${APP_NAME}:*`);
}

/**
 * General-purpose logging utility.
 */
export default class Logger {
  debug: Printer;
  warn: Printer;
  error: Printer;

  /**
   * The context is used to filter logs. Usually named after the module's
   * class or the file name.
   */
  constructor(context: string) {
    this.debug = debug(`${APP_NAME}:${context}`);
    this.warn = debug(`${APP_NAME}:${context}:WARN`);
    this.error = debug(`${APP_NAME}:${context}:ERROR`);
  }
}

interface Printer {
  (atLeastOneArg: unknown, ...args: unknown[]): void;
}
