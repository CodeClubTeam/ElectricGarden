import { commonOrgModel } from '../collectionModels';
import { orgBaseConfig, userConfig } from '../config';
import mongoose from '../db';
import { LearnerDocument, learnerSchema } from './learner';
import { Organisation, OrgDocument } from './organisation';

const userRoles = userConfig.roles;

export type UserRole = typeof userConfig.roles[number];

export type UserStatus = typeof userConfig.statuses[number];

export interface UserDocument extends mongoose.Document {
  _organisation: mongoose.Types.ObjectId | OrgDocument;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  _authIdentityId?: string;
  readonly _created: Date;
  learner: LearnerDocument;
  // TODO: add remaining props as use them from typescript
  hasRole: (name: UserRole) => Promise<boolean>;

  readonly organisationId: string;
  readonly organisation: OrgDocument;
}

export interface UserModel extends mongoose.Model<UserDocument> {
  findByOrganisation: (organisationId: string) => Promise<UserDocument[]>;
  findOneById: (id: string) => Promise<UserDocument | null>;
  findOneByEmail: (email: string) => Promise<UserDocument | null>;
  findOneByOrganisationAndEmail: (
    organisationId: string,
    email: string,
  ) => Promise<UserDocument | null>;
  findOneByAuth: (authIdentifier: string) => Promise<UserDocument | null>;
  findOneByApiKey: (apiKey: string) => Promise<UserDocument | null>;
  findOneByAuthIdentityId: (
    authIdentityId: string,
  ) => Promise<UserDocument | null>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Organisation.modelName,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      default: 'inactive',
    },
    role: {
      type: String,
      default: 'member',
    },
    logoUrl: String,
    learner: {
      type: learnerSchema,
      required: true,
    },
    _auth: [String], // or Array if can't just store the userIdentifier string
    _apikey: String,
    _created: {
      type: Date, // Date or Number ? Unsure which makes more sense...
      default: Date.now,
    },
    _authIdentityId: {
      type: String,
    },
    // TODO: Add in "last login" time
  },
  orgBaseConfig,
);

userSchema.statics.findOneById = async function (userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }
  return this.findById(userId).exec();
};

userSchema.statics.findOneByEmail = async function (email: string) {
  return this.findOne({ email }).exec();
};

userSchema.statics.findOneByOrganisationAndEmail = async function (
  this: UserModel,
  organisationId: string,
  email: string,
) {
  if (!mongoose.Types.ObjectId.isValid(organisationId)) {
    return null;
  }
  return this.findOne({ _organisation: organisationId, email }).exec();
};

userSchema.statics.findOneByAuth = async function (authIdentifier: string) {
  return this.findOne({ auth: authIdentifier }).exec();
};

userSchema.statics.findOneByApiKey = async function (apiKey: string) {
  return this.findOne({ _apikey: apiKey }).exec();
};

userSchema.statics.findOneByAuthIdentityId = async function (
  authIdentityId: string,
) {
  return this.findOne({ _authIdentityId: authIdentityId }).exec();
};

userSchema.statics.findByOrganisation = function (organisationId: string) {
  if (!mongoose.Types.ObjectId.isValid(organisationId)) {
    return [];
  }
  return this.find({ _organisation: organisationId }).exec();
};

userSchema.methods.hasRole = async function (role: UserRole) {
  if (userRoles.indexOf(role) === -1) {
    return false;
  }
  return this.role === role;
};

userSchema.virtual('organisationId').get(function (this: UserDocument) {
  const org = this._organisation;
  return org instanceof Organisation ? org.id.toString() : org?.toString();
});

userSchema.virtual('organisation').get(function (this: UserDocument) {
  const org = this._organisation;
  if (!(org instanceof Organisation)) {
    throw new Error('Call populate() on user to load "organisation" property.');
  }
  return org;
});

userSchema.methods.toJSON = async function () {
  const obj = this.toObject();
  obj.id = obj._id;

  const removeKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
  for (const key of removeKeys) {
    delete obj[key];
  }

  return obj;
};

export const User = commonOrgModel.discriminator<UserDocument, UserModel>(
  'user',
  userSchema,
);
