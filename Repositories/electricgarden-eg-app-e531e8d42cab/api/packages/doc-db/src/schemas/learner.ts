import mongoose from '../db';
import { Lesson, LessonDocument } from './lesson';
import { LessonSectionProperties } from './lessonSection';

export interface LessonInProgressDocument extends mongoose.Document {
  lessonId: mongoose.Types.ObjectId;
  sectionsCompleted: Map<string, boolean>;
}

const lessonInProgressSchema = new mongoose.Schema<LessonInProgressDocument>({
  lessonId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: Lesson.modelName,
    required: true,
  },
  sectionsCompleted: {
    type: mongoose.SchemaTypes.Map,
    of: Boolean,
    default: {},
  },
});

export interface LearnerDocument extends mongoose.Document {
  level: number;
  lessonsInProgress: mongoose.Types.Array<LessonInProgressDocument>;
  lessonsCompleted: mongoose.Types.ObjectId[];
  getCounts: () => {
    inProgress: number;
    completed: number;
  };

  isLessonCompleted: (lesson: LessonDocument) => boolean;
  setLessonCompleted: (lesson: LessonDocument) => void;

  isLessonInProgress: (lesson: LessonDocument) => boolean;
  setLessonInProgress: (lesson: LessonDocument) => void;
  unsetLessonInProgress: (lesson: LessonDocument) => void;
  getLessonInProgress: (
    lesson: LessonDocument,
  ) => LessonInProgressDocument | undefined;
  getSectionCompleted: (
    lesson: LessonDocument,
    section: LessonSectionProperties,
  ) => boolean;
  setSectionCompleted: (
    lesson: LessonDocument,
    section: LessonSectionProperties,
  ) => void;
  allSectionsCompleted: (lesson: LessonDocument) => boolean;
  clearAllProgess: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LearnerModel extends mongoose.Model<LearnerDocument> {}

export const learnerSchema = new mongoose.Schema<LearnerDocument>({
  level: {
    type: Number,
    required: true,
  },
  lessonsInProgress: [lessonInProgressSchema],
  lessonsCompleted: [mongoose.SchemaTypes.ObjectId],
});

learnerSchema.methods.isLessonCompleted = function (lesson: LessonDocument) {
  return !!this.lessonsCompleted.find((lessonId) => lessonId.equals(lesson.id));
};

learnerSchema.methods.setLessonCompleted = function (lesson) {
  if (!this.isLessonCompleted(lesson)) {
    this.lessonsCompleted.push(lesson.id);
  }
  this.unsetLessonInProgress(lesson);
};

learnerSchema.methods.getLessonInProgress = function (lesson) {
  return this.lessonsInProgress.find(({ lessonId }) =>
    lessonId.equals(lesson.id),
  );
};

learnerSchema.methods.isLessonInProgress = function (lesson: LessonDocument) {
  return !!this.getLessonInProgress(lesson);
};

learnerSchema.methods.setLessonInProgress = function (lesson) {
  if (!this.isLessonInProgress(lesson)) {
    this.lessonsInProgress.push({ lessonId: lesson.id });
  }
};

learnerSchema.methods.getSectionCompleted = function (lesson, section) {
  const lessonInProgress = this.getLessonInProgress(lesson);
  if (!lessonInProgress) {
    return false;
  }
  return !!lessonInProgress.sectionsCompleted.get(section.name);
};

learnerSchema.methods.setSectionCompleted = function (lesson, section) {
  let lessonInProgress = this.getLessonInProgress(lesson);
  if (!lessonInProgress) {
    this.setLessonInProgress(lesson);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    lessonInProgress = this.getLessonInProgress(lesson)!;
  }
  lessonInProgress.sectionsCompleted.set(section.name, true);
};

learnerSchema.methods.allSectionsCompleted = function (lesson: LessonDocument) {
  const lessonInProgress = this.getLessonInProgress(lesson);
  if (!lessonInProgress) {
    return false;
  }
  const sectionNames = lesson.sections.map(({ name }) => name);
  return !sectionNames.find(
    (name) => !lessonInProgress.sectionsCompleted.get(name),
  );
};

learnerSchema.methods.unsetLessonInProgress = function (lesson) {
  const lessonInProgress = this.getLessonInProgress(lesson);
  if (lessonInProgress) {
    this.lessonsInProgress.remove(lessonInProgress);
    // types are wrong it would seem as this is not a promise at runtime
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    lessonInProgress.remove(); // only required on cosmosdb (!) but no-op on real mongodb
  }
};

learnerSchema.methods.clearAllProgess = function () {
  this.lessonsInProgress.splice(0, this.lessonsInProgress.length);
  this.lessonsCompleted.splice(0, this.lessonsCompleted.length);
};

learnerSchema.methods.getCounts = function () {
  return {
    inProgress: this.lessonsInProgress.length,
    completed: this.lessonsCompleted.length,
  };
};

export const Learner = mongoose.model<LearnerDocument, LearnerModel>(
  'learner',
  learnerSchema,
);
