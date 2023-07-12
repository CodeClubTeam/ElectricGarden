import { booleanFromEnvCreate, getRequiredConfig } from '@eg/core';
import {
  AppEnv,
  LearnerDocument,
  Lesson,
  LessonDocument,
  LessonSectionProperties,
  Organisation,
  UserDocument,
} from '@eg/doc-db';
import { orderBy } from 'lodash';
import * as yup from 'yup';
import { AppRequestHandler } from '../typings';

// unlike the equivalent resource on provisioning api
// these lessons are specific to a learner
// so will have filtering and extra information for that learner;

const lessonStatus = (lesson: LessonDocument, learner?: LearnerDocument) => {
  if (!learner) {
    return undefined;
  }
  if (learner.isLessonInProgress(lesson)) {
    return 'in progress';
  } else if (learner.isLessonCompleted(lesson)) {
    return 'completed';
  } else {
    return undefined;
  }
};

const isSectionCompleted = (
  lesson: LessonDocument,
  section: LessonSectionProperties,
  learner?: LearnerDocument,
) => {
  if (!learner) {
    return false;
  }
  return learner.isLessonInProgress(lesson)
    ? learner.getSectionCompleted(lesson, section)
    : learner.isLessonCompleted(lesson);
};

const mapToResourceCreate = (learner?: LearnerDocument) => {
  const lockedFromAppEnv = booleanFromEnvCreate('down');
  return (lesson: LessonDocument) => {
    const {
      name,
      title,
      level,
      contentPath,
      categories,
      seasons,
      sections,
      locked,
    } = lesson;
    return {
      id: name,
      title,
      sections: sections.map((section) => ({
        name: section.name,
        title: section.title,
        completed: isSectionCompleted(lesson, section, learner),
      })),
      level,
      contentPath,
      categories,
      seasons,
      status: lessonStatus(lesson, learner),
      locked: locked ? lockedFromAppEnv(locked) : false,
    };
  };
};

export const getList: AppRequestHandler = async (req, res) => {
  const {
    user: { learner },
  } = req;
  const criteria = learner.level ? { level: { $lte: learner.level } } : {};
  const org = await Organisation.findById(req.user.organisationId);

  const appEnv = getRequiredConfig('APP_ENV') as AppEnv;

  const lessons = await Lesson.findPublished(appEnv, {
    ...criteria,
    kiosk: org && org.mode === 'kiosk' ? { $eq: true } : { $ne: true },
  });

  const sortedLessons = orderBy(lessons, ['ordinal', 'title']);
  const resources = sortedLessons.map(mapToResourceCreate(learner));
  return res.send(resources);
};

const patchParamsValidator = yup
  .object()
  .shape({
    id: yup.string().required(),
  })
  .required();

const patchValidator = yup
  .object()
  .shape({
    inProgress: yup.boolean().required(),
  })
  .required();

export const patch: AppRequestHandler = async (req, res) => {
  const { id: name } = patchParamsValidator.validateSync(req.params);
  const { inProgress } = patchValidator.validateSync(req.body);
  const { learner } = req.user;

  const lesson = await Lesson.findOneByName(name);
  if (!lesson) {
    return res.sendStatus(404);
  }

  if (lesson.level && learner.level < lesson.level) {
    return res
      .status(403)
      .send('Learner level is not high enough for this lesson.');
  }

  if (inProgress) {
    learner.setLessonInProgress(lesson);
  } else {
    learner.unsetLessonInProgress(lesson);
  }
  await req.user.save();

  res.sendStatus(204);
};

export const clearAllLessonProgress: AppRequestHandler = async (req, res) => {
  const { learner } = req.user as UserDocument;
  const org = await Organisation.findById(req.user.organisationId);
  const isKioskOrg = org && org.mode === 'kiosk';

  if (isKioskOrg || req.user.role == 'su') {
    learner.clearAllProgess();
  }

  await req.user.save();

  res.sendStatus(204);
};
