import { ObjectId } from 'mongodb';

import { commonOrgModel } from '../collectionModels';
import { orgBaseConfig } from '../config';
import mongoose from '../db';
import { Organisation, OrgDocument } from './organisation';
import { TeamMembershipDocument, teamMembershipSchema } from './teamMembership';

export interface TeamDocument extends mongoose.Document {
  _organisation: mongoose.Types.ObjectId;
  name: string;
  memberships: mongoose.Types.Array<TeamMembershipDocument>;
  readonly _created: Date;
  readonly organisationId: string;
  readonly organisation: OrgDocument;

  addMembership: (membership: TeamMembershipDocument) => void;
  removeMembership: (membership: TeamMembershipDocument) => void;
}

export interface TeamModel extends mongoose.Model<TeamDocument> {
  findOneById: (id: string | ObjectId) => Promise<TeamDocument | undefined>;
  findOneByName: (name: string) => Promise<TeamDocument | undefined>;
  findByOrganisationMembershipUserId: (
    organisationId: string | ObjectId,
    userId: string | ObjectId,
  ) => Promise<TeamDocument[]>;
  findByOrganisation: (orgId: string | ObjectId) => Promise<TeamDocument[]>;
}

const teamSchema = new mongoose.Schema<TeamDocument>(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    memberships: [teamMembershipSchema],
    // sensors: [mongoose.Schema.Types.ObjectId],
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  orgBaseConfig,
);

teamSchema.statics.findByOrganisationMembershipUserId = function (
  organisationId: string | ObjectId,
  userId: string | ObjectId,
) {
  if (
    !mongoose.Types.ObjectId.isValid(organisationId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return [];
  }
  return this.find({
    _organisation: organisationId,
    'memberships.userId': userId,
  }).exec();
};

teamSchema.statics.findOneByName = function (name: string) {
  return this.findOne({ name }).exec();
};

teamSchema.statics.findOneById = function (teamId: string | ObjectId) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return undefined;
  }
  return this.findById(teamId).exec();
};

teamSchema.statics.findByOrganisation = function (
  organisationId: string | ObjectId,
) {
  if (!mongoose.Types.ObjectId.isValid(organisationId)) {
    return [];
  }
  return this.find({ _organisation: organisationId }).exec();
};

teamSchema.methods.addMembership = function (
  membership: TeamMembershipDocument,
) {
  this.memberships.push(membership);
};

teamSchema.methods.removeMembership = function (
  membership: TeamMembershipDocument,
) {
  this.memberships.remove(membership);
  // types are wrong it would seem as this is not a promise at runtime
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  membership.remove(); // only required on cosmosdb (!) but no-op on real mongodb
};

teamSchema.post('remove', function (
  team: TeamDocument,
  next: (err?: any) => void,
) {
  const removeAsDefault = async () => {
    const organisation = await Organisation.findOneById(team._organisation);
    if (organisation && team._id.equals(organisation.defaults.teamId)) {
      organisation.defaults.teamId = undefined;
      await organisation.save();
    }
  };

  removeAsDefault().then(next).catch(next);
});

teamSchema.virtual('organisationId').get(function (this: TeamDocument) {
  const org = this._organisation;
  return org instanceof Organisation ? org.id.toString() : org?.toString();
});

teamSchema.virtual('organisation').get(function (this: TeamDocument) {
  const org = this._organisation;
  if (!(org instanceof Organisation)) {
    throw new Error('Call populate() on team to load "organisation" property.');
  }
  return org;
});

export const Team = commonOrgModel.discriminator<TeamDocument, TeamModel>(
  'team',
  teamSchema,
);
