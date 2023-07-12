import { applyMiddleware, createStore, Reducer, Store, AnyAction } from 'redux';
import checkedPromiseMiddleware, {
    CheckedPromiseMiddlewareOptions,
} from 'redux-helper';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import {
    promiseActionEnd,
    promiseActionError,
    promiseActionStart,
} from '../actions';
import { AppState } from '../types';

const opts: CheckedPromiseMiddlewareOptions = {
    onStart: promiseActionStart,
    onEnd: promiseActionEnd,
    onError: promiseActionError,
};

const composeEnhancers = composeWithDevTools({});

const cpm = checkedPromiseMiddleware(opts);

let store: Store<AppState>;

export function getStore(reducer?: Reducer) {
    if (reducer) {
        if (!store) {
            store = createStore<AppState, AnyAction, {}, {}>(
                reducer,
                composeEnhancers(applyMiddleware(cpm, thunk)),
            );
        } else {
            store.replaceReducer(reducer);
        }
    }
    return store;
}
