import { combineReducers } from 'redux';

import { organisationsReducer } from '../pages/Organisation';
import { asyncStateReducer } from './asyncStateReducer';
import { currentOrganisationReducer } from './currentOrganisationReducer';
import { currentUserReducer } from './currentUserReducer';
import { errorReducer } from './errorReducer';
import { viewReducer } from '../pages/Dashboard';

const rootReducer = combineReducers({
    currentUser: currentUserReducer,
    organisations: organisationsReducer,
    currentOrganisation: currentOrganisationReducer,
    error: errorReducer,
    asyncState: asyncStateReducer,
    view: viewReducer, // this one should be split into state for current org and settings, former goes into currentOrgReducer
});

export default rootReducer;
