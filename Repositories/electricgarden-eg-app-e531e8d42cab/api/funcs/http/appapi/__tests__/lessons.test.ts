import { Lesson, LessonDocument, OrgDocument, Organisation } from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  exampleLesson,
  initDb,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('lessons api', () => {
  let api: UserApi;
  let configureUser: ConfigureUser;
  let organisation: OrgDocument;

  beforeAll(async () => {
    await initDb();
    organisation = (await setupTestTenant()).organisation;
    api = await createApiForUser();
    configureUser = createConfigureUser();
  });

  beforeEach(initDb);

  afterAll(disconnectDb);

  describe('no lessons exist', () => {
    let response: request.Response;

    beforeEach(async () => {
      response = await api.get('/lessons');
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('lessons exist', () => {
    let lesson: LessonDocument;
    let response: request.Response;
    let defaultSectionName: string;

    const getLessonStatus = async () => {
      await fetchLessonResponseWithCheck();
      return response.body[0].status;
    };

    const getLessonSections = async () => {
      await fetchLessonResponseWithCheck();
      return response.body[0].sections;
    };

    const patchLesson = async (body: any) =>
      api.patch(`/lessons/${lesson.name}`, body);

    const setLessonInProgress = (inProgress: boolean) =>
      patchLesson({ inProgress });

    const deleteLessonProgress = async () => api.delete(`/lessons`);

    const completeSection = (name: string = defaultSectionName) =>
      api.put(`/lessons/${lesson.name}/sections/${name}`, {});

    const completeAllSections = async () => {
      for (const { name } of lesson.sections) {
        await completeSection(name);
      }
      const status = await getLessonStatus();
      if (status !== 'completed') {
        throw Error('Completing all sections didnt complete lesson');
      }
    };

    const fetchLessonsResponse = async () => {
      response = await api.get('/lessons');
    };

    const fetchLessonResponseWithCheck = async () => {
      await fetchLessonsResponse();
      if (!response.ok) {
        throw new Error(`Failed to fetch lessons, status: ${response.status}`);
      }
    };

    beforeEach(async () => {
      lesson = new Lesson(exampleLesson);
      await lesson.save();
      await fetchLessonsResponse();
      defaultSectionName = lesson.sections[0].name;
    });

    it('should return array of lessons', () => {
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('lessons should be populated', () => {
      const {
        name,
        title,
        contentPath,
        level,
        categories,
        seasons,
        sections,
      } = lesson;
      expect(response.body[0]).toEqual({
        id: name,
        title,
        contentPath,
        sections: expect.toIncludeSameMembers(
          sections.map(({ name, title }) => ({
            name,
            title,
            completed: false,
          })),
        ),
        level,
        seasons: [...seasons],
        categories: [...categories],
        locked: false,
      });
    });

    describe('higher level lesson', () => {
      let higherLevelLesson: LessonDocument;
      let lessonLevel: number;

      const higherLevelLessionInResponse = () =>
        !!response.body.find((item: any) => item.id === higherLevelLesson.name);

      beforeEach(async () => {
        lessonLevel = 5;
        higherLevelLesson = new Lesson({
          ...exampleLesson,
          name: 'HIGHERLEVEL',
          level: lessonLevel,
        });
        await higherLevelLesson.save();
      });

      describe('user learner level set lower than lesson', () => {
        beforeEach(async () => {
          await configureUser.learner.setLevel(lessonLevel - 1);
          await fetchLessonsResponse();
        });

        it('higher level lesson should NOT be included', () => {
          expect(higherLevelLessionInResponse()).toBe(false);
        });
      });

      describe('user learner level set same as lesson', () => {
        beforeEach(async () => {
          await configureUser.learner.setLevel(lessonLevel);
          await fetchLessonsResponse();
        });

        it('higher level lesson should be included', () => {
          expect(higherLevelLessionInResponse()).toBe(true);
        });
      });

      describe('user learner level set higher than lesson', () => {
        beforeEach(async () => {
          await configureUser.learner.setLevel(lessonLevel + 1);
          await fetchLessonsResponse();
        });

        it('higher level lesson should be included', () => {
          expect(higherLevelLessionInResponse()).toBe(true);
        });
      });
    });

    describe('unpublished lesson', () => {
      let unpublishedLesson: LessonDocument;

      const unpublishedLessionInResponse = () =>
        !!response.body.find((item: any) => item.id === unpublishedLesson.name);

      beforeEach(async () => {
        unpublishedLesson = new Lesson({
          ...exampleLesson,
          name: 'UNPUBLISHED',
          publish: 'localdev',
        });
        await unpublishedLesson.save();
        const originalAppEnv = process.env.APP_ENV;
        process.env.APP_ENV = 'development';
        await fetchLessonsResponse();
        process.env.APP_ENV = originalAppEnv;
      });

      it('should be filtered from response', () => {
        expect(unpublishedLessionInResponse()).toBe(false);
      });
    });

    describe('kiosk lesson', () => {
      const kioskLessionInResponse = () =>
        !!response.body.find((item: any) => item.id === lesson.name);

      const setupKioskMode = async () => {
        await configureUser.setRole('kiosk');
        const org = await Organisation.findById(organisation.id);
        if (!org) {
          throw new Error('bad');
        }
        org.mode = 'kiosk';
        await org.save();

        lesson = new Lesson({
          ...exampleLesson,
          name: 'KIOSK',
          kiosk: true,
        });
        await lesson.save();
      };

      beforeEach(async () => {
        await setupKioskMode();
        await fetchLessonsResponse();
      });

      it('kiosk lesson should be visible', () => {
        expect(kioskLessionInResponse()).toBe(true);
      });

      describe('delete lesson progress while in kiosk org', () => {
        beforeEach(async () => {
          await setLessonInProgress(true);
          await completeAllSections();
          await deleteLessonProgress();
        });

        it('lesson progress should be reset', async () => {
          expect(await getLessonStatus()).toBeUndefined();
        });
      });
    });

    describe('lesson status', () => {
      describe('no status applied', () => {
        it('lesson should have undefined status', async () => {
          expect(await getLessonStatus()).toBeUndefined();
        });
      });

      describe('given status is "completed"', () => {
        beforeEach(async () => {
          await setLessonInProgress(true);
          await completeAllSections();
        });

        it('all sections should be "completed"', async () => {
          const sections = await getLessonSections();
          expect(!!sections.find((section: any) => !section.completed)).toBe(
            false,
          );
        });
      });

      describe('patch status to in progress', () => {
        beforeEach(async () => {
          await setLessonInProgress(true);
        });

        it('lesson should have status in progress', async () => {
          expect(await getLessonStatus()).toBe('in progress');
        });

        describe('delete lesson progress (kiosk) not in kiosk org', () => {
          beforeEach(async () => {
            await deleteLessonProgress();
          });

          it('lesson progress should not be reset', async () => {
            expect(await getLessonStatus()).toBe('in progress');
          });
        });

        describe('then patch in progress off', () => {
          beforeEach(async () => {
            await setLessonInProgress(false);
          });

          it('lesson should not be in progress', async () => {
            expect(await getLessonStatus()).toBeUndefined();
          });
        });

        describe('given status was "completed"', () => {
          beforeEach(async () => {
            await completeAllSections();
            await setLessonInProgress(true);
          });

          it('status should be "in progress"', async () => {
            expect(await getLessonStatus()).toBe('in progress');
          });
        });

        describe('lesson section status', () => {
          const findSectionFromResponse = (name: string) =>
            response.body[0].sections.find(
              (section: any) => section.name === name,
            );

          describe('sections completed', () => {
            let completedSectionName: string;
            let incompleteSectionName: string;

            beforeEach(async () => {
              completedSectionName = lesson.sections[0].name;
              incompleteSectionName = lesson.sections[1].name;
              await completeSection(completedSectionName);
              await fetchLessonsResponse();
            });

            it('completed section should have "completed" true', () => {
              const section = findSectionFromResponse(completedSectionName);
              expect(section.completed).toBe(true);
            });

            it('incompleted section should have "completed" false', () => {
              const section = findSectionFromResponse(incompleteSectionName);
              expect(section.completed).toBe(false);
            });
          });
        });
      });

      describe('patch status to in progress when learner level < lesson level', () => {
        beforeEach(async () => {
          if (!lesson.level) {
            throw new Error('Expected level on example lesson.');
          }
          await configureUser.learner.setLevel(lesson.level - 1);
        });

        it('should return 403 Forbidden status', async () => {
          const response = await setLessonInProgress(true);
          expect(response.status).toBe(403);
        });
      });

      describe('patch status with invalid id', () => {
        it('should return 404 Not Found status', async () => {
          const response = await api.patch('/lessons/invalid', {
            inProgress: true,
          });
          expect(response.status).toBe(404);
        });
      });
    });
  });
});
