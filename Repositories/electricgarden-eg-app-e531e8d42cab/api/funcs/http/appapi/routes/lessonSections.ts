import { Lesson } from '@eg/doc-db';
import * as yup from 'yup';
import { AppRequestHandler } from '../typings';

const sectionParamsValidator = yup
  .object()
  .shape({
    lessonId: yup.string().required(),
    sectionName: yup.string().required(),
  })
  .required();

export const getSection: AppRequestHandler = async (req, res) => {
  const {
    lessonId: lessonName,
    sectionName,
  } = sectionParamsValidator.validateSync(req.params);
  const { learner } = req.user;
  const lesson = await Lesson.findOneByName(lessonName);
  if (!lesson) {
    return res.status(404).send(`Lesson not found ${lessonName}.`);
  }

  const inProgressLesson = learner.getLessonInProgress(lesson);
  if (!inProgressLesson) {
    return res.send({ completed: false });
  }
  res.send({
    completed: !!inProgressLesson.sectionsCompleted.get(sectionName),
  });
};

export const completeSection: AppRequestHandler = async (req, res) => {
  const {
    lessonId: lessonName,
    sectionName,
  } = sectionParamsValidator.validateSync(req.params);

  const { learner } = req.user;
  const lesson = await Lesson.findOneByName(lessonName);
  if (!lesson) {
    return res.status(404).send(`Lesson not found ${lessonName}.`);
  }

  if (lesson.level && learner.level < lesson.level) {
    return res
      .status(403)
      .send('Learner level is not high enough for this lesson.');
  }

  const section = lesson.getSection(sectionName);
  if (!section) {
    return res.status(404).send(`Section not found with name: ${sectionName}`);
  }

  if (!learner.isLessonInProgress(lesson)) {
    return res.status(409).send('Lesson is not in progress.');
  }

  learner.setSectionCompleted(lesson, section);
  if (learner.allSectionsCompleted(lesson)) {
    learner.setLessonCompleted(lesson);
  }

  await req.user.save();

  res.sendStatus(204);
};
