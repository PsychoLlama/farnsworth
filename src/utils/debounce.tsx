/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A debounce function that doesn't carry the baggage of lodash, and twice as
 * simple.
 */
export default function debounce<Callback extends (...args: any) => any>(
  delay: number,
  cb: Callback,
): Callback {
  let timeout = null;

  function wrapper(...args: Parameters<Callback>) {
    clearTimeout(timeout);
    timeout = setTimeout(cb, delay, ...args);
  }

  return wrapper as Callback;
}
