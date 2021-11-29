/* eslint-disable @typescript-eslint/no-explicit-any, prefer-spread */

/**
 * A debounce function that doesn't carry the baggage of lodash, and twice as
 * simple.
 */
export default function debounce<Callback extends (...args: any) => any>(
  delay: number,
  cb: Callback,
) {
  let timeout = null;

  function wrapper(...args: Parameters<Callback>) {
    clearTimeout(timeout);

    // Using `.concat(...)` instead of `...args` to avoid TypeScript errors.
    // If it works for you, feel free to change it back.
    timeout = setTimeout.apply(null, [cb, delay].concat(args));
  }

  const callback: any = Object.assign(wrapper, {
    clear() {
      clearTimeout(timeout);
    },
  });

  return callback as Callback & { clear: () => void };
}
