import { commonOrgModel } from '../collectionModels';
import mongoose from '../db';
import { GoldilocksRuleDocument, goldlocksRuleSchema } from './goldilocksRule';
import { GrowableType, GrowableTypeDocument } from './growableType';
import { Sensor, SensorDocument } from './sensorNode';
import { Team, TeamDocument } from './team';

export interface GrowableDocument extends mongoose.Document {
  _organisation: mongoose.Types.ObjectId;
  title: string;
  team: mongoose.Types.ObjectId | TeamDocument;
  sensor: mongoose.Types.ObjectId | SensorDocument;
  growableType: mongoose.Types.ObjectId | GrowableTypeDocument;
  soilType?: string;
  notes?: string;
  createdOn: Date;
  goldilocksRules: Array<mongoose.Types.ObjectId | GoldilocksRuleDocument>;

  readonly sensorId: string;
  readonly teamId: string;
  readonly typeId: string;
  readonly typeDoc: GrowableTypeDocument;
  readonly teamDoc: TeamDocument;
}

export interface GrowableModel extends mongoose.Model<GrowableDocument> {
  findOneById: (id: string) => Promise<GrowableDocument | null>;
  findByOrganisationTeam: (
    organisationId: string,
    teamId: string,
  ) => Promise<GrowableDocument[]>;
  findByOrganisation: (organisationId: string) => Promise<GrowableDocument[]>;
  findBySensor: (
    sensorOrId: string | SensorDocument,
  ) => ReturnType<GrowableModel['find']>;
}

const growableSchema = new mongoose.Schema<GrowableDocument>({
  _organisation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Team.modelName,
    required: true,
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Sensor.modelName,
    required: true,
  },
  growableType: {
    // note: "type" is reserved word
    type: mongoose.Schema.Types.ObjectId,
    ref: GrowableType.modelName,
    required: true,
  },
  soilType: {
    type: String,
  },
  notes: {
    type: String,
  },
  goldilocksRules: [goldlocksRuleSchema],
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

growableSchema.statics.findByOrganisationTeam = async function (
  organisationId: string,
  teamId: string,
) {
  if (
    !mongoose.Types.ObjectId.isValid(organisationId) ||
    !mongoose.Types.ObjectId.isValid(teamId)
  ) {
    return [];
  }
  return this.find({ team: teamId, _organisation: organisationId })
    .populate('growableType')
    .exec();
};

growableSchema.statics.findByOrganisation = async function (
  organisationId: string,
) {
  if (!mongoose.Types.ObjectId.isValid(organisationId)) {
    return [];
  }
  return this.find({ _organisation: organisationId })
    .populate('growableType')
    .exec();
};

growableSchema.statics.findOneById = async function (id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  return this.findById(id).populate('growableType').exec();
};

growableSchema.statics.findBySensor = function (
  this: GrowableModel,
  sensor: string | SensorDocument,
) {
  return this.find({
    sensor: typeof sensor === 'string' ? sensor : sensor._id,
  });
};

growableSchema.virtual('teamId').get(function (this: GrowableDocument) {
  const team = this.team;
  return team instanceof Team ? team.id.toString() : team.toString();
});

growableSchema.virtual('sensorId').get(function (this: GrowableDocument) {
  const sensor = this.sensor;
  return sensor instanceof Sensor ? sensor.id.toString() : sensor.toString();
});

growableSchema.virtual('typeId').get(function (this: GrowableDocument) {
  const type = this.growableType;
  return type instanceof GrowableType ? type.id.toString() : type.toString();
});

growableSchema.virtual('typeDoc').get(function (this: GrowableDocument) {
  const type = this.growableType;
  if (!(type instanceof GrowableType)) {
    throw new Error(
      'growableType should be populated before calling typeDoc virtual.',
    );
  }
  return type;
});

growableSchema.virtual('teamDoc').get(function (this: GrowableDocument) {
  const team = this.team;
  if (!(team instanceof Team)) {
    throw new Error('team should be populated before calling teamDoc virtual.');
  }
  return team;
});

export const Growable = commonOrgModel.discriminator<
  GrowableDocument,
  GrowableModel
>('growable', growableSchema);
