import { AppEnv, AppEnvs } from '@eg/doc-db';
import { disconnectDb } from '@eg/test-support';

import {
  ACTING_STAGING_APP_ENV,
  BooleanFromEnv,
  booleanFromEnvCreate,
  getAppEnvIndex,
} from '../appEnv';

describe('appEnv', () => {
  const setAppEnv = (env?: AppEnv) => {
    if (env) {
      process.env.APP_ENV = env;
    } else {
      delete process.env.APP_ENV;
    }
  };

  const APP_ENV_ABOVE_STAGING =
    AppEnvs[AppEnvs.indexOf(ACTING_STAGING_APP_ENV) - 1];

  const APP_ENV_BELOW_STAGING =
    AppEnvs[AppEnvs.indexOf(ACTING_STAGING_APP_ENV) + 1];

  // TODO make this not needed
  afterAll(disconnectDb);

  describe('getAppEnvIndex', () => {
    describe('no app env', () => {
      beforeEach(() => {
        setAppEnv();
      });
      it('should splode', () => {
        expect(() => getAppEnvIndex()).toThrowError();
      });
    });

    describe('when app env = "development"', () => {
      beforeEach(() => {
        setAppEnv('development');
      });

      it('should return correct index', () => {
        expect(getAppEnvIndex()).toBe(AppEnvs.indexOf('development'));
      });
    });
  });

  describe('booleanFromEnv', () => {
    let booleanFromEnv: BooleanFromEnv;

    describe('up', () => {
      beforeEach(() => {
        booleanFromEnv = booleanFromEnvCreate('up');
      });

      it('with app env matching acting staging should be true', () => {
        expect(booleanFromEnv(ACTING_STAGING_APP_ENV)).toBe(true);
      });

      it('with app env above acting staging should be true', () => {
        expect(booleanFromEnv(APP_ENV_ABOVE_STAGING)).toBe(true);
      });

      it('with app env below acting staging should be false', () => {
        expect(booleanFromEnv(APP_ENV_BELOW_STAGING)).toBe(false);
      });
    });

    describe('down', () => {
      beforeEach(() => {
        booleanFromEnv = booleanFromEnvCreate('down');
      });

      it('with app env matching acting staging should be true', () => {
        expect(booleanFromEnv(ACTING_STAGING_APP_ENV)).toBe(true);
      });

      it('with app env above acting staging should be false', () => {
        expect(booleanFromEnv(APP_ENV_ABOVE_STAGING)).toBe(false);
      });

      it('with app env below acting staging should be true', () => {
        expect(booleanFromEnv(APP_ENV_BELOW_STAGING)).toBe(true);
      });
    });
  });
});
