import mongoose from '../db';

export interface LessonSectionProperties {
  name: string;
  title: string;
}

export interface LessonSectionDocument
  extends mongoose.Document,
    LessonSectionProperties {}

export const lessonSectionSchema = new mongoose.Schema<LessonSectionDocument>({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
