import AsyncQueue from '../async-queue';

async function collect<T>(queue: AsyncQueue<T>) {
  const result = [];

  for await (const value of queue) {
    result.push(value);
  }

  return result;
}

describe('AsyncQueue', () => {
  it('returns items from the queue', async () => {
    const queue = AsyncQueue.of([1, 2, 3]);

    await expect(collect(queue)).resolves.toEqual([1, 2, 3]);
  });

  it('yields items added asynchronously', async () => {
    const queue = new AsyncQueue();
    const promise = collect(queue);

    queue.append('first');
    queue.append('second');
    queue.end();

    await expect(promise).resolves.toEqual(['first', 'second']);
  });

  it('correctly orders early and async value payloads', async () => {
    const queue = new AsyncQueue();

    queue.append(1);
    queue.append(2);
    const promise = collect(queue);
    queue.append(3);
    queue.append(4);
    queue.end();

    await expect(promise).resolves.toEqual([1, 2, 3, 4]);
  });
});
