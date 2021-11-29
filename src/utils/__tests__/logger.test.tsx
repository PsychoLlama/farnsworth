import debug from 'debug';
import Logger from '../logger';
import { APP_NAME } from '../constants';

jest.mock('debug', () => {
  return Object.assign(
    jest.fn(() => jest.fn()),
    { enable: jest.fn() },
  );
});

describe('Logger', () => {
  it('appropriately prefixes the debug name', () => {
    const logger = new Logger('Logger');

    logger.debug('msg');

    expect(debug).toHaveBeenCalledWith(`${APP_NAME}:Logger`);
    expect((debug as any).mock.results[0].value).toHaveBeenCalledWith('msg');
  });

  it('creates different logging contexts for each log level', () => {
    const logger = new Logger('Logger');

    logger.debug('msg');
    logger.warn('msg');
    logger.error('msg');

    expect(debug).toHaveBeenCalledWith(`${APP_NAME}:Logger`);
    expect(debug).toHaveBeenCalledWith(`${APP_NAME}:Logger:WARN`);
    expect(debug).toHaveBeenCalledWith(`${APP_NAME}:Logger:ERROR`);
    expect((debug as any).mock.results[0].value).toHaveBeenCalledWith('msg');
  });
});
