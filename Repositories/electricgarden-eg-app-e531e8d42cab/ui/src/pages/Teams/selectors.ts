import { sortBy } from 'lodash-es';
import { createSelector } from 'reselect';

import { AppSelector, currentOrganisationStateSelector } from '../../selectors';
import { createServerDataStateSelectors, thingToOption } from '../../utils';
import { usersByIdSelector } from '../Users';

const teamStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ teams }) => teams,
);

const selectors = createServerDataStateSelectors(teamStateSelector);

export const teamsFetchStateSelector = selectors.fetchStateSelector;

export const teamsSelector = selectors.items;

export const teamsByIdSelector = selectors.itemsByKey;

export const teamOptionsSelector = createSelector(teamsSelector, (teams) =>
    teams.map(thingToOption),
);

export const teamForIdSelectorCreate = (teamId: string) =>
    createSelector(teamsByIdSelector, (teamsById) => teamsById[teamId]);

type TeamOrUndefinedSelector = AppSelector<ServerTeam | undefined>;

const getUserIdsFromMembershipsWithRole = (
    memberships: TeamMembership[],
    selectedRole: TeamMembership['role'],
) =>
    memberships
        .filter(({ role }) => role === selectedRole)
        .map(({ userId }) => userId);

const userIdsOfMembersWithRoleSelectorCreate = (
    teamSelector: TeamOrUndefinedSelector,
    selectedRole: TeamMembership['role'],
) =>
    createSelector(teamSelector, (team): string[] => {
        if (!team) {
            return [];
        }
        return getUserIdsFromMembershipsWithRole(
            team.memberships,
            selectedRole,
        );
    });

const mapUserIdsToUsersCreate = (usersById: Record<string, ServerUser>) => (
    userIds: string[],
) =>
    userIds
        .map((userId) => usersById[userId])
        .filter((user): user is ServerUser => !!user);

const getCountOfRole = (
    memberships: TeamMembership[],
    filterRole: TeamMembership['role'],
) => memberships.filter(({ role }) => role === filterRole).length;

export const teamsSummarySelector = createSelector(
    teamsSelector,
    usersByIdSelector,
    (teams, usersById) => {
        const mapUserIdsToUsers = mapUserIdsToUsersCreate(usersById);
        const teamsSummary = teams.map(({ id, name, memberships }) => ({
            id,
            name,
            leaders: mapUserIdsToUsers(
                getUserIdsFromMembershipsWithRole(memberships, 'leader'),
            ).map(({ name }) => name),
            memberCount: getCountOfRole(memberships, 'member'),
        }));
        return sortBy(teamsSummary, 'name');
    },
);

const membershipToUserSelectorCreate = (
    teamSelector: TeamOrUndefinedSelector,
    selectedRole: TeamMembership['role'],
) =>
    createSelector(
        userIdsOfMembersWithRoleSelectorCreate(teamSelector, selectedRole),
        usersByIdSelector,
        (userIds, usersById): ServerUser[] =>
            mapUserIdsToUsersCreate(usersById)(userIds),
    );

export const teamDetailSelectorCreate = (
    teamSelector: TeamOrUndefinedSelector,
) =>
    createSelector(
        teamSelector,
        membershipToUserSelectorCreate(teamSelector, 'leader'),
        membershipToUserSelectorCreate(teamSelector, 'member'),
        (team, leaders, members) => {
            if (!team) {
                return undefined;
            }
            const { id, name, createdOn } = team;
            return {
                id,
                name,
                createdOn,
                leaders,
                members,
            };
        },
    );

export const teamEditSelectorCreate = (teamSelector: TeamOrUndefinedSelector) =>
    createSelector(
        teamSelector,
        userIdsOfMembersWithRoleSelectorCreate(teamSelector, 'leader'),
        userIdsOfMembersWithRoleSelectorCreate(teamSelector, 'member'),
        (team, leaderUserIds, memberUserIds) => {
            if (!team) {
                return undefined;
            }
            const { id, name } = team;
            return {
                id,
                name,
                leaderUserIds,
                memberUserIds,
            };
        },
    );
