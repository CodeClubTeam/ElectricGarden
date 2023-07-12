import { Lesson, LessonDocument } from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  exampleLesson,
  initDb,
  setupTestTenant,
} from '@eg/test-support';

import { createApiForUser, UserApi } from './helpers';

describe('lesson sections api', () => {
  let api: UserApi;
  let configureUser: ConfigureUser;

  beforeAll(async () => {
    await setupTestTenant();
    api = await createApiForUser();
    configureUser = createConfigureUser();
  });

  afterAll(disconnectDb);

  beforeEach(initDb);

  describe('existing lesson', () => {
    let lesson: LessonDocument;
    let defaultSectionName: string;

    beforeEach(async () => {
      lesson = new Lesson(exampleLesson);
      await lesson.save();
      defaultSectionName = lesson.sections[0].name;
    });

    describe('completing section', () => {
      const completeSection = (name?: string) =>
        api.put(
          `/lessons/${lesson.name}/sections/${name || defaultSectionName}`,
          {},
        );

      const getSection = async (name?: string) => {
        const response = await api.get(
          `/lessons/${lesson.name}/sections/${name || defaultSectionName}`,
        );
        if (!response.ok) {
          throw new Error(
            `Error getting section: ${response.status}. ${response.text}`,
          );
        }
        return response.body as { completed: boolean };
      };

      const getSectionCompleted = async (name?: string) => {
        const section = await getSection(name);
        return section.completed;
      };

      describe('lesson not in progress', () => {
        it('should error with 409 Conflict', async () => {
          const response = await completeSection();
          expect(response.status).toBe(409);
        });
      });

      describe('lesson in progress', () => {
        beforeEach(async () => {
          await api.patch(`/lessons/${lesson.name}`, { inProgress: true });
        });

        it('section completed should be false', async () => {
          expect(await getSectionCompleted()).toBe(false);
        });

        describe('then lesson completed', () => {
          beforeEach(async () => {
            await completeSection();
          });

          it('section completed should be true', async () => {
            expect(await getSectionCompleted()).toBe(true);
          });
        });

        describe('then all lessons completed', () => {
          beforeEach(async () => {
            for (const { name } of lesson.sections) {
              await completeSection(name);
            }
          });

          it('lesson completed should be true', async () => {
            const response = await api.get('/lessons');
            const updatedLesson = response.body[0];
            expect(updatedLesson.status).toBe('completed');
          });
        });
      });

      describe('complete section when learner level < lesson level', () => {
        beforeEach(async () => {
          if (!lesson.level) {
            throw new Error('Expected level on example lesson.');
          }
          await configureUser.learner.setLevel(lesson.level - 1);
        });

        it('should return 403 Forbidden status', async () => {
          const response = await completeSection();
          expect(response.status).toBe(403);
        });
      });

      describe('complete section with invalid lesson id', () => {
        it('should return 404 Not Found status', async () => {
          const response = await api.put(
            `/lessons/waefwaf/sections/${defaultSectionName}`,
            {},
          );
          expect(response.status).toBe(404);
        });
      });

      describe('complete section with invalid section name', () => {
        it('should return 404 Not Found status', async () => {
          const response = await completeSection('awefawg');
          expect(response.status).toBe(404);
        });
      });
    });
  });
});
