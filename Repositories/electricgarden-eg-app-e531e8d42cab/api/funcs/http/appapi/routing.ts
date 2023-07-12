import express, { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as organisationApi from './routes/organisation';
import * as dataApi from './routes/sensorData';
import * as sensorApi from './routes/sensorNode';
import * as suSensorApi from './routes/suSensor';
import * as teamApi from './routes/team';
import * as userApi from './routes/user';
import * as lessonsApi from './routes/lessons';
import * as lessonSectionsApi from './routes/lessonSections';
import * as growablesApi from './routes/growables';
import * as growerApi from './routes/grower';
import * as observationsApi from './routes/observations';
import * as assetsApi from './routes/assets';
import * as growableTypesApi from './routes/growableTypes';
import * as thingsApi from './routes/things';
import * as goldilocksRulesApi from './routes/goldilocksRules';
import { AppRequestHandler } from './typings';
import { canHaveRole } from './utils/util';

export const api = express.Router();

// Permissions check (should be in a middleware file)
const verifyRequiredRole = (handler: AppRequestHandler): RequestHandler => (
  req,
  res,
  next,
) => {
  //check func.requiredRole against user.role - order is as config.user.roles
  if (!req.user || !canHaveRole(req.user.role, handler.requiredRole)) {
    res.status(401).json({
      error: 'You do not have permission to use this functionality',
    });
    return;
  }
  // TODO: Add "last login" update (might be a different function)
  return handler(req, res, next);
};

const authorizedAsync = (handler: AppRequestHandler) =>
  asyncHandler(verifyRequiredRole(handler));

api.get('/users', authorizedAsync(userApi.getList));
api.post('/users', authorizedAsync(userApi.create));
// api.get('/users/apikey', middleware(userApi.getApiKey));
// api.patch('/users/apikey', middleware(userApi.newApiKey));
// api.delete('/users/apikey', middleware(userApi.removeApiKey));
api.get('/users/:userId', authorizedAsync(userApi.getSingleById));
api.put('/users/:userId', authorizedAsync(userApi.update));
api.post('/users/bulkimport', authorizedAsync(userApi.bulkImport));
api.post(
  '/users/clearlessonprogress',
  authorizedAsync(userApi.clearLessonProgress),
);

api.get('/organisations/stats', authorizedAsync(organisationApi.stats));
api.get(
  '/organisations/:orgId',
  authorizedAsync(organisationApi.getSingleById),
);
api.get('/organisations', authorizedAsync(organisationApi.getList));
api.post('/organisations', authorizedAsync(organisationApi.create));
api.put('/organisations/:orgId', authorizedAsync(organisationApi.update));
api.delete('/organisations/:orgId', authorizedAsync(organisationApi.remove));

api.get('/team/:teamId', authorizedAsync(teamApi.getSingleById));
api.post('/team', authorizedAsync(teamApi.create));
api.put('/team/:teamId', authorizedAsync(teamApi.update));
api.delete('/team/:teamId', authorizedAsync(teamApi.remove));
api.get('/team', authorizedAsync(teamApi.getList));

// api.get('/sensor/list_from_data', authorizedAsync(dataApi.getNodesFromData));

api.get('/admin/sensor/list/all', authorizedAsync(suSensorApi.getList));
api.post('/admin/sensor/list/all', authorizedAsync(suSensorApi.getList));
api.put('/admin/sensors/:serial', authorizedAsync(suSensorApi.assign));
api.post('/admin/sensors', authorizedAsync(suSensorApi.post));

api.get('/sensors/:nodeId/data', authorizedAsync(dataApi.getDataByNode));
api.post('/sensors/:nodeId/data', authorizedAsync(dataApi.getDataByNode));

api.get('/sensors/:serial', authorizedAsync(sensorApi.getBySerial));
api.get('/sensors', authorizedAsync(sensorApi.getList));

api.delete(
  '/sensors/:serial/livedata',
  authorizedAsync(dataApi.deleteLiveData),
);

api.get('/things', authorizedAsync(thingsApi.getAll));

api.put(
  '/lessons/:lessonId/sections/:sectionName',
  authorizedAsync(lessonSectionsApi.completeSection),
);
api.get(
  '/lessons/:lessonId/sections/:sectionName',
  authorizedAsync(lessonSectionsApi.getSection),
);
api.get('/lessons', authorizedAsync(lessonsApi.getList));
api.patch('/lessons/:id', authorizedAsync(lessonsApi.patch));
api.delete('/lessons', authorizedAsync(lessonsApi.clearAllLessonProgress));

api.get(
  '/growables/:growableId/goldilocks-rules',
  authorizedAsync(goldilocksRulesApi.getList),
);
api.post(
  '/growables/:growableId/goldilocks-rules',
  authorizedAsync(goldilocksRulesApi.create),
);

api.get('/growables', authorizedAsync(growablesApi.getList));
api.get('/growables/:growableId', authorizedAsync(growablesApi.getSingleById));
api.post('/growables', authorizedAsync(growablesApi.create));
api.patch('/growables/:growableId', authorizedAsync(growablesApi.update));
api.delete('/growables/:growableId', authorizedAsync(growablesApi.remove));

api.get('/grower', authorizedAsync(growerApi.get));

api.post('/assets', authorizedAsync(assetsApi.create));
api.get('/assets/:assetId/url', authorizedAsync(assetsApi.getUrl));
api.get('/assets/:assetId', authorizedAsync(assetsApi.get));

api.get(
  '/observations/:growableId/:id',
  authorizedAsync(observationsApi.getById),
);
api.get(
  '/observations/:growableId',
  authorizedAsync(observationsApi.getListByGrowable),
);

api.post('/observations/:growableId', authorizedAsync(observationsApi.create));
api.delete(
  '/observations/:growableId/:id',
  authorizedAsync(observationsApi.remove),
);

api.get('/growabletypes', authorizedAsync(growableTypesApi.getAll));

api.get(
  '*',
  authorizedAsync((req, res) => {
    req.logger.warn(`Route not matched: ${req.path}`);
    res.status(404).send('Empty plot. 404 just weeds waiting to come up.');
  }),
);
