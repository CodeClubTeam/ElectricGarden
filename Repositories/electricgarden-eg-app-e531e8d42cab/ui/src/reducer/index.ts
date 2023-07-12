import { combineReducers } from 'redux';

import { suSensorsReducer } from '../pages/SupportHardware';
import { lessonsReducer } from '../pages/Lessons';
import { organisationsReducer } from '../pages/Organisation';
import { currentOrganisationReducer } from './currentOrganisationReducer';
import { errorReducer } from './errorReducer';
import { growerReducer } from './growerReducer';

const rootReducer = combineReducers({
    grower: growerReducer,
    organisations: organisationsReducer,
    lessons: lessonsReducer,
    currentOrganisation: currentOrganisationReducer,
    error: errorReducer,
    suSensors: suSensorsReducer,
});

export default rootReducer;
