import { memoize } from 'lodash-es';

export const featureSwitchedOn = memoize((name: string) =>
    (process.env.REACT_APP_FEATURE_SWITCHES || '')
        .split(',')
        .map((value) => value.trim())
        .includes(name),
);
