import {
  OrgDocument,
  Team,
  TeamDocument,
  TeamMembership,
  TeamMembershipRole,
  UserDocument,
} from '@eg/doc-db';

type AddTeamOptions = {
  name: string;
};

export const addTeam = async (
  organisation: OrgDocument,
  { name }: AddTeamOptions,
) => {
  const team = new Team({
    name,
    _organisation: organisation,
  });

  await team.save();

  return team;
};

const userDefaultTeamRole = (user: UserDocument): TeamMembershipRole =>
  user.role === 'member' ? 'member' : 'leader';

export const addMember = async (
  team: TeamDocument,
  user: UserDocument,
  role?: TeamMembershipRole,
) => {
  team.addMembership(
    new TeamMembership({
      userId: user.id,
      role: role ?? userDefaultTeamRole(user),
    }),
  );
  await team.save();
};
