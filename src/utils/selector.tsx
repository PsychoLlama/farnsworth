/**
 * Creates a single-cache memoizer. This is a tiny replacement for `reselect`.
 */
export default function selector<T, Ret>(fn: (value: T) => Ret) {
  let lastVal: T;
  let cache: Ret;

  return (value: T) => {
    if (value === lastVal) return cache;
    lastVal = value;
    cache = fn(value);

    return cache;
  };
}
