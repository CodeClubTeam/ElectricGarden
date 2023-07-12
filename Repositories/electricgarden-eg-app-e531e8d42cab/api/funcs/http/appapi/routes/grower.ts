import { LEARNER_LEVEL_DEFAULT } from '@eg/core';
import {
  Organisation,
  Team,
  TeamDocument,
  User,
  UserDocument,
  UserRole,
  Learner,
  OrgDocument,
  UserStatus,
} from '@eg/doc-db';

import { AppRequestHandler } from '../typings';

interface GrowerResource {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  learnerLevel: number;
  createdOn: Date;
  status: UserStatus;
  organisation: {
    id: string;
    name: string;
    mode: OrgDocument['mode'];
  };
  teams: Array<{
    id: string;
    name: string;
  }>;
}

export const get: AppRequestHandler = async (req, res) => {
  const userId = req.user.id;

  const teamsQuery =
    req.user.role === 'su'
      ? () => Team.findByOrganisation(req.user.organisationId)
      : () =>
          Team.findByOrganisationMembershipUserId(
            req.user.organisationId,
            userId,
          );

  const [user, teams] = await Promise.all<UserDocument | null, TeamDocument[]>([
    User.findById(userId).populate('_organisation').exec(),
    teamsQuery(), // would be nice to one round trip but looks complicated
  ]);
  if (!user) {
    return res.sendStatus(404);
  }

  const { id, name, email, role, status, _created: createdOn } = user;
  const organisation =
    user.organisationId === req.user.organisationId
      ? user.organisation
      : await Organisation.findById(req.user.organisationId);
  if (!organisation) {
    throw new Error(
      `Impersonated org not found with id: ${req.user.organisationId}`,
    );
  }

  // on-the-fly legacy data patch
  let { learner } = user;
  if (!learner) {
    user.learner = new Learner({ level: LEARNER_LEVEL_DEFAULT });
    await user.save();
    learner = user.learner;
  }

  const resource: GrowerResource = {
    id,
    name,
    email,
    role,
    learnerLevel: learner.level,
    status,
    createdOn,
    organisation: {
      id: organisation.id,
      name: organisation.name,
      mode: organisation.mode,
    },
    teams: teams.map(({ id, name }) => ({ id, name })),
  };
  res.send(resource);
};
