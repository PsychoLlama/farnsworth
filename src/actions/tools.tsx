import { createAction, nothing } from 'retreon';
import { State } from '../reducers/initial-state';

/**
 * This is a low-level debugging and testing utility. It applies arbitrary
 * patches to state. If debugging is enabled, you can use it via:
 *
 *   tinker().sdk.tools.patch(...)
 *
 * This is best used to troubleshoot the app and test new features.
 * NOT FOR GENERAL USE.
 */
export const patch =
  createAction<(state: State) => void | typeof nothing | State>('tools/patch');
