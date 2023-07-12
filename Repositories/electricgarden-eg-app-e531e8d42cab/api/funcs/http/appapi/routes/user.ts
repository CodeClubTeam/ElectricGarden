import { addUser, LEARNER_LEVEL_DEFAULT } from '@eg/core';
import {
  Learner,
  Organisation,
  User,
  userConfig,
  UserDocument,
  UserRole,
  UserStatus,
} from '@eg/doc-db';
import * as yup from 'yup';

import { AppRequestHandler } from '../typings';
import { canHaveRole } from '../utils';

type ValidatorOptions = {
  actioningUser: UserDocument;
  inserting?: boolean;
};

type CreateUserResource = Omit<
  UserResource,
  'createdOn' | 'id' | 'lessonCounts'
> & {
  firstAdmin?: boolean;
};

const userValidatorCreate = ({ actioningUser, inserting }: ValidatorOptions) =>
  yup
    .object()
    .shape<CreateUserResource>({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .test({
          name: 'unique-email',
          message: 'A user with the email address "${value}" already exists.',
          test: async (email) => {
            if (!inserting) {
              return true;
            }
            const existingUser = await User.findOneByEmail(email);
            return !existingUser;
          },
        })
        .test({
          name: 'cannot-update-other-org-user',
          message:
            'A user with the email address "${value}" exists on another organisation.',
          test: async (email) => {
            const existingUser = await User.findOneByEmail(email);
            if (!existingUser) {
              return true;
            }
            return existingUser.organisationId === actioningUser.organisationId;
          },
        })
        .required(),
      role: yup
        .mixed<UserRole>()
        .oneOf([...userConfig.roles])
        .test(
          'not > than creating user',
          'Cannot create or update user with higher role than you.',
          (role) => canHaveRole(actioningUser.role, role),
        )
        .required(),
      status: yup
        .mixed<UserStatus>()
        .oneOf([...userConfig.statuses])
        .required(),
      learnerLevel: yup.number().required().positive(),
      firstAdmin: yup.boolean().notRequired(),
    })
    .required();

interface UserResource {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  learnerLevel: number;
  status: UserStatus;
  createdOn: Date;
  lessonCounts: {
    inProgress: number;
    completed: number;
  };
}

const mapToResource = ({
  id,
  name,
  email,
  role,
  learner,
  status,
  _created: createdOn,
}: UserDocument): UserResource => ({
  id,
  name,
  email,
  role,
  learnerLevel: learner.level,
  status,
  createdOn,
  lessonCounts: learner.getCounts(),
});

const userIdFromParamsValidator = yup
  .object()
  .shape({
    userId: yup.string().required(),
  })
  .required();

export const getSingleById: AppRequestHandler = async (req, res) => {
  const { userId } = userIdFromParamsValidator.validateSync(req.params);

  const user = await User.findOneById(userId);
  if (!user || user.organisationId !== req.user.organisationId) {
    return res.sendStatus(404);
  }
  res.send(mapToResource(user));
};
getSingleById.requiredRole = 'leader' as const;

export const getList: AppRequestHandler = async (req, res) => {
  const users = await User.findByOrganisation(req.user._organisation);

  // TEMP on-the-fly migration
  for (const user of users) {
    if (!user.learner) {
      user.learner = new Learner({ level: LEARNER_LEVEL_DEFAULT });
      await user.save();
    }
  }

  res.send(users.map(mapToResource));
};
getList.requiredRole = 'leader' as const;

// export const getApiKey: RequestHandler = (req, res) => {
//   if (
//     'user' in req &&
//     '_apikey' in req.user &&
//     typeof req.user._apikey === 'string' &&
//     req.user._apikey.length > 4
//   ) {
//     res.json({ apikey: req.user._apikey });
//   } else {
//     res.json({ message: 'No API key' });
//   }
// };

// export const newApiKey: RequestHandler = (req, res) => {
//   let existingUser = null;
//   let apikey = null;
//   do {
//     let bytes = crypto.randomBytes(16);
//     apikey =
//       bytes.readUInt32LE().toString(36) +
//       (+new Date()).toString(36) +
//       bytes.readUInt32LE(4).toString(36);
//     existingUser = await userModel.findByApiKey(apikey);
//   } while (existingUser != null);
//   // update user
//   req.userDoc._apikey = apikey;
//   req.userDoc
//     .save()
//     .then(function(usr) {
//       req.logger.log(
//         'Created new API key',
//         usr._apikey,
//         'for',
//         usr._id.toString(),
//       );
//       res.json({ apikey });
//     })
//     .catch(function(err) {
//       req.logger.warn('Error updating API key', err);
//       res.status(500).json({ error: err.message });
//     });
// }

// async function removeApiKey(req, res) {
//   req.userDoc._apikey = null;
//   req.userDoc
//     .save()
//     .then(function(usr) {
//       req.logger.log('Removed API key for', usr._id.toString());
//       res.json({ success: true });
//     })
//     .catch(function(err) {
//       req.logger.warn('Error removing API key', err);
//       res.status(500).json({ error: err.message });
//     });
// }

export const create: AppRequestHandler = async (req, res) => {
  const resource = await userValidatorCreate({
    actioningUser: req.user,
    inserting: true,
  }).validate(req.body);

  const organisation = await Organisation.findOneById(req.user._organisation);
  if (!organisation) {
    return res.status(500).send(`No org with id ${req.user._organisation}`);
  }

  const user = mapToResource(
    await addUser(organisation, {
      ...resource,
    }),
  );
  res
    .status(201)
    .location(`/v1/users/${user.id}`) // should centralise routing logic
    .send(user);
};
create.requiredRole = 'admin' as const;

const updateParamsValidator = yup
  .object()
  .shape({
    userId: yup.string().required(),
  })
  .required();

export const update: AppRequestHandler = async (req, res) => {
  const { userId } = updateParamsValidator.validateSync(req.params);

  // Need to check user is in correct org
  const user = await User.findById(userId).exec();
  if (user == null || !user._organisation.equals(req.user._organisation)) {
    res.status(400).send({ validationErrors: ['Could not find user'] });
    return;
  }

  const resource = await userValidatorCreate({
    actioningUser: req.user,
  }).validate(req.body);
  const { name, email, learnerLevel, role, status } = resource;
  const update = {
    name,
    email,
    role,
    status,
    learner: { level: learnerLevel },
  };

  // TODO: as any because new mongoose typing is silly re updating a sub document
  const updatedUser = await User.findByIdAndUpdate(userId, update as any, {
    strict: true,
    new: true,
  });
  if (!updatedUser) {
    return res.status(500).send('Could not find updated user.');
  }
  res.send(mapToResource(updatedUser));
};
update.requiredRole = 'admin' as const;

export const bulkImport: AppRequestHandler = async (req, res) => {
  const values = req.body as any[];

  const userValidator = userValidatorCreate({
    actioningUser: req.user,
  });

  const validationErrors: string[] = [];

  const resources = (
    await Promise.all(
      values.map(async (value, index) => {
        try {
          return await userValidator.validate(value);
        } catch (error) {
          const lineNumber = index + 2; // account for zero offset and header row
          validationErrors.push(`${error.message} (line ${lineNumber})`); // line because assuming from csv
          return undefined;
        }
      }),
    )
  ).filter((v): v is CreateUserResource => !!v);

  const emailSet = new Set<string>();
  resources
    .map(({ email }) => email)
    .forEach((email, index) => {
      if (emailSet.has(email)) {
        const lineNumber = index + 2; // account for zero offset and header row
        validationErrors.push(
          `Duplicate email: ${email} (line ${lineNumber}).`,
        );
      }
      emailSet.add(email);
    });

  if (validationErrors.length) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const organisation = await Organisation.findOneById(req.user._organisation);
  if (!organisation) {
    return res.status(500).send(`No org with id ${req.user._organisation}`);
  }

  const fails: Array<{ user: CreateUserResource; error: string }> = [];

  const users = (
    await Promise.all(
      resources.map(async (resource) => {
        try {
          const existingUser = await User.findOneByOrganisationAndEmail(
            organisation.id,
            resource.email,
          );
          if (existingUser) {
            existingUser.name = resource.name;
            existingUser.role = resource.role;
            existingUser.status = resource.status;
            existingUser.learner.level = resource.learnerLevel;
            await existingUser.save();
            return existingUser;
          } else {
            return await addUser(organisation, {
              ...resource,
            });
          }
        } catch (error) {
          fails.push({ user: resource, error: error.message });
          return undefined;
        }
      }),
    )
  ).filter((v): v is UserDocument => !!v);

  // TODO: fails list; what to do? mongodb doesn't support atomic transactions

  if (fails.length > 0 && users.length === 0) {
    res.status(500);
  }

  //REMOVE
  //fails.push({ user: resources[0], error: 'username invalid' });

  res.send({ users: users.map(mapToResource), fails });
};
bulkImport.requiredRole = 'admin' as const;

const clearLessonProgressSchema = yup
  .object({
    userIds: yup.array().of(yup.string().required()).required(),
  })
  .required();

export const clearLessonProgress: AppRequestHandler = async (req, res) => {
  const { userIds } = clearLessonProgressSchema.validateSync(req.body);

  const query = {
    _organisation: req.user.organisationId,
    _id: { $in: userIds },
  };
  await User.updateMany(query, {
    'learner.lessonsInProgress': [],
    'learner.lessonsCompleted': [],
  }).exec();

  const updatedUsers = await User.find(query).exec();

  res.send(updatedUsers.map(mapToResource));
};
clearLessonProgress.requiredRole = 'admin' as const;
