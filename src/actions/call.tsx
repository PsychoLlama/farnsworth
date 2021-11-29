import { createAction } from 'retreon';
import * as effects from '../effects';

export const leave = createAction('call/leave', effects.call.leave);
