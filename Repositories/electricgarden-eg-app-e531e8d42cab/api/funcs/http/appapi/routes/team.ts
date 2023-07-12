import {
  Growable,
  Team,
  TeamDocument,
  TeamMembership,
  TeamMembershipDocument,
  TeamMembershipRole,
  teamMembershipRoles,
  User,
} from '@eg/doc-db';
import * as yup from 'yup';
import { AppRequestHandler } from '../typings';

interface TeamMembershipResource {
  userId: string;
  role: TeamMembershipRole;
}

interface TeamResource {
  id: string;
  name: string;
  memberships: TeamMembershipResource[];
  createdOn: Date;
}

const mapToResource = ({
  id,
  name,
  memberships,
  _created: createdOn,
}: TeamDocument): TeamResource => ({
  id,
  name,
  memberships: memberships.map(({ userId, role }) => ({
    userId: userId.toString(),
    role: role || 'member',
  })),
  createdOn,
});

const mapFromMembershipResources = async (
  organisationId: string,
  membershipResources: TeamMembershipResource[],
): Promise<TeamMembershipDocument[]> => {
  const userIds = membershipResources.map(({ userId }) => userId);
  const rolesByUserId = membershipResources.reduce(
    (result, { userId, role }) => {
      result[userId] = role as TeamMembershipRole;
      return result;
    },
    {} as Record<string, TeamMembershipRole>,
  );
  const validatedMemberships = (
    await User.find({
      _id: { $in: userIds },
    }).or([{ _organisation: organisationId }, { role: 'su' }])
  ).map(
    (user) =>
      new TeamMembership({ userId: user.id, role: rolesByUserId[user.id] }),
  );
  return validatedMemberships;
};

type ValidatorCreateOptions = {
  inserting?: boolean;
};
const validRoles = [...teamMembershipRoles];

const teamValidatorCreate = ({ inserting }: ValidatorCreateOptions) =>
  yup
    .object()
    .shape({
      name: yup
        .string()
        .required()
        .test(
          'unique-name',
          'A team with name ${value} already exists.',
          async (name) => {
            if (!inserting) {
              return true;
            }
            const existing = !!name && (await Team.findOneByName(name));
            return !existing;
          },
        ),
      memberships: yup
        .array<TeamMembershipResource>(
          yup
            .object()
            .shape<TeamMembershipResource>({
              userId: yup.string().required(),
              role: yup
                .mixed()
                .oneOf(validRoles)
                .default('member' as const)
                .required(),
            })
            .required(),
        )
        .ensure()
        .test(
          'no-dupes',
          'Members cannot have the same person twice.',
          (members) =>
            !!members &&
            !members.find(
              ({ userId }) =>
                members.filter((m) => m.userId === userId).length > 1,
            ),
        ),
    })
    .required();

const teamIdFromParamsValidator = yup
  .object()
  .shape({
    teamId: yup.string().required(),
  })
  .required();

export const getSingleById: AppRequestHandler = async (req, res) => {
  const { teamId } = teamIdFromParamsValidator.validateSync(req.params);

  const team = await Team.findOneById(teamId);
  if (!team) {
    return res.sendStatus(404);
  }
  res.send(mapToResource(team));
};

const userIdFromQueryValidator = yup
  .object()
  .shape({
    userId: yup.string().notRequired(),
  })
  .required();
export const getList: AppRequestHandler = async (req, res) => {
  let teams: TeamDocument[];

  const { userId } = userIdFromQueryValidator.validateSync(req.query);

  if (userId) {
    teams = await Team.findByOrganisationMembershipUserId(
      req.user.organisationId,
      userId,
    );
  } else {
    teams = await Team.findByOrganisation(req.user.organisationId);
  }
  res.send(teams.map(mapToResource));
};

export const create: AppRequestHandler = async (req, res) => {
  const { name, memberships } = await teamValidatorCreate({
    inserting: true,
  }).validate(req.body);
  const organisationId = req.user._organisation;

  const team = new Team({
    _organisation: req.user._organisation,
    name,
    memberships: await mapFromMembershipResources(
      organisationId,
      memberships ?? [],
    ),
  });
  await team.save();

  res.status(201).location(`/v1/teams/${team.id}`).send(mapToResource(team));
};
create.requiredRole = 'leader' as const;

export const update: AppRequestHandler = async (req, res) => {
  const { teamId } = teamIdFromParamsValidator.validateSync(req.params);
  const { name, memberships } = await teamValidatorCreate({
    inserting: false,
  }).validate(req.body);

  const organisationId = req.user.organisationId;
  const desiredMemberships = await mapFromMembershipResources(
    organisationId,
    memberships ?? [],
  );

  const team = await Team.findOneById(teamId);
  if (!team) {
    return res.status(412).send('Can only update existing resource with PUT.');
  }
  if (!team._organisation.equals(organisationId)) {
    return res.sendStatus(403);
  }
  team.name = name;

  for (const membership of team.memberships) {
    const { userId } = membership;
    const desired = desiredMemberships.find((m) => userId.equals(m.userId));
    if (!desired) {
      team.removeMembership(membership);
    } else {
      membership.role = desired.role;
    }
  }

  const membershipsToAdd = desiredMemberships.filter(
    ({ userId }) => !team.memberships.find((m) => m.userId.equals(userId)),
  );
  for (const membership of membershipsToAdd) {
    team.addMembership(membership);
  }

  await team.save();
  res.status(200).send(mapToResource(team));
};
update.requiredRole = 'leader' as const;

export const remove: AppRequestHandler = async (req, res) => {
  const { teamId } = teamIdFromParamsValidator.validateSync(req.params);
  const team = await Team.findOneById(teamId);
  if (team) {
    // this is not how we want to enforce tenant isolation!
    // example to pass the test written for this case
    if (!team._organisation.equals(req.user.organisationId)) {
      return res.status(403).send({
        userOrg: req.user.organisationId,
        teamOrg: team._organisation.toString(),
      });
    }

    const growables = await Growable.findByOrganisationTeam(
      req.user.organisationId,
      team.id,
    );
    if (growables.length) {
      return res
        .status(412)
        .send(
          `The team ${team.name} has ${growables.length} growables that must be deleted from Our Garden first.`,
        );
    }
    await team.remove();
  }
  return res.sendStatus(204);
};
remove.requiredRole = 'leader' as const;
