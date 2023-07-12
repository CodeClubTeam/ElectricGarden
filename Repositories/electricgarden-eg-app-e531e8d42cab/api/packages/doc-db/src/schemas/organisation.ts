import { ObjectId } from 'mongodb';
import { commonOrgModel } from '../collectionModels';
import { orgBaseConfig, orgModes } from '../config';
import mongoose from '../db';
import { AddressProperties, addressSchema, AddressDocument } from './address';

export type OrgMode = typeof orgModes[number];

export interface OrgProperties {
  name: string;
  logoUrl?: string;
  address: AddressProperties;
  defaults: {
    teamId?: mongoose.Types.ObjectId;
  };
  mode?: OrgMode;
  _created: Date;
}

export interface OrgDocument extends mongoose.Document, OrgProperties {
  address: AddressDocument;
}

export interface OrgModel extends mongoose.Model<OrgDocument> {
  findOneByName: (name: string) => Promise<OrgDocument | null>;
  findOneById: (id: string | ObjectId) => Promise<OrgDocument | null>;
}

const orgSchema = new mongoose.Schema<OrgDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    logoUrl: String,
    /*management: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},*/
    address: {
      type: addressSchema,
      required: true,
    },
    mode: {
      type: String,
      default: 'standard',
    },
    defaults: {
      teamId: mongoose.Schema.Types.ObjectId,
    },
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  orgBaseConfig,
);

orgSchema.statics.findOneByName = async function (
  this: OrgModel,
  name: string,
) {
  return this.findOne({ name }).exec();
};

orgSchema.statics.findOneById = async function (
  this: OrgModel,
  orgId: string | ObjectId,
) {
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return null;
  }
  return this.findById(orgId).exec();
};

export const Organisation = commonOrgModel.discriminator<OrgDocument, OrgModel>(
  'organisation',
  orgSchema,
);
