import { createSelector } from 'reselect';

import { AppState } from '../types';
import { Role, RoleIndex } from '../utils';

export const currentUserOrNullSelector = (appState: AppState) =>
    appState.currentUser;

export const isLoggedInSelector = createSelector(
    currentUserOrNullSelector,
    (user) => !!user,
);

export const currentUserNameSelector = createSelector(
    currentUserOrNullSelector,
    (user) => (user ? user.name : '[user]'),
);

export const currentUserPathSelector = createSelector(
    currentUserOrNullSelector,
    (user) => (user ? `/users/${user.id}` : ''),
);

export const rollCheck = createSelector(
    currentUserOrNullSelector,
    (currentUser) => (minRole: Role) => {
        if (!currentUser) {
            return false;
        }
        const minRoleNumber = RoleIndex[minRole];
        const currentUserRoleNumber = RoleIndex[currentUser.role];
        return currentUserRoleNumber >= minRoleNumber;
    },
);

export const currentOrganisationStateSelector = (appState: AppState) =>
    appState.currentOrganisation.state;

export const currentOrganisationIdOrUndefinedSelector = (appState: AppState) =>
    appState.currentOrganisation.id;

export const currentOrganisationIdSelector = createSelector(
    currentOrganisationIdOrUndefinedSelector,
    (id) => {
        if (!id) {
            throw new Error('Expected organisation to be selected');
        }
        return id;
    },
);

export const currentOrganisationOrUndefinedSelector = createSelector(
    currentOrganisationIdOrUndefinedSelector,
    (state: AppState) => state.organisations, // direct here to avoid circular dep
    (orgId, organisationsById): ServerOrganisation | undefined => {
        if (!orgId) {
            return undefined;
        }
        return organisationsById[orgId];
    },
);

export const currentOrganisationSelector = createSelector(
    currentOrganisationOrUndefinedSelector,
    (org) => {
        if (!org) {
            throw new Error('Expected organisation to be selected.');
        }
        return org;
    },
);
