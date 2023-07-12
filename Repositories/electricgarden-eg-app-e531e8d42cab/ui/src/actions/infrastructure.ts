import React from 'react';
import { createAction, createPromiseAction } from 'redux-helper';

import {
    HttpResponseError,
    HttpValidationResponseError,
} from '../data/server/HttpResponseError';

export const promiseActionStart = createAction<string | undefined>(
    'PROMISE_ACTION_START',
);

export const promiseActionEnd = createAction('PROMISE_ACTION_END');

export const promiseActionError = createAction<{ message?: string }>(
    'PROMISE_ACTION_ERROR',
);

export const dismissError = createAction<void>('DISMISS_ERROR');

export const httpError = createAction<HttpResponseError>('HTTP_ERROR');

export interface ValidationError {
    validationErrors: string[];
}

export const httpValidationErrorReceived = createAction<ValidationError>(
    'HTTP_VALIDATION_ERROR_RECEIVED',
);
export const httpValidationError = createPromiseAction<
    HttpValidationResponseError,
    ValidationError
>(
    'HTTP_VALIDATION_ERROR',
    async (httpError) =>
        httpError
            ? {
                  validationErrors: await httpError.getValidationErrors(),
              }
            : { validationErrors: [] },
    httpValidationErrorReceived,
);

export const uiError = createAction<{
    error: Error;
    errorInfo: React.ErrorInfo;
}>('UI_ERROR');
