import { createStructuredSelector, Selector } from 'reselect';

import { AppState } from '../types';

type StructuredSelectorFor<T extends Structure> = {
    [K in keyof T]: ReturnType<T[K]>;
};

type Structure = {
    [key: string]: AppSelector<any>;
};

export const createAppStructuredSelector = <T extends Structure>(
    structure: T,
) => createStructuredSelector<AppState, StructuredSelectorFor<T>>(structure);

export type AppSelector<TOutput> = Selector<AppState, TOutput>;
