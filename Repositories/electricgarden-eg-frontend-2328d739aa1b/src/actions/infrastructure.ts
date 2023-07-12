import { createAction } from 'redux-helper';

export const promiseActionStart = createAction<string | undefined>(
    'PROMISE_ACTION_START',
);

export const promiseActionEnd = createAction('PROMISE_ACTION_END');

export const promiseActionError = createAction<{ message?: string }>(
    'PROMISE_ACTION_ERROR',
);

export const dismissError = createAction<void>('DISMISS_ERROR');
