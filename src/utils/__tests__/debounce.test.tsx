import debounce from '../debounce';

jest.useFakeTimers();

describe('debounce', () => {
  it('delays invocation until the time elapses', () => {
    const spy = jest.fn();
    const wrapper = debounce(1000, spy);

    wrapper();

    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalled();
  });

  it('only invokes the function once if called within the time frame', () => {
    const spy = jest.fn();
    const wrapper = debounce(1000, spy);

    wrapper();
    wrapper();
    wrapper();

    jest.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not swallow later invocations after the timeout expires', () => {
    const spy = jest.fn();
    const wrapper = debounce(1000, spy);

    wrapper();
    jest.runAllTimers();

    wrapper();
    jest.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('passes all the arguments through', () => {
    const spy = jest.fn();
    const wrapper = debounce(1000, spy);

    wrapper('a', 'b', 'c');
    jest.runAllTimers();

    expect(spy).toHaveBeenCalledWith('a', 'b', 'c');
  });

  it('allows you to clear the debounced timer', () => {
    const spy = jest.fn();
    const wrapper = debounce(1000, spy);

    wrapper(null);
    wrapper.clear();
    jest.runAllTimers();

    expect(spy).not.toHaveBeenCalled();
  });
});
