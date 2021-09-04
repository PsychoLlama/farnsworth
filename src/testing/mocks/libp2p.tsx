export class Stream<T> {
  static from<T>(data: Array<T>) {
    return new Stream(data);
  }

  source: AsyncGenerator<T>;

  // Used in testing: called for every value piped to the sink.
  observer = jest.fn();

  constructor(data: Array<T> = []) {
    this.source = this.consume(data);
  }

  private async *consume(data: Array<T>) {
    for (const value of data) {
      yield value;
    }
  }

  sink = async <A,>(stream: AsyncIterable<A>) => {
    for await (const value of stream) {
      this.observer(value);
    }
  };
}
