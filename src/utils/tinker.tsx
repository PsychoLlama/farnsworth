/**
 * A collection of app-specific debugging tools. Use `tinker()` to explore app
 * state and dispatch high-level actions.
 *
 * The tools are not defined here to avoid creating import cycles,
 * particularly with the SDK.
 *
 * Set `ENABLE_DEBUGGING=true` to forcibly enable this in production.
 */
export class DebuggingTools {
  tools = {};

  addTool<T>(name: string, value: T): T {
    this.tools[name] = value;
    return value;
  }

  getTools = () => {
    return this.tools;
  };

  enabled() {
    return (
      process.env.NODE_ENV !== 'production' || !!process.env.ENABLE_DEBUGGING
    );
  }

  exposeAsGlobal() {
    Object.defineProperty(globalThis, 'tinker', {
      configurable: true,
      value: this.getTools,
    });
  }
}

const tinker = new DebuggingTools();

if (tinker.enabled()) {
  tinker.exposeAsGlobal();
}

export default tinker;
