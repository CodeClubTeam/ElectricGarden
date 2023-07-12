import { AppEnv, AppEnvs } from '../appEnvs';
import { commonMetaModel } from '../collectionModels';
import mongoose from '../db';
import { LessonSectionProperties, lessonSectionSchema } from './lessonSection';

export interface LessonDocument extends mongoose.Document {
  name: string;
  title: string;
  contentPath: string;
  categories: string[];
  seasons: string[];
  publish?: AppEnv;
  level: number;
  sections: LessonSectionProperties[];
  locked?: AppEnv;
  kiosk?: boolean;
  ordinal: number;
  _created: Date;

  getSection: (name: string) => LessonSectionProperties | undefined;
}

export interface LessonModel extends mongoose.Model<LessonDocument> {
  findOneByName: (name: string) => Promise<LessonDocument | undefined>;
  findPublished: (
    appEnv: AppEnv,
    criteria?: Record<string, unknown>,
  ) => mongoose.DocumentQuery<LessonDocument[], LessonDocument>;
  // findByCategory: (category: string) => Promise<LessonDocument[]>;
}

const lessonSchema = new mongoose.Schema<LessonDocument>({
  name: {
    type: String,
    required: true,
    // index: true,
  },
  title: {
    type: String,
    required: true,
  },
  contentPath: {
    type: String,
    required: true,
  },
  categories: [mongoose.SchemaTypes.String],
  seasons: [mongoose.SchemaTypes.String],
  publish: {
    type: mongoose.SchemaTypes.String,
    enum: AppEnvs,
  },
  level: {
    type: Number,
    default: 1,
  },
  sections: [lessonSectionSchema],
  locked: { type: mongoose.SchemaTypes.String, enum: AppEnvs },
  kiosk: Boolean,
  ordinal: {
    type: Number,
    required: true,
  },
  _created: {
    type: Date,
    default: Date.now,
  },
});

lessonSchema.statics.findOneByName = async function (
  this: LessonModel,
  name: string,
) {
  return this.findOne({ name }).exec();
};

lessonSchema.statics.findPublished = async function (
  this: LessonModel,
  appEnv: AppEnv,
  criteria: Record<string, unknown> = {},
) {
  const appEnvIndex = AppEnvs.indexOf(appEnv);
  const includedAppEnvs = AppEnvs.slice(0, appEnvIndex + 1);
  return this.find({
    ...criteria,
    publish: { $in: includedAppEnvs },
  }).exec();
};

lessonSchema.methods.getSection = function (
  this: LessonDocument,
  sectionName: string,
) {
  return this.sections.find(({ name }) => name == sectionName);
};

// lessonSchema.statics.findByCategory = async function(category: string) {
//   return this.find({ serial }).exec();
// };

export const Lesson = commonMetaModel.discriminator<
  LessonDocument,
  LessonModel
>('lesson', lessonSchema);
