import { combineReducers } from 'redux';
import { growablesReducer } from './growablesReducer';
import { observationsReducer } from './observationsReducer';
import { viewStateReducer } from './viewStateReducer';

export const gardenReducer = combineReducers({
    growables: growablesReducer,
    observations: observationsReducer,
    viewState: viewStateReducer,
});
