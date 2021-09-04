import defer, { DeferredPromise } from './defer';

/**
 * Turns an async iterable into an imperative interface. Push values onto the
 * stack and they are yielded out of the iterator.
 */
export default class AsyncQueue<T> {
  static of<T>(data: Array<T>) {
    const queue = new AsyncQueue();

    data.forEach((value) => queue.append(value));
    queue.end();

    return queue as AsyncQueue<T>;
  }

  // Queue of items ready to be consumed. This is used when we're filling
  // values before the iterator requests them.
  private ready: Array<DeferredPromise<T>> = [];

  // Queue of demands by the iterator. Used when we're running behind, and
  // there aren't enough values to satisfy the iterator's requests.
  private pending: Array<DeferredPromise<T>> = [];

  async *[Symbol.asyncIterator]() {
    while (true) {
      try {
        yield await this.drawNextItem();
      } catch (error) {
        // Deferred promises don't contain execution code, they are purely
        // used as value containers. The only way they can reject is
        // intentionally through `.end()`.
        return;
      }
    }
  }

  private drawNextItem() {
    // The iterator is slower than the supply.
    if (this.ready.length) {
      return this.ready.shift().promise;
    }

    // The iterator is faster than the supply.
    const request = defer<T>();
    this.pending.push(request);

    return request.promise;
  }

  /**
   * Append an item to the iterator's queue.
   */
  append(value: T) {
    if (this.pending.length) {
      const request = this.pending.shift();
      request.resolve(value);
    } else {
      const item = defer<T>();
      item.resolve(value);
      this.ready.push(item);
    }
  }

  /**
   * Once the queue runs out of resources, gracefully close the iterator.
   */
  end() {
    const error = new Error('AsyncQueue: ended gracefully');

    if (this.pending.length) {
      const request = this.pending.shift();
      request.reject(error);
    } else {
      const termination = defer<T>();
      termination.reject(error);
      this.ready.push(termination);
    }
  }
}
