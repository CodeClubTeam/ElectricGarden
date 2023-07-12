import { AppState } from '../types';

export const errorOrUndefinedSelector = (state: AppState) => state.error.error;
