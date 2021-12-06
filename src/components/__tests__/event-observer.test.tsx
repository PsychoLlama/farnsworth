import React from 'react';
import renderer from '../../testing/renderer';
import EventObserver from '../event-observer';

describe('EventObserver', () => {
  const setup = renderer(EventObserver, {
    getDefaultProps: () => ({
      eventName: 'click',
      onEvent: jest.fn(),
      target: document.body,
    }),
  });

  it('converts global events to local prop events', () => {
    const { props } = setup();

    const event = new Event('click');
    document.body.dispatchEvent(event);

    expect(props.onEvent).toHaveBeenCalledWith(event);
  });

  it('renders the children', () => {
    const Noop = () => null;
    const { output } = setup({
      children: <Noop />,
    });

    expect(output.find(Noop).exists()).toBe(true);
  });

  it('unsubscribes on unmount', () => {
    const { output, props } = setup({
      eventName: 'click',
      target: document.body,
    });

    output.unmount();
    document.body.dispatchEvent(new Event('click'));

    expect(props.onEvent).not.toHaveBeenCalled();
  });

  it('can completely change the event target', () => {
    const { output, props } = setup({
      eventName: 'click',
      target: document.body,
    });

    output.setProps({
      eventName: 'keydown',
      target: window,
    });

    const expectedEvent = new Event('keydown');
    window.dispatchEvent(expectedEvent);

    expect(props.onEvent).toHaveBeenCalledTimes(1);
    expect(props.onEvent).toHaveBeenCalledWith(expectedEvent);
  });
});
