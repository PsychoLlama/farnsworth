import { DebuggingTools } from '../tinker';

describe('DebuggingTools', () => {
  it('can add tools', () => {
    const debug = new DebuggingTools();
    const result = debug.addTool('name', 'value');

    expect(debug.getTools()).toEqual({ name: 'value' });
    expect(result).toBe('value');
  });

  it('can expose itself on the global scope', () => {
    const debug = new DebuggingTools();

    delete globalThis.tinker;
    debug.exposeAsGlobal();

    expect(globalThis.tinker()).toEqual(debug.getTools());
  });

  it('correctly determines when it is enabled', () => {
    const debug = new DebuggingTools();

    process.env.NODE_ENV = 'development';
    process.env.ENABLE_DEBUGGING = '';
    expect(debug.enabled()).toBe(true);

    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEBUGGING = '';
    expect(debug.enabled()).toBe(false);

    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEBUGGING = 'not-empty';
    expect(debug.enabled()).toBe(true);
  });
});
