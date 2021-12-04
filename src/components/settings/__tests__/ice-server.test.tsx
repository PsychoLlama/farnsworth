import renderer from '../../../testing/renderer';
import { IceServer } from '../ice-server';

describe('IceServer', () => {
  const setup = renderer(IceServer, {
    getDefaultProps: () => ({
      onClose: jest.fn(),
      id: 4,
    }),
  });

  it('closes the panel when you click cancel', () => {
    const { findByTestId, props } = setup();

    findByTestId('cancel-button').simulate('click');

    expect(props.onClose).toHaveBeenCalled();
  });
});
