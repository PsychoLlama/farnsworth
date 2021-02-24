/* eslint-env jest */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Sourced from:
 * https://github.com/PsychoLlama/ponder/blob/d7170e16001e333410d385b94e63fa4fbe1a7f05/packages/ponder-test-utils/src/index.tsx
 */

// type Config<Props, ConfigureState> = {
//   getDefaultProps?: () => Props;
// };

// Reduces the boilerplate for creating component test functions.
// Returns a render function that accepts props to overwrite,
// and assumes defaults were provided.
//
// Example:
// const setup = renderer(Component, {
//   getDefaultProps: () => ({
//     type: 'controlled-input',
//     id: 'default-id',
//   }),
// })
//
// const { output, props } = setup({ id: 'overridden' })
// output == <Component id="overridden" type="controlled-input" />
export default function renderer<Props>(
  Cmp: React.ComponentType<Props>,
  config: Config<Props>,
) {
  return (overrides?: Partial<MockedProps<Props>>) => {
    const props: MockedProps<Props> = {
      ...config.getDefaultProps(),
      ...overrides,
    };

    const output = shallow(<Cmp {...props} />);
    return { output, props };
  };
}

interface Config<Props> {
  getDefaultProps: () => MockedProps<Props>;
}

type MockedProps<Props> = {
  [prop in keyof Props]: Props[prop] extends (...args: any[]) => any
    ? jest.MockedFunction<Props[prop]>
    : Props[prop];
};
