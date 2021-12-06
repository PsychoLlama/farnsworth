import React from 'react';

export default class EventObserver extends React.Component<Props> {
  componentDidMount() {
    this.attachListener();
  }

  componentWillUnmount() {
    this.detachListener(this.props);
  }

  componentDidUpdate(prev: Props) {
    this.detachListener(prev);
    this.attachListener();
  }

  attachListener = () => {
    this.props.target.addEventListener(this.props.eventName, this.handleEvent);
  };

  detachListener = (props: Props) => {
    props.target.removeEventListener(props.eventName, this.handleEvent);
  };

  handleEvent = (event: Event) => {
    this.props.onEvent(event);
  };

  render() {
    return this.props.children;
  }
}

interface Props {
  children?: React.ReactNode;
  eventName: string;
  onEvent: (event: Event) => unknown;
  target: HTMLElement;
}
