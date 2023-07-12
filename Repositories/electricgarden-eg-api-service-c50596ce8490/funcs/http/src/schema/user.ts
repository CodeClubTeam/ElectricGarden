import mongoose from 'mongoose';

import config from '../config';
import commonModel from './common';

const baseConfig = config.database.baseConfig;
const userRoles = config.user.roles;

export interface UserDocument extends mongoose.Document {
  _organisation: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  status: string; // TODO: restrict further
  _authIdentityId?: string;
  // TODO: add remaining props as use them from typescript
  hasRole: (name: string) => Promise<boolean>;
}

export interface UserModel extends mongoose.Model<UserDocument> {
  findByEmail: (email: string) => Promise<UserDocument>;
  findByAuth: (authIdentifier: string) => Promise<UserDocument>;
  findByApiKey: (apiKey: string) => Promise<UserDocument>;
  findByAuthIdentityId: (authIdentityId: string) => Promise<UserDocument>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
  baseConfig,
);

userSchema.statics.findByEmail = async function(email: string) {
  return this.findOne({ email });
};

userSchema.statics.findByAuth = async function(authIdentifier: string) {
  return this.findOne({ auth: authIdentifier });
};

userSchema.statics.findByApiKey = async function(apiKey: string) {
  return this.findOne({ _apikey: apiKey });
};

userSchema.statics.findByAuthIdentityId = async function(
  authIdentityId: string,
) {
  return this.findOne({ _authIdentityId: authIdentityId });
};

userSchema.methods.hasRole = async function(role: string) {
  if (userRoles.indexOf(role) === -1) {
    return false;
  }
  if (!this.populated('role')) {
    await this.populate('role').execPopulate();
  }
  return this.role === role;
};

userSchema.methods.toJSON = async function() {
  let obj = this.toObject();
  obj.id = obj._id;

  let removeKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
  for (let key of removeKeys) {
    delete obj[key];
  }

  return obj;
};

// export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export const User = commonModel.discriminator('user', userSchema) as UserModel;
