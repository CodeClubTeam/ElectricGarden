import { OrgDocument, User, UserDocument } from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  exampleUserProps,
  initDb,
  setupExampleUser,
  setupTestOrg,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('users api', () => {
  let api: UserApi;
  let suOrganisation: OrgDocument;
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let response: request.Response;

  beforeEach(async () => {
    await initDb();
    const suTenant = await setupTestTenant(); // org which su user is member of but will impersonate other
    suOrganisation = suTenant.organisation;
    organisation = await setupTestOrg({ separate: true }); // empty org with no initial users we work with
    api = await createApiForUser({ impersonateOrgId: organisation.id });
    configureUser = createConfigureUser();
    await configureUser.setRole('su');
  });

  afterAll(disconnectDb);

  const fetchUsersResponse = async () => {
    response = await api.get('/users');
  };

  const fetchUserByIdResponse = async (userId: string) => {
    response = await api.get(`/users/${userId}`);
  };

  const fetchUsersResponseWithCheck = async () => {
    await fetchUsersResponse();
    if (!response.ok) {
      throw new Error(`Failed to fetch users, status: ${response.status}`);
    }
  };

  const mapToExpectResource = ({
    name,
    email,
    role,
    status,
    learner,
  }: UserDocument) => ({
    name,
    email: email.toLowerCase(),
    role,
    status,
    learnerLevel: learner.level,
    createdOn: expect.anything(),
    id: expect.anything(),
    lessonCounts: expect.anything(),
  });

  describe('no users exist, "GET /users"', () => {
    beforeEach(async () => {
      await fetchUsersResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('users exist', () => {
    let user: UserDocument;

    beforeEach(async () => {
      user = await setupExampleUser(organisation);
    });

    describe('on GET "/users"', () => {
      beforeEach(async () => {
        await fetchUsersResponseWithCheck();
      });

      it('should return array of users', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('users should be populated', () => {
        expect(response.body).toEqual([user].map(mapToExpectResource));
      });
    });

    describe('on GET "/users/:userId"', () => {
      describe('valid user id', () => {
        beforeEach(async () => {
          await fetchUserByIdResponse(user.id);
        });

        it('response resource should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(user));
        });
      });

      describe('invalid user id', () => {
        beforeEach(async () => {
          await fetchUserByIdResponse('thereisnone');
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('non existent user id', () => {
        beforeEach(async () => {
          const missingUserId = user.id;
          await user.remove();
          await fetchUserByIdResponse(missingUserId);
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });
    });

    describe.skip('on DELETE "/users/:userId"', () => {
      const fetchDeleteUserByIdResponse = async (userId: string) => {
        response = await api.delete(`/users/${userId}`);
      };

      describe('valid user id', () => {
        beforeEach(async () => {
          await fetchDeleteUserByIdResponse(user.id);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });

        it('user should no longer exist', async () => {
          expect(await User.findById(user.id)).toBeFalsy();
        });
      });

      describe('non existent user id', () => {
        beforeEach(async () => {
          const userId = user.id;
          await user.remove();
          await fetchDeleteUserByIdResponse(userId);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });
      });

      describe('when not in an admin role', () => {
        beforeEach(async () => {
          await configureUser.setRole('member');
          await fetchDeleteUserByIdResponse(user.id);
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });

      describe('when user is in a team', () => {
        beforeEach(async () => {
          // todo
          await fetchDeleteUserByIdResponse(user.id);
        });

        it('response should have 412 status', () => {
          expect(response.status).toBe(412);
        });
      });
    });
  });

  describe('on POST "/users"', () => {
    const fetchCreateResponse = async (body: Record<string, unknown>) => {
      response = await api.post('/users', body);
    };

    describe('invalid payload', () => {
      beforeEach(async () => {
        await fetchCreateResponse({});
      });

      it('response should have 400 status', () => {
        expect(response.status).toBe(400);
      });
    });

    describe('valid payload', () => {
      let validDetails: ReturnType<typeof exampleUserProps>;

      beforeEach(async () => {
        validDetails = exampleUserProps();
        await fetchCreateResponse(validDetails);
      });

      it('response should have 201 status', () => {
        expect(response.status).toBe(201);
      });

      it('response should be populated', () => {
        const { email, ...details } = validDetails;
        expect(response.body).toEqual({
          ...details,
          email: email.toLowerCase(),
          id: expect.anything(),
          createdOn: expect.anything(),
          lessonCounts: expect.anything(),
        });
      });

      it('user should now exist in db on org', async () => {
        const user = await User.findOneByOrganisationAndEmail(
          organisation.id,
          validDetails.email,
        );
        expect(user).toBeDefined();
      });

      describe('when user already exists with same email', () => {
        beforeEach(async () => {
          // a redo from the parent context
          await fetchCreateResponse(validDetails);
        });

        it('response should have 400 status', () => {
          expect(response.status).toBe(400);
        });
      });

      describe('when not in an admin role', () => {
        beforeEach(async () => {
          await configureUser.setRole('member');
          await fetchCreateResponse(validDetails);
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });
      // TODO: higher level status than creating user
    });
  });

  describe('on PUT "/users/{userId}"', () => {
    let userId: string;
    let user: UserDocument;

    const fetchUpdateResponse = async (
      userId: string,
      body: Record<string, unknown>,
    ) => {
      response = await api.put(`/users/${userId}`, body);
    };

    const retrieveUser = async () => {
      const retrievedUser = await User.findById(userId).exec();
      if (!retrievedUser) {
        throw new Error('Tests broken');
      }
      return retrievedUser;
    };

    const createValidUpdatePayload = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...otherProps } = exampleUserProps();
      return { email: user.email, ...otherProps };
    };

    beforeEach(async () => {
      user = await setupExampleUser(organisation);
      userId = user.id;
    });

    describe('invalid payload', () => {
      beforeEach(async () => {
        await fetchUpdateResponse(userId, {});
      });

      it('response should have 400 status', () => {
        expect(response.status).toBe(400);
      });
    });

    describe('valid payload', () => {
      let updatePayload: any;

      beforeEach(async () => {
        updatePayload = createValidUpdatePayload();
        await fetchUpdateResponse(userId, updatePayload);
      });

      it('response should have 200 status', () => {
        expect(response.status).toBe(200);
      });

      it('response should be populated', () => {
        expect(response.body).toEqual({
          name: updatePayload.name,
          email: updatePayload.email,
          status: updatePayload.status,
          role: updatePayload.role,
          learnerLevel: updatePayload.learnerLevel,
          id: userId,
          createdOn: expect.anything(),
          lessonCounts: expect.anything(),
        });
      });

      it('user should be updated', async () => {
        const retrievedUser = await retrieveUser();
        expect(retrievedUser.name).toEqual(updatePayload.name);
        expect(retrievedUser.status).toEqual(updatePayload.status);
        expect(retrievedUser.role).toEqual(updatePayload.role);
        expect(retrievedUser.learner.level).toEqual(updatePayload.learnerLevel);
      });
    });

    // multi-tenancy isolation test
    // TODO: this needs to be cross cutting concern
    describe('when in other org', () => {
      let otherOrgApi: UserApi;

      beforeEach(async () => {
        const otherOrg = await setupTestOrg({ separate: true });
        otherOrgApi = await createApiForUser({
          impersonateOrgId: otherOrg.id,
        });
      });

      describe('deleting user', () => {
        beforeEach(async () => {
          user = await setupExampleUser(organisation); // added in main org
          await configureUser.setRole('su');
          response = await otherOrgApi.delete(`/users/${user.id}`); // delete from other org
        });

        it('should return error', () => {
          expect(response.ok).toBe(false);
        });

        it('should not remove user', async () => {
          expect(await User.findById(user.id).exec()).toBeDefined();
        });
      });
    });
  });

  describe('bulk import', () => {
    type UserProps = ReturnType<typeof exampleUserProps>;

    const fetchBulkImportResponse = async (payload: UserProps[]) => {
      response = await api.post('/users/bulkimport', payload);
    };

    const mapToCreateResource = ({
      name,
      email,
      role,
      status,
      learner,
    }: UserDocument) => ({
      name,
      email: email.toLowerCase(),
      role,
      status,
      learnerLevel: learner.level,
    });

    const canonicalise = ({ email, ...rest }: UserProps) => ({
      email: email.toLowerCase(),
      ...rest,
    });

    const getUsers = async () => {
      const users = await User.find({ _organisation: organisation.id })
        .sort('email')
        .exec();
      return users.map(mapToCreateResource);
    };

    const getUserWithEmail = async (email: string) => {
      const users = await getUsers();
      return users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      );
    };

    describe('set of new users, all valid', () => {
      let newUsers: UserProps[];

      beforeEach(async () => {
        newUsers = [
          exampleUserProps(),
          exampleUserProps(),
          exampleUserProps(),
        ].sort((a, b) => a.email.localeCompare(b.email));
        await fetchBulkImportResponse(newUsers);
      });

      it('response should be 200', () => {
        expect(response.status).toBe(200);
      });

      it('users should have been inserted', async () => {
        expect(await getUsers()).toEqual(newUsers.map(canonicalise));
      });
    });

    describe('set of new users, one fails validation', () => {
      let newUsers: UserProps[];

      beforeEach(async () => {
        const validUser = exampleUserProps();
        const invalidUser = { ...exampleUserProps(), status: 'wfwef' as any };
        newUsers = [validUser, invalidUser];
        await fetchBulkImportResponse(newUsers);
      });

      it('response should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('no users should have been inserted', async () => {
        expect(await getUsers()).toEqual([]);
      });
    });

    describe('set of new users, duplicate emails', () => {
      let newUsers: UserProps[];

      beforeEach(async () => {
        const validUser = exampleUserProps();
        newUsers = [validUser, validUser];
        await fetchBulkImportResponse(newUsers);
      });

      it('response should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('no users should have been inserted', async () => {
        expect(await getUsers()).toEqual([]);
      });
    });

    describe('user exists with same email (same org)', () => {
      let importedUsers: UserProps[];
      let updatedUser: UserProps;

      beforeEach(async () => {
        const existingUser = exampleUserProps();
        await fetchBulkImportResponse([existingUser]);

        updatedUser = {
          ...existingUser,
          learnerLevel: existingUser.learnerLevel + 1,
        };

        importedUsers = [updatedUser, exampleUserProps(), exampleUserProps()];
        await fetchBulkImportResponse(importedUsers);
      });

      it('response should be 200', () => {
        expect(response.status).toBe(200);
      });

      it('existing user should have been updated', async () => {
        expect(await getUserWithEmail(updatedUser.email)).toEqual(
          canonicalise(updatedUser),
        );
      });
    });

    describe('user exists with same email (different org)', () => {
      let originalUser: UserProps;
      let originalOrgId: string;

      beforeEach(async () => {
        originalUser = exampleUserProps();
        await fetchBulkImportResponse([originalUser]);

        // change user to diff org
        const user = await User.findOneByEmail(originalUser.email);
        if (!user) {
          throw new Error('User not created, test error');
        }
        originalOrgId = suOrganisation.id;
        user._organisation = suOrganisation;
        await user.save();

        const updatedUser: UserProps = {
          ...originalUser,
          role: 'su',
          status: 'deactivated',
          name: 'New name',
          learnerLevel: originalUser.learnerLevel + 1,
        };

        await fetchBulkImportResponse([updatedUser, exampleUserProps()]);
      });

      it('response should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('existing user should NOT have been updated', async () => {
        const user = await User.findOneByEmail(originalUser.email);
        if (!user) {
          throw new Error('Test error, user not found.');
        }
        expect(user._organisation.toString()).toEqual(originalOrgId.toString());
        expect(mapToCreateResource(user)).toEqual(canonicalise(originalUser));
      });
    });
  });
});
