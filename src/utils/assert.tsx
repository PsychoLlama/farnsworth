/**
 * Throw an error if the value is falsy. Use this to provide better error
 * messages around expected conditions.
 *
 * Also provides TypeScript type narrowing.
 */
export default function assert(value: unknown, msg: string): asserts value {
  if (!value) {
    const error = new Error(msg);
    error.name = 'Assertion';

    throw error;
  }
}
