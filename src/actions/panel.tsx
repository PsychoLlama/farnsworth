import { createAction } from 'retreon';

export const open = createAction('panel/open');
export const close = createAction('panel/close');
export const toggle = createAction('panel/toggle');
export const showChat = createAction('panel/show-chat');
export const showSettings = createAction('panel/show-settings');
