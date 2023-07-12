import { combineReducers } from 'redux';
import { chartViewReducer } from './chartViewReducer';

export const viewReducer = combineReducers({
    chartView: chartViewReducer,
});
