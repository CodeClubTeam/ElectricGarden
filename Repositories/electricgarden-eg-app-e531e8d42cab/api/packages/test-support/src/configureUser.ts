import { Learner, User, UserRole } from '@eg/doc-db';

import { defaultUser, TestUserName, testUsers } from './sampleData';

export const createConfigureUser = (userName: TestUserName = defaultUser) => {
  const { email } = testUsers[userName];

  const getUser = async () => {
    const user = await User.findOneByEmail(email);
    if (!user) {
      throw new Error(`Test user not found with email: ${email}.`);
    }
    return user;
  };

  return {
    setRole: async (role: UserRole) => {
      const user = await getUser();
      user.role = role;
      await user.save();
      return user;
    },
    learner: {
      clear: async () => {
        const user = await getUser();
        user.learner = new Learner({
          level: user.learner ? user.learner.level || 2 : 2,
        });
        await user.save();
        return user.learner;
      },
      setLevel: async (level: number) => {
        const user = await getUser();
        if (!user.learner) {
          user.learner = new Learner({ level });
        } else {
          user.learner.level = level;
        }
        await user.save();
        return user.learner;
      },
    },
  };
};

export type ConfigureUser = ReturnType<typeof createConfigureUser>;
