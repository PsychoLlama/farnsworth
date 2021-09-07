import createDebug from 'debug';
import { APP_NAME } from './constants';

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
    this.debug = createDebug(`${APP_NAME}:${context}`);
    this.warn = createDebug(`${APP_NAME}:${context}:WARN`);
    this.error = createDebug(`${APP_NAME}:${context}:ERROR`);
  }
}

interface Printer {
  (atLeastOneArg: unknown, ...args: unknown[]): void;
}
