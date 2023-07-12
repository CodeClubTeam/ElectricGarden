import { ACTING_STAGING_APP_ENV } from '@eg/core';
import { AppEnv, AppEnvs, Lesson, LessonDocument } from '@eg/doc-db';
import type { RequestHandler } from 'express';
import * as yup from 'yup';

const validationSchema = yup
  .object()
  .shape({
    name: yup.string().required(),
    title: yup.string().required(),
    contentPath: yup.string().required(),
    level: yup.number(),
    seasons: yup.array(yup.string().required()),
    categories: yup.array(yup.string().required()),
    publish: yup
      .mixed()
      .oneOf([...AppEnvs, true, false])
      .notRequired(),
    sections: yup.array(
      yup
        .object()
        .shape({
          name: yup.string().required(),
          title: yup.string().required(),
        })
        .required(),
    ),
    locked: yup
      .mixed()
      .oneOf([...AppEnvs, true, false])
      .notRequired(),
    kiosk: yup.boolean().notRequired(),
    ordinal: yup.number().notRequired(),
  })
  .required();

type InferredLessonResource = yup.InferType<typeof validationSchema>;

export type LessonResource = Omit<
  InferredLessonResource,
  'locked' | 'publish'
> & {
  locked?: boolean | InferredLessonResource['locked'] | null;
  publish?: boolean | InferredLessonResource['publish'];
};

const mapToResource = ({
  name,
  title,
  level,
  categories,
  contentPath,
  seasons,
  publish,
  sections,
  locked,
  ordinal,
}: LessonDocument): LessonResource => ({
  name,
  title,
  level,
  categories,
  contentPath,
  seasons,
  publish,
  sections: sections.map(({ name, title }) => ({ name, title })),
  locked,
  ordinal,
});

export const getList: RequestHandler = async (req, res) => {
  const lessons = await Lesson.find().exec();
  return res.send(lessons.map(mapToResource));
};

const putParamsValidator = yup
  .object()
  .shape({
    name: yup.string().required(),
  })
  .required();

const putBodyValidator = validationSchema;

export const put: RequestHandler = async (req, res) => {
  const { name } = putParamsValidator.validateSync(req.params);
  const resource = putBodyValidator.validateSync(req.body);

  if (resource.name !== name) {
    throw new yup.ValidationError('Name should match route.', name, 'name');
  }

  // choose next value for default ordinal. doesn't matter if duplicates
  if (!resource.ordinal && !(await Lesson.findOne({ name: resource.name }))) {
    const entries = (await Lesson.find().select('ordinal').exec()) ?? [
      { ordinal: 0 },
    ];

    resource.ordinal = Math.max(...[0, ...entries.map((o) => o.ordinal)]) + 1;
  }

  let locked: AppEnv | undefined;
  let publish: AppEnv | undefined;

  if ('locked' in resource) {
    if (typeof resource.locked === 'boolean') {
      if (resource.locked) {
        locked = ACTING_STAGING_APP_ENV;
      } else {
        locked = undefined;
      }
    } else {
      locked = resource.locked;
    }
  }

  if ('publish' in resource) {
    if (typeof resource.publish === 'boolean') {
      if (resource.publish) {
        publish = AppEnvs[0]; // production
      } else {
        publish = AppEnvs[AppEnvs.length - 1]; // localdev
      }
    } else {
      publish = resource.publish;
    }
  }

  const update = {
    ...resource,
    locked,
    publish,
  };

  await Lesson.findOneAndUpdate({ name }, update, { upsert: true });

  return res.sendStatus(204);
};

export const remove: RequestHandler = async (req, res) => {
  const { name } = putParamsValidator.validateSync(req.params);

  const lesson = await Lesson.findOneByName(name);
  if (lesson) {
    await Lesson.deleteOne(lesson);
    await lesson.remove(); // only required on cosmosdb (!) but no-op on real mongodb
  }

  return res.sendStatus(204);
};
