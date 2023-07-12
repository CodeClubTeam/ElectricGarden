import { removedTeam, updatedOrCreatedTeam } from './actions';

export * from './teamsReducer';
export * from './components/TeamRoutes';
export { teamsSelector, teamOptionsSelector } from './selectors';
export { TeamQuickAdd } from './components/TeamQuickAdd';
export const teamActions = { removedTeam, updatedOrCreatedTeam };
