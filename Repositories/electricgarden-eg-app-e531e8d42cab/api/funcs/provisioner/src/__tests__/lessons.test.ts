import { ACTING_STAGING_APP_ENV, getRequiredConfig } from '@eg/core';
import { Lesson, LessonDocument } from '@eg/doc-db';
import { disconnectDb } from '@eg/test-support';
import request from 'supertest';
import type { LessonResource } from '../routes/lessons';

import { del, get, put } from './helpers';

const exampleLesson: LessonResource = {
  name: 'my lesson',
  title: 'My Lessson',
  sections: [
    { name: 'part-1', title: 'Part 1' },
    { name: 'part-2', title: 'Part 2' },
  ],
  level: 2,
  contentPath: 'my-lesson',
  seasons: ['spring', 'whenua'],
  categories: ['temp'],
  ordinal: 2,
  publish: 'localdev',
};

describe('lessons api', () => {
  afterAll(disconnectDb);

  beforeEach(async () => {
    await Lesson.deleteMany({});
  });

  describe('fetching lessons', () => {
    describe('no lessons exist', () => {
      let response: request.Response;

      beforeEach(async () => {
        response = await get('/lessons');
      });

      it('should have empty array response', () => {
        expect(response.body).toEqual([]);
      });
    });

    describe('lessons exist', () => {
      let lesson: LessonDocument;
      let response: request.Response;

      beforeEach(async () => {
        lesson = new Lesson(exampleLesson);
        await lesson.save();
        response = await get('/lessons');
      });

      it('should return array of lessons', () => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
      });

      it('lessons should be populated', () => {
        const {
          name,
          title,
          contentPath,
          level,
          categories,
          seasons,
          publish,
          sections,
          ordinal,
        } = lesson;
        expect(response.body[0]).toEqual({
          name,
          title,
          contentPath,
          level,
          categories: [...categories],
          seasons: [...seasons],
          publish,
          sections: expect.toIncludeSameMembers(
            sections.map(({ name, title }) => ({ name, title })),
          ),
          ordinal,
        });
      });
    });
  });

  describe('creating lessons', () => {
    describe('valid lesson', () => {
      beforeEach(async () => {
        await put(`/lessons/${exampleLesson.name}`, exampleLesson).expect(204);
      });

      afterEach(async () => {
        await Lesson.deleteOne({ name: exampleLesson.name });
      });

      it('should insert lesson', async () => {
        const lesson = await Lesson.findOneByName(exampleLesson.name);
        expect(lesson).toBeDefined();
      });
    });

    describe('valid lesson, no ordinal', () => {
      let lesson: LessonDocument | undefined;
      let noOrdinalLesson: any;

      beforeEach(async () => {
        noOrdinalLesson = { ...exampleLesson };
        delete noOrdinalLesson.ordinal;
        await put(`/lessons/${noOrdinalLesson.name}`, noOrdinalLesson).expect(
          204,
        );

        lesson = await Lesson.findOneByName(noOrdinalLesson.name);
      });

      afterEach(async () => {
        await Lesson.deleteOne({ name: noOrdinalLesson.name });
      });

      it('should insert lesson', async () => {
        expect(lesson).toBeDefined();
      });

      it('first lesson should have ordinal set to 1', () => {
        if (lesson) {
          expect(lesson.ordinal).toBe(1);
        }
      });

      describe('second lesson, no ordinal', () => {
        let noOrdinalLesson2: any;

        beforeEach(async () => {
          noOrdinalLesson2 = { ...exampleLesson, name: 'awefawgagg' };
          delete noOrdinalLesson2.ordinal;
          await put(
            `/lessons/${noOrdinalLesson2.name}`,
            noOrdinalLesson2,
          ).expect(204);

          lesson = await Lesson.findOneByName(noOrdinalLesson2.name);
        });

        afterEach(async () => {
          await Lesson.deleteOne({ name: noOrdinalLesson2.name });
        });

        it('second lesson should have ordinal set to 2', () => {
          if (lesson) {
            expect(lesson.ordinal).toBe(2);
          }
        });

        describe('update same lesson, no ordinal', () => {
          beforeEach(async () => {
            await put(
              `/lessons/${noOrdinalLesson2.name}`,
              noOrdinalLesson2,
            ).expect(204);

            lesson = await Lesson.findOneByName(noOrdinalLesson2.name);
          });

          it('lesson should still have ordinal set to 2', () => {
            if (lesson) {
              expect(lesson.ordinal).toBe(2);
            }
          });
        });
      });
    });

    describe('updating access', () => {
      let submittedLesson: LessonResource;
      let updatedLesson: LessonDocument | undefined;

      describe('initial with publish false and locked true', () => {
        beforeEach(async () => {
          submittedLesson = { ...exampleLesson, locked: true, publish: false };
          await put(`/lessons/${submittedLesson.name}`, submittedLesson);
          updatedLesson = await Lesson.findOneByName(submittedLesson.name);
        });

        it('initial lesson should have locked set to active staging env', () => {
          expect(updatedLesson?.locked).toBe(ACTING_STAGING_APP_ENV);
        });

        it('initial lesson should have publish set to localdev', () => {
          expect(updatedLesson?.publish).toBe('localdev');
        });

        describe('setting locked to false and publish to true', () => {
          beforeEach(async () => {
            submittedLesson = {
              ...submittedLesson,
              locked: false,
              publish: true,
            };
            await put(`/lessons/${submittedLesson.name}`, submittedLesson);
            updatedLesson = await Lesson.findOneByName(submittedLesson.name);
          });

          it('lesson should have locked set to undefined', () => {
            expect(updatedLesson?.locked).toBeNull();
          });

          it('initial lesson should have publish set to production', () => {
            expect(updatedLesson?.publish).toBe('production');
          });
        });

        describe('setting locked to test and publish to test', () => {
          beforeEach(async () => {
            submittedLesson = {
              ...submittedLesson,
              locked: 'test',
              publish: 'test',
            };
            await put(`/lessons/${submittedLesson.name}`, submittedLesson);
            updatedLesson = await Lesson.findOneByName(submittedLesson.name);
          });

          it('lesson should have locked set to test', () => {
            expect(updatedLesson?.locked).toBe('test');
          });

          it('initial lesson should have publish set to test', () => {
            expect(updatedLesson?.publish).toBe('test');
          });
        });
      });
    });

    describe('invalid lesson', () => {
      const name = 'awefawf';
      let response: request.Response;

      beforeEach(async () => {
        response = await put(`/lessons/${name}`, {
          ...exampleLesson,
          name,
          title: '',
        });
      });

      it('should return 400 status', async () => {
        expect(response.status).toBe(400);
      });

      it('should return errors array status', async () => {
        expect(response.body).toEqual({
          validationErrors: [expect.stringContaining('title')],
        });
      });
      it('should not insert lesson', async () => {
        const lesson = await Lesson.findOneByName(name);
        expect(lesson).toBeNull();
      });
    });
  });

  describe('deleting lessons', () => {
    let response: request.Response;
    let lesson: LessonDocument;

    const deleteLesson = async (lesson: LessonDocument) => {
      response = await del(`/lessons/${lesson.name}`);
    };

    describe('lesson exists', () => {
      beforeEach(async () => {
        lesson = new Lesson(exampleLesson);
        await lesson.save();
        await deleteLesson(lesson);
      });

      it('lesson should no longer exist', async () => {
        expect(await Lesson.findById(lesson.id)).toBeNull();
      });

      it('should have 204 response', async () => {
        expect(response.status).toBe(204);
      });
    });

    describe('lesson does not exist', () => {
      beforeEach(async () => {
        lesson = new Lesson(exampleLesson);
        await lesson.save(); // save to get an id
        await Lesson.deleteOne(lesson);
        await deleteLesson(lesson);
      });

      it('should have 204 response', async () => {
        expect(response.status).toBe(204);
      });
    });
  });
});
