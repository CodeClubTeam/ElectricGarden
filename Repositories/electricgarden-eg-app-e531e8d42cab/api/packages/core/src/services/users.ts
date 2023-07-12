import {
  Learner,
  LearnerDocument,
  OrgDocument,
  Team,
  User,
  UserDocument,
} from '@eg/doc-db';

import { sendTemplateEmailToUser } from '../mailer';
import { addMember } from './teams';

type AddUserParams = Pick<UserDocument, 'name' | 'email' | 'role'> & {
  learnerLevel?: LearnerDocument['level'];
  status?: UserDocument['status'];
  firstAdmin?: boolean;
};

export const LEARNER_LEVEL_DEFAULT = 13;

const sendWelcomeEmail = async (
  userId: string,
  { firstAdmin }: { firstAdmin?: boolean },
) =>
  sendTemplateEmailToUser({
    templateName: firstAdmin
      ? 'EG New User Welcome - First Admin'
      : 'EG NEW USER WELCOME',
    userId,
    mergeVars: {
      APP_URL: 'https://app.electricgarden.nz',
    },
  });

export const addUser = async (
  organisation: OrgDocument,
  { name, email, role, learnerLevel, status, firstAdmin }: AddUserParams,
) => {
  const newUser = new User({
    name,
    email,
    role,
    status: status ?? 'active',
    _organisation: organisation,
  });
  newUser.learner = new Learner({
    level: learnerLevel ?? LEARNER_LEVEL_DEFAULT,
  });
  try {
    await newUser.save();

    await sendWelcomeEmail(newUser.id, {
      firstAdmin: !!firstAdmin && role === 'admin',
    });

    if (organisation.defaults.teamId) {
      const defaultTeam = await Team.findOneById(organisation.defaults.teamId);
      if (defaultTeam) {
        await addMember(defaultTeam, newUser);
      }
    }

    return newUser;
  } catch (err) {
    if (newUser.id) {
      // no transactions here. compensate manually if failed (e.g. welcome email send failed)
      await newUser.remove();
    }
    throw err;
  }
};
