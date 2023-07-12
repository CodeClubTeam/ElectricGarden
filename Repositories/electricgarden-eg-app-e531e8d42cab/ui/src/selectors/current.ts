import { createSelector } from 'reselect';

import { AppState } from '../types';
import {
    makeMandatorySelector,
    Role,
    roleIncludesRole,
    OrgMode,
} from '../utils';

export const growerOrUndefinedSelector = (appState: AppState) =>
    appState.grower || undefined;

export const growerSelector = makeMandatorySelector(growerOrUndefinedSelector);

export const growerTeamsSelector = createSelector(
    growerSelector,
    ({ teams }) => teams,
);

export const growerHasMultipleTeamsSelector = createSelector(
    growerTeamsSelector,
    (teams) => teams.length > 1,
);

export const currentUserOrUndefinedSelector = createSelector(
    growerOrUndefinedSelector,
    (grower): ServerUser | undefined => {
        if (!grower) {
            return undefined;
        }
        const { teams, organisation, ...user } = grower;
        return user;
    },
);

export const currentUserSelector = makeMandatorySelector(
    currentUserOrUndefinedSelector,
    'Expected a current user',
);

export const isLoggedInSelector = createSelector(
    currentUserOrUndefinedSelector,
    (grower) => !!grower,
);

export const currentUserNameSelector = createSelector(
    currentUserOrUndefinedSelector,
    (user) => (user ? user.name : '[user]'),
);

export const currentUserRoleSelector = createSelector(
    currentUserSelector,
    (user) => user.role,
);

export const currentUserAdminPathSelector = createSelector(
    currentUserOrUndefinedSelector,
    (user) => (user ? `/admin/users/${user.id}` : ''),
);

type RollCheck = (minRole: Role) => boolean;

export const canHaveRoleSelector = createSelector(
    currentUserOrUndefinedSelector,
    (currentUser): RollCheck => (minRole) => {
        if (!currentUser) {
            return false;
        }
        return roleIncludesRole(currentUser.role, minRole);
    },
);

export const currentOrganisationStateSelector = (appState: AppState) =>
    appState.currentOrganisation.state;

export const currentOrganisationIdOrUndefinedSelector = (appState: AppState) =>
    appState.currentOrganisation.id || undefined;

export const currentOrganisationNameOrUndefinedSelector = (
    appState: AppState,
) => appState.currentOrganisation.name;

export const currentOrganisationModeOrUndefinedSelector = (
    appState: AppState,
) => appState.currentOrganisation.mode;

export const currentOrganisationIdSelector = makeMandatorySelector(
    currentOrganisationIdOrUndefinedSelector,
    'Expected organisation to be selected',
);

export const currentOrganisationNameSelector = makeMandatorySelector(
    currentOrganisationNameOrUndefinedSelector,
    'Expected organisation to be selected',
);

export const currentOrganisationOrUndefinedSelector = createSelector(
    currentOrganisationIdOrUndefinedSelector,
    (state: AppState) => state.organisations, // direct here to avoid circular dep
    (
        orgId,
        { itemsByKey: organisationsById },
    ): ServerOrganisation | undefined => {
        if (!orgId) {
            return undefined;
        }
        return organisationsById[orgId];
    },
);

export const currentOrganisationSelector = makeMandatorySelector(
    currentOrganisationOrUndefinedSelector,
    'Expected organisation to be selected.',
);

const ALL_ROLES = [Role.kiosk, Role.member, Role.leader, Role.admin, Role.su];

export const rolesSelector = createSelector(
    currentOrganisationSelector,
    (org) =>
        org.mode === OrgMode.kiosk
            ? ALL_ROLES
            : ALL_ROLES.filter((r) => r !== Role.kiosk),
);

export const currentUserRolesSelector = createSelector(
    rolesSelector,
    canHaveRoleSelector,
    (roles, canHaveRole) => roles.filter(canHaveRole),
);
