import moment from 'moment';
import { Reducer } from 'redux';

import { setCurrentOrganisation } from '../../../actions';
import { ChartView, updateChartView } from '../actions';

let defaultChartView: ChartView = {
    visibleChartItems: {
        soilTemp: true,
        airTemp: true,
        soilMoisture: true,
        humidity: false,
        light: false,
        goldilocks: false,
    },
    dataChartDates: {
        startDate: moment().subtract(30, 'days'),
        endDate: moment(),
        focusedInput: null,
    },
};

export const chartViewReducer: Reducer<ChartView> = (
    state = defaultChartView,
    action,
) => {
    if (updateChartView.matchAction(action)) {
        return action.payload;
    } else if (setCurrentOrganisation.matchAction(action)) {
        return {
            ...state,
            currentSensor: undefined,
        };
    }
    return state;
};
